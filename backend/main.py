"""API
"""

import os
import uvicorn

from tools import Akuiteo, read_excel_file
from fastapi import FastAPI
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

if __name__ == "__main__":
    # Loads the .env vars
    load_dotenv()
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)
