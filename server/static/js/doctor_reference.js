const reference_form = document.getElementById("reference-form")
const notification = document.getElementById("notification");
var reference = document.getElementById("reference");

localStorage.removeItem("edit_reference")
console.log(localStorage)

reference_form.addEventListener("submit", (e)=>{
    e.preventDefault()
    
    fetch("/api/v1/reference/" + reference.value)
    .then(response => response.json())
    .then(data => {
        if (data.status == "404") {
            return notification.innerHTML = "El folio ingresado no existe"
        }
        notification.innerHTML = ""
        localStorage.setItem("edit_reference", data.reference.reference_id)
        window.location.href = "/doctor-tools/panel-reference"
    })
    .catch(err => {
        alert("Hubo un error al ingresar el folio")
    })
})