if (localStorage.getItem("token")) {
    const headerRight = document.querySelector(".header-right");
    
    if (headerRight) {
        const loginBtn = headerRight.querySelector(".login-btn[href='/login']");
        if (loginBtn) {
            loginBtn.style.display = "none";
        }
        
        const profileBtn = headerRight.querySelector(".login-btn[href='/profile']");
        if (profileBtn) {
            profileBtn.style.display = "inline-block";
        }
    }
}
else{
    const headerRight = document.querySelector(".header-right");
    
    if (headerRight) {
        const loginBtn = headerRight.querySelector(".login-btn[href='/login']");
        if (loginBtn) {
            loginBtn.style.display = "block";
        }
        
        const profileBtn = headerRight.querySelector(".login-btn[href='/profile']");
        if (profileBtn) {
            profileBtn.style.display = "none";
        }
    }
}