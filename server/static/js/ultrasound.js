const reference = window.location.pathname.replace("/ultrasound/", "");

const report_field = document.getElementById("report-field");

const examination_type = document.getElementById("examination_type");
const examination_date = document.getElementById("examination_date");
const doctor_email = document.getElementById("doctor_email");

const download_report = document.getElementById("download-report");

const download_file = (extension, file_name) => {
    const link = document.createElement('a');
    link.href = `/api/v1/files/${reference}.${extension}`;
    link.download = file_name; // Utiliza solo file_name como nombre de descarga

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById("reference_id").innerHTML = reference;
fetch("/api/v1/reference/" + reference)
.then(response => response.json())
.then(data => {
    examination_type.innerHTML = data.reference.examination_type;
    examination_date.innerHTML = data.reference.examination_date;
    doctor_email.innerHTML = data.reference.doctor_email;
    
    if (data.reference.doctor_email == null) {
        doctor_email.innerHTML = "No se encuentra disponible";
    }
    
    return 
    // FILES DOCUMENTATION
    // report_field.setAttribute("src", data.reference.report_source)
    download_report.addEventListener("click", () => {
        const fileName = `${data.reference.examination_type}-${data.reference.examination_date}`;
        download_file("pdf", fileName)
    })

    let video_div = document.getElementById("video")

    if (data.reference.video_source == null) {
        video_div.style = "margin-bottom: 0px"
        return
    }

    video_div.innerHTML += `<h1>Video del ultrasonido</h1>`
    if(data.reference.is_streaming == 1) {
        video_div.innerHTML += `
            <img id="video-field" id="streaming" src="{{ url_for('see_streaming') }}" alt="Stream Telesonography">
        `
    } else {
        video_div.innerHTML += `
        <div>
            <video id="video-field" src="${data.reference.video_source}" width="100%" height="100%" controls>
                <source src="" type="video/mp4">
                Tu navegador no soporta el elemento de video.
            </video>
            <button id="download-video" class="download">Descargar video MP4</button>
        </div>
        `
        const download_video = document.getElementById("download-video");

        download_video.addEventListener("click", () => {
            const fileName = `${data.reference.examination_type}-${data.reference.examination_date}`;
            download_file("mp4", fileName)
        })
    }
})
.catch(err => {
    console.log(err)
    //alert("Hubo un error al ingresar al ultrasonido")
})