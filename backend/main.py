"""API
"""

import os
import uvicorn

from tools import Akuiteo, read_excel_file
from fastapi import FastAPI, File, UploadFile
from dotenv import load_dotenv

app = FastAPI()

@app.post("/")
def get_timetable(
    username:str = os.getenv("DEV_USERNAME"),
    password:str = os.getenv("DEV_PASSWORD")):
    """API Post request to get timetable 
    from mazars-prod.aspaway.net/akuiteo.collabs/ 
    according to username and password

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """
    #path = download_timetable(username=username, password=password)
    return read_excel_file(
        Akuiteo().download_timetable(
            username=username,
            password=password,
        )
    )

import pandas as pd
@app.post("/uploadfiles/")
def upload_agreementfiit_data(
    files: list[UploadFile]
    ):
    """API Post request to get timetable 
    from mazars-prod.aspaway.net/akuiteo.collabs/ 
    according to username and password

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """
    for file in files:
        df = pd.read_excel(file.file,sheet_name="data")
        file.file.close()
        total_heures = df[df.eq("total_heures").any(1)]
        total_heures= total_heures.dropna(axis=1, how='all')
        print(total_heures.iat[0,1])
    return {"filenames": [file.filename for file in files]}

if __name__ == "__main__":
    # Loads the .env vars
    load_dotenv()
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)
