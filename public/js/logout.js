const logoutButton = document.getElementById("logout")

logoutButton.addEventListener("click", async() => {
    try {
        const response = await fetch("/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json(); 

        if (response.ok) {
            localStorage.removeItem("token");
            
            window.location.href = "/";
        } else {
            alert(data.error || "Ошибка");
        }
        
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
    }
})