import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
import { supabase } from "./lib/supabase.js";
import bcrypt from "bcrypt";
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(express.static(path.join(process.cwd(), "components")))
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/', express.static(path.join(__dirname, '..', 'public')));

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.token;
                
        if (!token) {
            return res.status(401).json({ error: "Invalid token format" });
        }
        
        const payload = Buffer.from(token, 'base64').toString('utf8');
        
        req.userId = payload;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        }
        
        return res.status(401).json({ error: "Invalid token" });
    }
};

app.post("/auth/register", async (req, res) => {
  const { name, lastname, email, gender, city, birthdate, password } = req.body;

  try {
    const { data: checkExists, error: checkError } = await supabase
      .rpc('check_email_exists', { email_to_check: email });
    
    if (checkExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          lastname: lastname,
          gender: gender,
          city: city,
          birthdate: birthdate,
          created_at: new Date().toISOString(),
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: "Failed to create user" });
    }



    return res.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        lastname: lastname
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      return res.status(401).json({ message: error.message });
    }

    if (!data.user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';

    const token = Buffer.from(data.user.id).toString('base64');

    return res.json({
      success: true,
      token: token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userName,
        emailConfirmed: data.user.email_confirmed_at ? true : false,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put('/api/user/profile', authenticate, async (req, res) => {
  try {
    const { city, birthdate, gender} = req.body;
    const userId = req.userId;
    
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) throw userError;
    
    const currentMetadata = user.user_metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      city: city || currentMetadata.city,
      birthdate: birthdate || currentMetadata.birthdate,
      gender: gender || currentMetadata.gender,
    };
    
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: updatedMetadata }
    );
    
    if (updateError) throw updateError;
    
    
    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        user_metadata: updatedUser.user.user_metadata
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/auth/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signOut error:', error);
    }
    
    return res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/user/me", authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) throw authError;
    
    const fullUserData = {
      email: user.email,
      userName: user.user_metadata.name,
      userLastname: user.user_metadata.lastname,
      userCity: user.user_metadata.city,
      userBirthdate: user.user_metadata.birthdate,
      userGender: user.user_metadata.gender
    };
    
    res.json(fullUserData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/reviews", authenticate, async (req, res) => {
  const { company, rating, pros, cons } = req.body;
  
  try {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.userId, 
        company: company,
        rating: rating,
        pros: pros,
        cons: cons
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: "Отзыв успешно добавлен",
      review: review
    });
    
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/getreviews', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews_with_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      count: reviews?.length || 0,
      reviews: reviews || []
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/reviews/:company', async (req, res) => {
  const { company } = req.params;
  
  try {
    let query = supabase
      .from('reviews_with_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (company && company !== 'all') {
      query = query.eq('company', company);
    }
    
    const { data: reviews, error } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      count: reviews?.length || 0,
      reviews: reviews || []
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'main', 'main.html'))
})

app.get('/review', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'review', 'review.html'))
})

app.get('/analysis', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'analysis', 'analysis.html'))
})

app.get('/registration', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'reg', 'reg.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'login', 'login.html'))
})

app.get('/profile', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'profile', 'profile.html'))
})

app.get('/faq', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'components', 'faq', 'faq.html'))
})

app.listen(process.env.PORT, () => {
  console.log("server started");
});

