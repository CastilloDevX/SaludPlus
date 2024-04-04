const log_out = document.getElementById("log-out")
const ultrasounds = document.getElementById("ultrasounds")
const ultrasound_schedule = document.getElementById("schedule-ultrasounds")
const ultrasound_btns = document.getElementById("ultrasounds-btns")

const examination_type_wrapper = document.getElementById("examination_type")
const schedule_submit = document.getElementById("submit")
const notification = document.getElementById("notification")

const eye_icon = "/static/img/eye-icon.svg"
const document_icon = "/static/img/document-icon.svg"

const examination_types = [
    "ULTRASONIDO 4D",
    "ULTRASONIDO 4D CON USB",
    "ULTRASONIDO ABDOMINAL GENERAL HOMBRE",
    "ULTRASONIDO ABDOMINAL GENERAL MUJER",
    "ULTRASONIDO ABDOMINAL INFERIOR MUJER",
    "ULTRASONIDO ABDOMINAL SUPERIOR",
    "ULTRASONIDO APENDICULAR",
    "ULTRASONIDO DE PARTES BLANDAS",
    "ULTRASONIDO DE PROSTATA",
    "ULTRASONIDO HIGADO Y VIAS BILIARES",
    "ULTRASONIDO HOMBRO MUSCULO TENDINOSO",
    "ULTRASONIDO MAMARIO",
    "ULTRASONIDO OBSTETRICO TRIM I",
    "ULTRASONIDO OBSTETRICO TRIM II Y III",
    "ULTRASONIDO RENAL Y DE VIAS URINARIAS",
    "ULTRASONIDO RODILLA MUSCULO TENDINOSO",
    "ULTRASONIDO TESTICULAR",
    "ULTRASONIDO TIROIDES-CUELLO",
    "ULTRASONIDO TRANSVAGINAL"
]

examination_types.forEach(element => {
    examination_type_wrapper.innerHTML += `<option value="${element}">${element}</option>`
})

const create_ultrasound_btn = (folio, type, examination_day, report_source) => {
    let img = document_icon
    let button_class = "ultrasound-unavailable"
    let p_detail = "Documento no disponible"

    if (report_source) {
        img = eye_icon
        button_class = "ultrasound-btn-options"
        p_detail = "Ver detalles"
    }

    return `<div class="ultrasound-btn">
        <div class="ultrasound-info">
            <h2>${type}</h2>
            <p>Fecha de aplicación: <span>${examination_day}</span></p>
            <p>Folio: <span>${folio}</span></p>
        </div>

        <div class="${button_class}">
            <button class="ultrasound-details-btn" id="${folio}">
                <img src="${img}" alt="">
                <p>${p_detail}</p>
            </button>
        </div>
    </div>`
}
const examination_date_error = (err) => {
    return notification.innerHTML = err
}
const btns = {
    "my-ultrasounds" : {
        "btn": document.getElementById("my-ultrasounds-btn"),
        "wrapper": document.getElementById("ultrasounds")
    },
    "schedule-ultrasounds" : {
        "btn":document.getElementById("schedule-ultrasounds-btn"),
        "wrapper": document.getElementById("schedule-ultrasound")
    }
}

log_out.addEventListener("click", ()=> {
    localStorage.removeItem("user_logged")
    window.location.href = "/"
})

schedule_submit.addEventListener("click", ()=>{
    let examination_type = document.getElementById("examination_type").value
    let examination_date = document.getElementById("date").value
    let examination_date_time = document.getElementById("time").value

    if (examination_type == "") {
        return examination_date_error("Selecciona un tipo de ultrasonido")
    }
    if (examination_date == "") {
        return examination_date_error("Selecciona una fecha para tu cita")
    }
    if (examination_date_time == "") {
        return examination_date_error("Selecciona una hora en especial para tu cita")
    }
    
    examination_date_error("")

    const examination_data = {
        "examination_type":examination_type,
        "examination_date":`${examination_date} - ${examination_date_time}`,
        "patient_email":localStorage.getItem("user_logged")
    }

    const http_config = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(examination_data)
    }

    fetch("/api/v1/register-reference/",http_config)
    .then(res => res.json())
    .then(data => {
        window.location.href = "/home"
    })
    .catch(err => {
        console.err(err)
        alert("Hubo un error al establecer su cita")
    })
})

const select = (id_selected) => {
    for(btn_id in btns) {
        let class_to_add_btn = "option_no_selected"
        let class_to_remove_btn = "option_selected"

        let class_to_add_wrapper = "no-view-option-selected"
        let class_to_remove_wrapper = "view-option-selected"

        if (btn_id == id_selected) {
            class_to_add_btn = "option_selected"
            class_to_remove_btn = "option_no_selected"
            class_to_add_wrapper = "view-option-selected"
            class_to_remove_wrapper = "no-view-option-selected"
        }

        btns[btn_id]["btn"].classList.add(class_to_add_btn)
        btns[btn_id]["btn"].classList.remove(class_to_remove_btn)

        btns[btn_id]["wrapper"].classList.add(class_to_add_wrapper)
        btns[btn_id]["wrapper"].classList.remove(class_to_remove_wrapper)
    }
}
select("my-ultrasounds") // Default seletion

btns["my-ultrasounds"]["btn"].addEventListener("click", () => {
    select("my-ultrasounds")
})
btns["schedule-ultrasounds"]["btn"].addEventListener("click", () => {
    select("schedule-ultrasounds")
})

fetch("/api/v1/get-references/" + localStorage.getItem("user_logged"))
.then(response => response.json())
.then(data => {
    // LOAD USER DATA
    const user_name = document.getElementById("user_name")
    const user_age = document.getElementById("user_age")
    const user_birth = document.getElementById("user_birth")
    const user_phone = document.getElementById("user_phone")
    const user_email = document.getElementById("user_email")

    user_name.innerHTML = data.user.user_name + " " +data.user.user_lastname
    user_age.innerHTML = data.user.user_age
    user_birth.innerHTML = data.user.user_birth
    user_phone.innerHTML = data.user.user_phone
    user_email.innerHTML = data.user.user_email

    // LOAD ULTRASOUNDS
    if (data.references.length == 0) {
        return ultrasound_btns.innerHTML = "No tienes un ultrasonido programado o registrado"
    }

    data.references.forEach(ultrasound_registred => {
        ultrasound_btns.innerHTML += create_ultrasound_btn(
            ultrasound_registred.reference_id,
            ultrasound_registred.examination_type,
            ultrasound_registred.examination_date,
            ultrasound_registred.report_source
        )
    });

    let details_bts = document.querySelectorAll(".ultrasound-btn-options")

    details_bts.forEach(element => {
        element.addEventListener("click", () => {
            let id = element.querySelector(".ultrasound-details-btn").getAttribute("id")
            window.location.href = "/ultrasound/"+id
        })
    })
})
.catch(err => {
    alert("Ha ocurrido un error al cargar la página, verifique su conexión");
    console.error(err);
})