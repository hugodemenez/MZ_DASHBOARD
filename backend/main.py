"""API
"""

import os
import uvicorn
import pandas as pd

from tools import Akuiteo, read_excel_file
from fastapi import FastAPI, UploadFile
from dotenv import load_dotenv
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    """Class model for params from API Post request"""
    username: str = os.getenv("DEV_USERNAME")
    password: str = os.getenv("DEV_PASSWORD")


@app.post("/get_akuiteo_timetable/")
def get_timetable(
    item : Item):
    """API Post request to get timetable 
    from mazars-prod.aspaway.net/akuiteo.collabs/ 
    according to username and password

    Args:
        username (str): username 
        password (str): password

    Returns:
        _type_: _description_
    """

    item = item.dict()
    akuiteo_file = Akuiteo().download_timetable(
            username=item["username"],
            password=item["password"],
        )

    return read_excel_file(path=akuiteo_file)

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
        agreement_fiit = pd.read_excel(file.file,sheet_name="data")
        file.file.close()
        total_heures = agreement_fiit[agreement_fiit.eq("total_heures").any(1)]
        total_heures= total_heures.dropna(axis=1, how='all')
    return total_heures.iat[0,1]

if __name__ == "__main__":
    # Loads the .env vars
    load_dotenv()
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)
