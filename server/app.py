from flask import Flask, Response, jsonify, render_template, send_file, request
from flask_mysqldb import MySQL
from PIL import Image
from datetime import  datetime
from io import BytesIO
from config import config

import module
import os
import pydicom
import tempfile
import requests

# Codigo basado en Flask y MySQL (Base de datos)

app = Flask(__name__)
mySQLConnection = MySQL(app)
module.mySQLConnection = mySQLConnection

################### API ENDPOINTS #######################

# Codigo para enviar mensajes a la API de WhatsApp
# En este caso se usa e telefono celular del lider
# Además esto está basado en los templates que usa Whatsapp
@app.route("/api/v1/whatsapp/send")
def send_whatsapp():
    try:
        body = {
            'messaging_product': 'whatsapp',
            'to': "+529817510923",
            'type':'template',
            'template': {
                'name': 'salud_digna_welcome',
                'language':{
                    "code": "es_MX"
                },
                'components': [
                    {
                        'type': 'body',
                        'parameters': [
                            {
                                'type': 'text',
                                'text': 'Nombre del usuario'
                            }
                        ]
                    }
                ]
            }
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer EAANYOepZBAzMBO4Hjj66tCbn65FLRCsfo5HRhr9AhtqS70a7OZB6XUy1HXVIdxgKubsFKWRMcbyYymPI6WxwYG60CUUNgsVG1UqiZC6SLLrQzpm0iD8b3kA3BU10ENHJ2qo4cAGy4qsZAOus77RcA0sSu97K31m3Io0JvRKisnHld0kZBB73qTryC559rQ2vzcghQUFifFM4l44My3rMZD'  
        }
        res = requests.post(
            'https://graph.facebook.com/v18.0/280162465177913/messages', 
            headers=headers,
            json=body,    
        )
        return res.json()
    except Exception as ex:
        return module.api_error(ex)

# Endpoint para convertir un conjunto de imágenesa un GIF
@app.route("/api/v1/get-gif/<reference_id>")
def get_gif_from_reference(reference_id):
    try:
        cursor = module.exeSQL(
            f"SELECT * FROM {module.table_files} WHERE reference_id='{reference_id}'")
        user_dcms = cursor.fetchall()
        
        images = []
        for user_file in user_dcms: images.append(get_temp_jpg(user_file[0]))

        frames = []
        for filename in images:
            frames.append(Image.open(filename))

        gif_bytes = BytesIO()

        frames[0].save(gif_bytes,
                   format='GIF',
                   save_all=True,
                   append_images=frames[1:],
                   duration=500,  # Duración en milisegundos entre cada imagen
                   loop=0)

        gif_bytes.seek(0)
        
        # En lugar de devolver la imagen directamente, devolvemos los bytes
        return send_file(gif_bytes, mimetype='image/gif')
    except Exception as ex:
        return module.api_error(ex)

# Endpoint que permite extraer formato JPG desde DICOM Devuelve el archivo para hacer GIFs
# (MANTIENE LA CALIDAD POSIBLE Y HACE UN ARCHIVO TEMPORAL QUE POSTERIORMENTE SE ELIMINA)
@app.route("/api/v1/get-jpg-temporaly/<filename>")
def get_temp_jpg(filename):
    try:
        dicom_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        with open(dicom_path, 'rb') as file:
            dicom = pydicom.dcmread(file)
        pixel_array_numpy = dicom.pixel_array
        image = Image.fromarray(pixel_array_numpy)
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')

        image_bytes.seek(0)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_file.write(image_bytes.getvalue())

        temp_file.close()
        return temp_file.name
    except Exception as ex:
        return module.api_error(ex)

