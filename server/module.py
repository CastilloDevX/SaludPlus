from flask import Response, jsonify, render_template, request

mySQLConnection = None #It's defined at the start of app.py
db_name = "saludplusdb"
table_references = db_name + ".references_data"
table_users = db_name +".users"
table_files = db_name + ".files"
storage = "./server/static/storage/"

def exeSQL(sqlInstruction):
    cursor = mySQLConnection.connection.cursor()
    cursor.execute(sqlInstruction)
    return cursor

def api_error(ex):
    return jsonify({"status": "404", "message": ex})

