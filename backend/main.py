from typing import Union
from tools import download_timetable, read_excel_file
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
import json
import pandas as pd
app = FastAPI()





@app.post("/")
def get_timetable(
    username:str,
    password:str):
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
    for root, dirs, files in os.walk("."):
        for name in files:
            if name.endswith(("xls")):
                print(name,root)
                print(f"readng {name}")
                return read_excel_file(f"{root}\{name}")

if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)