# Endpoint que permite extraer formato JPG desde DICOM
# DEVUELVE EL FORMATO JPG PARA INCRUSTAR EN HTML
@app.route('/api/v1/get-jpg/<filename>')
def get_jpg(filename):
    try:
        dicom_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        with open(dicom_path, 'rb') as file:
            dicom = pydicom.dcmread(file)
        pixel_array_numpy = dicom.pixel_array
        image = Image.fromarray(pixel_array_numpy)
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_file.write(image_bytes.getvalue())
        temp_file.close()

        return send_file(temp_file.name, mimetype='image/jpeg')
    except Exception as ex:
        return module.api_error(ex)
    
# Endpoint que permite extraer formato JPG desde DICOM
# CON BAJA RESOLUCIÓN (FINES PRÁCTICOS)
@app.route('/api/v1/get-jpg/<filename>/low-quality')
def get_jpg_low_quality(filename):
    try:
        dicom_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        with open(dicom_path, 'rb') as file:
            dicom = pydicom.dcmread(file)
        pixel_array_numpy = dicom.pixel_array
        image = Image.fromarray(pixel_array_numpy)

        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG', quality=10)
        image_bytes.seek(0)
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_file.write(image_bytes.getvalue())
        temp_file.close()

        # file_size = os.path.getsize(temp_file.name)
        # print(file_size, "low") Verificacion del tamaño de bytes
        
        return send_file(temp_file.name, mimetype='image/jpeg')
    except FileNotFoundError:
        return jsonify({"status": "404", "message": "Archivo DICOM no encontrado"})
    except Exception as ex:
        return module.api_error(str(ex))

# Endpoint que permite obtener toda la información
# simulada del usuario en la base de datos de Salud+
# a través de la referecia (folio)
@app.route("/api/v1/reference/<reference_id>")
def get_reference(reference_id):
    try:
        cursor = module.exeSQL(
            f"SELECT * FROM {module.table_references} WHERE reference_id='{reference_id}'")
        row = cursor.fetchone()

        if row == None: #No existe
            return jsonify({
                "status":"404",
                "reference":{}
            })    
        user_references = {
            "reference_id":row[0],
            "video_source":row[1],
            "report_source":row[2],
            "is_streaming":row[3],
            "examination_date":str(row[4]),
            "examination_type":row[5],
            "patient_phone":row[6],
            "patient_email":row[7],
            "doctor_email":row[8]
        }

        cursor = module.exeSQL(
            f"SELECT * FROM {module.table_users} WHERE user_email='{row[7]}'")
        user_row = cursor.fetchone()
        
        user_data = {
            "user_email":user_row[0],
            "user_name":user_row[1],
            "user_lastname":user_row[2],
            "user_phone":user_row[3],
            "user_birth":str(user_row[4])
        }

        return jsonify({
            "status":"200",
            "reference":user_references,
            "user_data": user_data
        })
    except Exception as ex:
        return module.api_error(ex)

# Endpoint que permite obtener de forma ordenada (el último creado, hasta el final creado)
# Con este tipo de endpoints se puede ver en una interfaz el ultrasonido más reciente
# hasta la menos reciente, el unico parámetro es el email o id del usuario
@app.route("/api/v1/get-references/<email>", methods=["GET"])
def get_all_references(email):
    try:
        cursor = module.exeSQL(
            f"SELECT * FROM {module.table_references} WHERE patient_email='{email}' ORDER BY reference_id DESC" 
        )
        response = cursor.fetchall()
        user_references = []
        for row in response:
            user_references.append({
                "reference_id":row[0],
                "video_source":row[1],
                "report_source":row[2],
                "is_streaming":row[3],
                "examination_date":str(row[4]),
                "examination_type":row[5],
                "patient_phone":row[6],
                "patient_email":row[7],
                "doctor_email":row[8]
            })

        cursor = module.exeSQL(f"SELECT * FROM {module.table_users} WHERE user_email='{email}'")
        user = cursor.fetchall()
        user = user[0]

        birth_dt = datetime.strptime(str(user[4]), '%Y-%m-%d')
        now = datetime.now()
        edad = now.year - birth_dt.year - ((now.month, now.day) < (birth_dt.month, birth_dt.day))
        
        user_data = {
                "user_email":user[0],
                "user_name":user[1],
                "user_lastname":user[2],
                "user_phone":user[3],
                "user_birth":str(user[4]),
                "user_age":edad
        }

        return jsonify({
            "status":"200",
            "references":user_references,
            "user":user_data
        })
    except Exception as ex:
        return module.api_error(ex)

