const notification = document.getElementById("notification")
const form = document.querySelector("#sign-in-form")
form.addEventListener("submit", (e) => {
    e.preventDefault()

    const user = document.getElementById("user").value
    const pwd = document.getElementById("pwd").value

    fetch("/api/v1/login/"+user+"?pwd="+pwd)
    .then(response => response.json())
    .then(data => {
        if (data.status == "404") {
            notification.innerHTML = "El usuario no se encuentra registrado"
            return
        } else if (data.status == "401") {
            notification.innerHTML = "Contraseña incorrecta"
            return
        }
        notification.innerHTML = ""
        localStorage.setItem("user_logged", user)
        window.location.href = "/home"
    })

    .catch(err => {
        console.log("error", err)
    })
})