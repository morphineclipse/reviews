const form = document.getElementById("reg-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const lastName = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const gender = document.getElementById("gender").value
    const city = document.getElementById("city").value
    const birthdate = document.getElementById("birthdate").value
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password_confirm").value;

    if (password.length <= 7){
        alert("Пароль меньше 8 символов")
        return
    }

    if (password !== confirmPassword) {
        alert("Пароли не совпадают");
        return;
    }

    try {
        const response = await fetch('/auth/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                lastName,
                email,
                gender,
                city,
                birthdate,
                password
            })
        });

        const data = await response.json();
        console.log(data);
        window.location.replace('/login')        

    } catch (error) {
        console.error(error);
        alert("Ошибка сервера");
    }
});