# Endpoint para la interfaz de REGISTRO
@app.route("/api/v1/create-user", methods=["POST"])
def create_user():
    if request.method != "POST": return jsonify({"status":"400"})
    try:
        module.exeSQL(f"""
            INSERT INTO {module.table_users} 
            (user_email, user_name, user_lastname, user_phone, user_birth, pwd)
            VALUES (
            "{request.json["user_email"]}", 
            "{request.json["user_name"]}",
            "{request.json["user_lastname"]}",  
            "{request.json["user_phone"]}", 
            "{request.json["user_birth"]}",
            "{request.json["pwd"]}")
        """)
        mySQLConnection.connection.commit()
        return jsonify({"status":"200"})
    except Exception as ex:
        return module.api_error(ex)

# Endpoint para la interfaz de LOGIN (INICIAR SESION)
@app.route("/api/v1/login/<user_email>")
def login(user_email):
    try:
        pwd = request.args.get('pwd')
        cursor = module.exeSQL(f"SELECT * FROM {module.table_users} WHERE user_email='{user_email}'")
        response = cursor.fetchone()
       
        if response == None: 
            return jsonify({"status":"404", "reason":"The user doesn't exist"}), 200
        
        if pwd != response[5]:
            return jsonify({"status":"401", "reason":"Pwd is not valid"}), 200

        return jsonify({"status":"200", "user": {
            "user_email":response[0],
            "user_name":response[1],
            "user_lastname":response[2],
            "user_phone":response[3],
            "user_birth":str(response[4]),
        }})
    except Exception as ex:
        return module.api_error(ex)

# CUANDO EL USUARIO PAGA SU DIAGNOSTICO OBTIENE SU FOLIO
# SALUD DIGNA SE ENCARGA DE REGISTRARLO EN SU BASE DE DATOS
# SALUD+ TAMBIEN EMULA ESA INFORMACIÓN
@app.route("/api/v1/register-reference/", methods=["POST"])
def register_reference():
    if request.method != "POST": return jsonify({"status":"400"})
    try:
        print(request.json)
        module.exeSQL(f"""
            INSERT INTO {module.table_references} 
            (examination_date, examination_type, is_streaming, patient_email)
            VALUES 
            ("{request.json["examination_date"]}", 
            "{request.json["examination_type"]}", 
            0,
            "{request.json["patient_email"]}" 
            )
        """)
        mySQLConnection.connection.commit()

        return jsonify({"status":"200"})
    except Exception as ex:
        return module.api_error(ex)
    
################### WEB PAGE ROUTES #####################

# En la version (V1) se tenian las vistas del técnico doctor
# para la publicación y envió de los ultrasonidos en la base de datos
# y a WhatsApp.

####### VISTA DE USUARIOS #######
# Home
@app.route("/")
def index():
    return render_template("index.html")

# Mirar el ultrasonido desde la página web
@app.route("/ultrasound/<reference>")
def ultrasound(reference):
    return render_template("ultrasound.html")

# Sign in
@app.route("/sign-in")
def sign_in(): 
    return render_template("sign-in.html")

# Sign up
@app.route("/sign-up")
def sign_up(): 
    return render_template("sign-up.html")

# Pestaña Home
@app.route("/home")
def home(): 
    return render_template("home.html")

# Error 404
def error404(source): 
    return render_template("not_found.html"), 404

if __name__ == "__main__":
    app.config["UPLOAD_FOLDER"] = "./server/static/storage" # Dirección de la base de datos local
    app.config.from_object(config['development']) # Se establece la configuración de la base de datos y uso de MySQL
    app.register_error_handler(404, error404) # Si hay error muestra la ventana 404
    app.run() # run