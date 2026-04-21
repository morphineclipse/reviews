const token = localStorage.getItem("token");

const name= document.getElementById("name")
const email = document.getElementById('email')
const city = document.getElementById("city")
const birthdate = document.getElementById('birthdate')
const female = document.getElementById("female")
const male = document.getElementById('male')
const genderRadios = document.querySelectorAll('input[name="gender"]');
const form = document.getElementById("form")

async function getData() {
    try {
        const response = await fetch("/user/me", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": `${token}`
            }
        });

        const data = await response.json(); 

        if (response.ok) {
            name.innerText = data.userName
            email.value = data.email
            city.value = data.userCity
            birthdate.value = data.userBirthdate
            if(data.userGender === "female"){
                female.checked = true
            }
            else{
                male.checked = true
            }
        } else {
            alert(data.error || "Ошибка получения данных");
        }
        
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
    }   
}

getData();

async function updateUserProfile(e) {
    e.preventDefault();
  try {
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const cityInput = document.getElementById('city');
    const birthdateInput = document.getElementById('birthdate');
    
    let selectedGender = null;
    genderRadios.forEach(radio => {
      if (radio.checked) {
        selectedGender = radio.value;
      }
    });
    
    const token = localStorage.getItem('token');
    
    if (!selectedGender) {
      alert('Пожалуйста, выберите пол');
      return null;
    }
    
    if (!cityInput.value) {
      alert('Пожалуйста, введите город');
      return null;
    }
    
    if (!birthdateInput.value) {
      alert('Пожалуйста, введите дату рождения');
      return null;
    }
    
    const profileData = {
      city: cityInput.value,
      birthdate: birthdateInput.value,
      gender: selectedGender,
    };
    
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Token': token 
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Профиль обновлен:', data);
      alert('Данные успешно обновлены');
      return data;
    } else {
      console.error('Ошибка:', data.error);
      alert(data.error || 'Ошибка при обновлении');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ошибка сервера');
    return null;
  }
}

form.addEventListener("submit",(e) => updateUserProfile(e))