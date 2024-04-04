const reference = localStorage.getItem("edit_reference")
if (reference == null) { window.location.href = "/doctor-tools/reference" }

const patient_name = document.getElementById("patient_name")
const examination_type = document.getElementById("examination_type")
const examination_date = document.getElementById("examination_date")
const global_form = document.getElementById("global-form")

const video = document.getElementById("upload-video-field")
const report = document.getElementById("upload-report-format")
const close_record_options = document.getElementById("close_record_options")

const completed_all_btn = document.getElementById("completed-all")
const recording_options_frame = document.getElementById("recording-video")
const video_options_frame = document.getElementById("video-options")
const record_available_btn = document.getElementById("record-available-btn")

const modal_notifications = document.getElementById("modal-notifications")
const notification_title = document.getElementById("notification-title")
const notification_desc = document.getElementById("notification-desc")
const notification_options = document.getElementById("notification-options")

const recording_options_btns = {
    "telesonography" : document.getElementById("telesonography-segurity"),
    "start-recording" : document.getElementById("start-recording"),
    "stop-recording" : document.getElementById("stop-recording")
}

const verifly_files = (input, source_type, type) => {
    const file = input.files[0];
    const notification = document.getElementById(input.id + "-notification")
    notification.style = "color: red"

    if (type == "MP4") {
        notification.style = "color: rgb(255, 175, 0)"
    }

    if (!file) {
        notification.innerHTML = "No existe ningun documento"
        return null
    }

    if (file.type != source_type) {
        notification.innerHTML = "El archivo no es " + type
        return null
    }

    notification.style = "color: #0BAA00"
    notification.innerHTML = file.name + " cargado existosamente"

    return file
}

const create_modal_notification = (notification_body = {
    "title":"",
    "description": "",
    "options": [
        {
            "title":"",
            "action": ()=> {}
        } // Default properties
    ]
}) => {
    modal_notifications.classList.add("active-notification")
    modal_notifications.classList.remove("unactive-notification")

    notification_title.innerHTML = notification_body.title
    notification_desc.innerHTML = notification_body.description

    notification_options.innerHTML = ""

    for (let i=0; i < notification_body.options.length; i++) {
        notification_options.innerHTML += `
        <a class="option-btn" id="option-${i}">
            ${notification_body.options[i].title}
        </a>`
    }

    document.querySelectorAll(".option-btn").forEach((e) => {
        e.addEventListener("click", ()=>{
            const option_reference = e.id.replace("option-", "")
            notification_body.options[option_reference].action()

            modal_notifications.classList.remove("active-notification")
            modal_notifications.classList.add("unactive-notification")
        })
    })
}

recording_options_btns["start-recording"].addEventListener("click", ()=>{
    create_modal_notification({
        "title":"¿Deseas compartir tu grabación?",
        "description": "Esta opcion permite activar la telesonografía lo que permite ver el ultrasonido de forma remota",
        "options": [
            {
                "title":"Sí, deseo compartir mi grabación",
                "action": ()=> {console.log("e")}
            },
            {
                "title":"No, empezar mi grabación sin compartir",
                "action": ()=> {console.log("other")}
            },
    ]})
})

recording_options_btns["start-recording"].addEventListener("click", ()=>{
    console.log("Fetch para hacer Stop")
})

close_record_options.addEventListener("click", (e) => {
    video_options_frame.style = "display: block"
    recording_options_frame.style = "display: none"
})

record_available_btn.addEventListener("click", () => {
    video_options_frame.style = "display: none"
    recording_options_frame.style = "display: block"
})

video.addEventListener('change', () => {
    verifly_files(video, "video/mp4", "MP4")
})

report.addEventListener('change', () => {
    verifly_files(report, "application/pdf", "PDF")
})

fetch("/api/v1/reference/" + reference)
.then(response => response.json())
.then(data => {
    patient_name.innerHTML = `${data.user_data.user_name} ${data.user_data.user_lastname}`;
    examination_type.innerHTML = data.reference.examination_type;
    examination_date.innerHTML = data.reference.examination_date;
})
.catch(err => {
    alert("Ha ocurrido un error inesperado")
})