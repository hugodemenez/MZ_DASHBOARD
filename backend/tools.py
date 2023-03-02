import pandas as pd
import os
import json

def read_excel_file(path:str):
    """Reads the xls file and returns timetable as json

    Args:
        path (str): path to xls file

    Returns:
        json: {
            "AFFAIRES": str,
            "Total":int,
        }
    """
    try:
        df = pd.read_excel(f"{path}", engine="xlrd",sheet_name=2)
        df = df.rename(columns=df.iloc[0]).loc[1:]
        df = df[["AFFAIRES","Total"]]
        return json.loads(df.to_json(orient="records"))
    except Exception as error:
        print(f"error reading {path} : {error}")
        pass