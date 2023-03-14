"""API
"""

import os
import sqlite3
import uvicorn
import asyncio
import pandas as pd

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

    sql_request = """CREATE TABLE IF NOT EXISTS timetable
    (AFFAIRES,Total,username,PRIMARY KEY (AFFAIRES,username))
    """
    cursor.execute(sql_request)
    for item in data:
        sql_request = f"""INSERT INTO
        timetable(AFFAIRES,Total,username) 
        VALUES('{item.get("AFFAIRES",None)}','{item.get("Total",None)}','{item.get("username",None)}')
        ON CONFLICT (AFFAIRES,username) DO UPDATE SET Total='{item.get("Total",None)}';
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
    sql_request = """CREATE TABLE IF NOT EXISTS client (name,hours,PRIMARY KEY (name))"""
    cursor.execute(sql_request)
    for file in files:
        agreement_fiit = pd.read_excel(file.file,sheet_name="data")
        file.file.close()
        total_heures = agreement_fiit[agreement_fiit.eq("total_heures").any(1)]
        total_heures= total_heures.dropna(axis=1, how='all')
        sql_request = f"""INSERT OR IGNORE INTO
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



@app.post("/changeAvatar/")
async def change_avatar(
    file: UploadFile
    ):
    """API post to change the avatar of the user
    """
    contents = await file.read() # read the file data
    with open(f"./frontend/assets/avatar/{file.filename}", "wb") as f:
        f.write(contents) # write the file data to disk

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

class Task(BaseModel):
    """Class model for params from API Post request"""
    content: str

@app.post("/upload_task_to_db/")
def upload_task(
    task : Task):
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

    sql_request = """CREATE TABLE IF NOT EXISTS tasks(content, PRIMARY KEY (content))"""
    cursor.execute(sql_request)

    sql_request = f"""INSERT OR IGNORE INTO
    tasks(content) 
    VALUES("{task.content.replace('"',' ')}")
    """

    response = cursor.execute(sql_request)
    connection.commit()
    connection.close()
    print(response.rowcount)
    if response.rowcount == 1:
        # If rowcount == 1, it means that the row was inserted
        raise HTTPException(
            status_code=200,
            detail="Success",
        )
    # Else raise No content
    raise HTTPException(
        status_code=204,
        detail="Already exists",
    )

@app.post("/delete_task_from_db/")
def delete_task(
    task : Task):
    """API Post request to delete task data from sqlite db

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """

    # Creates database connection (create db if not exists)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()

    sql_request = f"""DELETE FROM tasks WHERE content='{task.content.replace('"',' ')}'"""
    cursor.execute(sql_request)
    connection.commit()
    connection.close()
    raise HTTPException(
        status_code=200,
        detail="Success",
    )

@app.get("/get_tasks/")
def get_tasks():
    """API get request to get data from sqlite db

    Returns:
        list: tasks list
    """

    # Creates database connection (create db if not exists)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    try:
        # Getting columns names
        sql_request = "PRAGMA table_info(tasks);"
        result = cursor.execute(sql_request)
        result = result.fetchall()
        columns = [column_name for _,column_name,_,_,_,_ in result]

        # Selecting values
        sql_request = "SELECT * FROM tasks"
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

if __name__ == "__main__":
    # Loads the .env vars
    load_dotenv()
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)
