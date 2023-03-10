"""API
"""

import os
import uvicorn
import pandas as pd
import sqlite3

from tools import Akuiteo, read_excel_file
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from dotenv import load_dotenv
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    """Class model for params from API Post request"""
    username: str
    password: str

@app.post("/get_akuiteo_timetable/")
def get_timetable(
    user : User):
    """API Post request to get timetable 
    from mazars-prod.aspaway.net/akuiteo.collabs/ 
    according to username and password

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """

    akuiteo_file = Akuiteo().download_timetable(
            username=user.username,
            password=user.password,
        )

    return read_excel_file(path=akuiteo_file)

@app.post("/upload_timetable_to_db/")
def upload_timetable(
    data : list):
    """API Post request to upload data to sqlite db

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """

    # Creates database connection (create db if not exists)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()

    sql_request = """CREATE TABLE IF NOT EXISTS timetable (AFFAIRES,Total)"""
    cursor.execute(sql_request)
    for item in data:
        sql_request = f"""INSERT INTO
        timetable(AFFAIRES,Total) 
        VALUES('{item.get("AFFAIRES",None)}','{item.get("Total",None)}')
        """
        cursor.execute(sql_request)
    connection.commit()
    connection.close()
    raise HTTPException(
        status_code=200,
        detail="Success",
    )

@app.get("/read_timetable_from_db/")
def read_db():
    """API Post request to upload data to sqlite db

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """

    # Creates database connection (create db if not exists)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    try:
        # Getting columns names
        sql_request = "PRAGMA table_info(timetable);"
        result = cursor.execute(sql_request)
        result = result.fetchall()
        columns = [column_name for _,column_name,_,_,_,_ in result]

        # Selecting values
        sql_request = "SELECT * FROM timetable"
        results = cursor.execute(sql_request)
        results = results.fetchall()


        output = []
        for result in results:
            dictionnary = {}
            for value,column in zip(result,columns):
                dictionnary[column] = value
            output.append(dictionnary)
        connection.close()
        return output

    except sqlite3.OperationalError as error:
        connection.close()
        raise HTTPException(
            status_code=204,
            detail="No data in database",
        ) from error

@app.post("/uploadfiles/")
def upload_agreementfiit_data(
    files: list[UploadFile]
    ):
    """API that gets the total_heures from the agreement_fiit excel file
    and put it in the db
    """

    # Creates database connection (create db if not exists)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    sql_request = """CREATE TABLE IF NOT EXISTS client (name,hours)"""
    cursor.execute(sql_request)
    for file in files:
        agreement_fiit = pd.read_excel(file.file,sheet_name="data")
        file.file.close()
        total_heures = agreement_fiit[agreement_fiit.eq("total_heures").any(1)]
        total_heures= total_heures.dropna(axis=1, how='all')
        sql_request = f"""INSERT INTO
        client(name,hours) 
        VALUES('{file.filename}','{total_heures.iat[0,1]}')
        """
        cursor.execute(sql_request)
        connection.commit()

    connection.close()
    raise HTTPException(
        status_code=200,
        detail="Success",
    )

@app.get("/getClients/")
def get_clients(
    ):
    """API that gets the total_heures from the agreement_fiit excel file
    and put it in the db
    """

    # Creates database connection (create db if not exists)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    try:
        # Getting columns names
        sql_request = "PRAGMA table_info(client);"
        result = cursor.execute(sql_request)
        result = result.fetchall()
        columns = [column_name for _,column_name,_,_,_,_ in result]

        # Selecting values
        sql_request = "SELECT * FROM client"
        results = cursor.execute(sql_request)
        results = results.fetchall()


        output = []
        for result in results:
            dictionnary = {}
            for value,column in zip(result,columns):
                dictionnary[column] = value
            output.append(dictionnary)
        connection.close()
        return output

    except sqlite3.OperationalError as error:
        connection.close()
        raise HTTPException(
            status_code=204,
            detail="No data in database",
        ) from error

@app.get("/")
def initializer(
    ):
    """API that gets the total_heures from the agreement_fiit excel file
    """
    return "Hello World"

if __name__ == "__main__":
    # Loads the .env vars
    load_dotenv()
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)
