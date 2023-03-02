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


from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By

class Scraping():
    """
    Cette classe regroupe les differentes fonctions de scraping
    utilisées pour récuperer les données de WebAurion
    """
    def __init__(self):
        #On initialise le headless webbrowser
        pass

    def download_timetable(self,username,password):
        """
        Scraping to download timetable
        """

        options = EdgeOptions()
        #options.add_argument("--headless=new")

        driver = webdriver.Edge(options=options)
        driver.get('https://mazars-prod.aspaway.net/akuiteo.collabs/saisie/agenda')
        submit_button = driver.find_element(by=By.CSS_SELECTOR, value="button")

        # Insert data into corresponding username field
        username_field = driver.find_element(By.ID, "j_username")
        username_field.send_keys(username)

        # Insert data into corresponding password field
        password_field = driver.find_element(By.ID, "j_password")
        password_field.send_keys(password)
        input()

        submit_button.click()
        input()

        driver.quit()
        return


from dotenv import load_dotenv
load_dotenv()

Scraping().download_timetable(os.getenv("DEV_USERNAME"),os.getenv("DEV_PASSWORD"))