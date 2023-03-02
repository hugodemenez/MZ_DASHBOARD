from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
import json
import pandas as pd
app = FastAPI()


class Item(BaseModel):
    username: str
    password: str



@app.post("/")
def get_timetable():
    for root, dirs, files in os.walk("."):
        for name in files:
            if name.endswith(("xls")):
                print(name,root)
                print(f"readng {name}")
                try:
                    df = pd.read_excel(f"{root}\{name}", engine="xlrd",sheet_name=2)
                    df = df.rename(columns=df.iloc[0]).loc[1:]
                    df = df[["AFFAIRES","Total"]]
                    return json.loads(df.to_json(orient="records"))
                except Exception as error:
                    print(f"error reading {name} : {error}")
                    pass

if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)