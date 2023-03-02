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
from selenium.webdriver.support.select import Select

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

        submit_button.click()

        # Now we are logged in and we want to find the url to download the report
        driver.get('https://mazars-prod.aspaway.net/akuiteo.collabs/rapports/tous')

        try:
            # We have to click on download icon containing
            download_btn = driver.find_element(By.CSS_SELECTOR,".fa-download")
            download_btn.click()
            # Select the last date available
            select_element = driver.find_element(By.ID, 'combo.grp_annee_mois.0')
            select = Select(select_element)
            select_options = select.all_selected_options()
            print(select_options)
            input()
            select.select_by_index(-1)

            # Click on download button to get format options
            download_button = driver.find_element(By.ID, "sauvegarderParametres")
            download_button.click()
            
            # Click on download button to get format options
            excel_download = driver.find_element(By.ID, "XLS")
            excel_download.click()
        except Exception as error:
            print(error)
        
        try:
            pass
        except Exception as error:
            print(error)
        input()

        driver.quit()
        return


from dotenv import load_dotenv
load_dotenv()

Scraping().download_timetable(os.getenv("DEV_USERNAME"),os.getenv("DEV_PASSWORD"))