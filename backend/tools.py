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
import urllib.request
import time

class Scraping():
    """
    Cette classe regroupe les differentes fonctions de scraping
    utilisées pour récuperer les données de Akuito
    """
    def __init__(self):
        #On initialise le headless webbrowser
        pass

    def download_timetable(self,username,password):
        """
        Scraping to download timetable
        """
        try:
            options = EdgeOptions()
            options.add_argument("--headless=new")
            prefs = {
                "profile.default_content_settings.popups": 0,    
                "download.default_directory": f"{os.path.dirname(os.path.realpath(__file__))}", ### Set the path accordingly
                "download.prompt_for_download": False, ## change the downpath accordingly
                "download.directory_upgrade": True,
                }
            options.add_experimental_option('excludeSwitches', ['enable-logging'])
            options.add_experimental_option("prefs", prefs)

            driver = webdriver.Edge(options=options)

            # Going to agenda website
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
                # Launch download selector screen
                download_div = driver.find_element(By.PARTIAL_LINK_TEXT, 'Ma Fiche Personnelle')
                document_id = download_div.get_attribute("id")
                driver.execute_script(f"print({document_id});")

                print("Getting the last date available")
                while True:
                    try:
                        # Select the last date available
                        select_element = driver.find_element(By.ID, 'combo.grp_annee_mois.0')
                        break
                    except:
                        pass
                select = Select(select_element)
                select_options = select.options
                for option in select_options:
                    last_option = option
                last_option.click()
                time.sleep(2)
                # Click on download button to get format options
                print("Opening the download options")
                download_button = driver.find_element(By.ID, "sauvegarderParametres")
                download_button.click()

                files_before_dl = []
                for path, subdirs, files in os.walk("."):
                    for name in files:
                        files_before_dl.append(os.path.join(path, name))

                # Click on download button to get format options
                print("Trying to click on the download option for XLS")
                while(True):
                    try:
                        excel_download = driver.find_element(By.ID, "XLS")
                        time.sleep(1)
                        excel_download.click()
                        break
                    except:
                        pass

                print("Looking for downloaded file")
                while True:
                    files_after_dl = []
                    for path, subdirs, files in os.walk("."):
                        for name in files:
                            files_after_dl.append(os.path.join(path, name))
                    for file in files_after_dl:
                        if not file in files_before_dl:
                            if "xls" in file:
                                print("File downloaded")
                                return file
            except Exception as error:
                print(error)
            
            driver.quit()
        except:
            driver.quit()


from dotenv import load_dotenv
load_dotenv()

Scraping().download_timetable(os.getenv("DEV_USERNAME"),os.getenv("DEV_PASSWORD"))

