"""Module hosting the scraping class for Akuiteo
"""

import os
import json
import time
import pandas as pd
from logger import logger
from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.common.exceptions import NoSuchElementException
from fastapi import HTTPException

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
        dataframe = pd.read_excel(f"{path}", engine="xlrd",sheet_name=2)
        os.remove(path)
        dataframe = dataframe.rename(columns=dataframe.iloc[0]).loc[1:]
        dataframe = dataframe[["AFFAIRES","Total"]]
        return json.loads(dataframe.to_json(orient="records"))
    except FileNotFoundError as exception:
        raise HTTPException(
            status_code=404,
            detail="Impossible de charger les temps",
        ) from exception

class Akuiteo():
    """
    Cette classe regroupe les differentes fonctions de scraping
    utilisées pour récuperer les données de Akuito
    """
    def __init__(self):
        #On initialise le headless webbrowser
        options = EdgeOptions()
        options.add_argument("--headless=new")
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        options.add_experimental_option("prefs", {
            "profile.default_content_settings.popups": 0,    
            "download.default_directory": 
                f"{os.path.dirname(os.path.realpath(__file__))}", ### Set the path accordingly
            "download.prompt_for_download": False, ## change the downpath accordingly
            "download.directory_upgrade": True,
        })

        self.driver = webdriver.Edge(options=options)

    def download_timetable(self,*,username,password):
        """
        Scraping to download timetable
        """
        try:
            # Going to agenda website
            self.driver.get('https://mazars-prod.aspaway.net/akuiteo.collabs/saisie/agenda')

            # Finding elements on connection page
            try:
                submit_button = self.driver.find_element(by=By.CSS_SELECTOR, value="button")
                username_field = self.driver.find_element(By.ID, "j_username")
                password_field = self.driver.find_element(By.ID, "j_password")
            except NoSuchElementException as exception:
                raise HTTPException(
                    status_code=404,
                    detail="Impossible de se connecter au service Akuiteo",
                ) from exception

            # Insert data into corresponding username field
            username_field.send_keys(username)

            # Insert data into corresponding password field
            password_field.send_keys(password)

            # Submit data
            submit_button.click()

            # Session started
            # Now we are logged in and we want to find the url to download the report
            self.driver.get('https://mazars-prod.aspaway.net/akuiteo.collabs/rapports/tous')

            # Launch download selector screen
            try:
                download_div = self.driver.find_element(
                    By.PARTIAL_LINK_TEXT, 'Ma Fiche Personnelle'
                )
            except NoSuchElementException:
                return

            document_id = download_div.get_attribute("id")
            self.driver.execute_script(f"print({document_id});")

            # Log status
            logger.info("Getting the last date available")

            # Looping until finding the right element
            while True:
                try:
                    # Select the last date available
                    select_element = self.driver.find_element(
                        By.ID, 'combo.grp_annee_mois.0',
                    )
                    break
                except NoSuchElementException:
                    # If the element is missing, it means page is not fully loaded
                    pass

            select = Select(select_element)
            last_option = list(select.options)[-1]
            last_option.click()
            time.sleep(2)
            # Click on download button to get format options
            logger.info("Opening the download options")
            download_button = self.driver.find_element(By.ID, "sauvegarderParametres")
            download_button.click()

            files_before_dl = []
            for path, _, files in os.walk("."):
                for name in files:
                    files_before_dl.append(os.path.join(path, name))

            # Click on download button to get format options
            logger.info("Trying to click on the download option for XLS")
            while True:
                try:
                    excel_download = self.driver.find_element(By.ID, "XLS")
                    time.sleep(1)
                    excel_download.click()
                    break
                except NoSuchElementException:
                    pass

            logger.info("Looking for downloaded file")
            while True:
                files_after_dl = []
                for path, _, files in os.walk("."):
                    for name in files:
                        files_after_dl.append(os.path.join(path, name))
                for file in files_after_dl:
                    if not file in files_before_dl and "xls" in file:
                        logger.info("File downloaded")
                        return file

            self.driver.quit()

        except KeyboardInterrupt:
            self.driver.quit()
