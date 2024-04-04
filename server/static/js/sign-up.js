const form = document.querySelector("#sign-up-form")
const notification = document.querySelector("#notification")

const error = (msg) => {
    notification.innerHTML = msg
}

form.addEventListener("submit", (e)=>{
    e.preventDefault()

    const user_data = {
        "user_name": document.getElementById("user_name").value,
        "user_lastname": document.getElementById("user_lastname").value,
        "user_birth": document.getElementById("user_birth").value,
        "user_email":  document.getElementById("user_email").value,
        "user_phone":  document.getElementById("user_phone").value,
        "user_phone_confirm":  document.getElementById("user_phone_confirm").value,
        "pwd":  document.getElementById("pwd").value,
        "pwd_confirm":  document.getElementById("pwd_confirm").value
    }
    
    const traductions = {
        "user_name": "nombre de usuario",
        "user_lastname": "apellido de usuario",
        "user_birth": "fecha de nacimiento del usuario",
        "user_email": "correo de usuario",
        "user_phone": "telefono de usuario",
        "pwd": "contraseña de usuario"
    }
    
    for (let user_info in user_data) {
        if (user_data[user_info].replace(/\s+/g, '') == "") {
            error("El campo de " + traductions[user_info] + " está vacío")
            return
        }
    }

    if (user_data.user_phone != user_data.user_phone_confirm) {
        return error("Los numeros telefónicos no coinciden")
    }

    if (user_data.pwd != user_data.pwd_confirm) {
        return error("Las contraseñas no coinciden")
    }
    
    delete user_data.pwd_confirm
    delete user_data.user_phone_confirm

    const http_config = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_data)
    }

    fetch("/api/v1/create-user", http_config)
    .then(response => {
        localStorage.setItem("user_logged", user_data.user_email)
        window.location.href = "/home"
    })
    .catch(err => {
        error("Hubo un error al registrarse inténtelo más tarde")
    })
    console.log(user_data)
})