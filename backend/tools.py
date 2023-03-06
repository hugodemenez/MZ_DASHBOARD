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
                f"{os.path.dirname(os.path.realpath(__file__))}",
            "download.prompt_for_download": False,
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
                self.driver.find_element(By.ID, "j_username").send_keys(username)
                self.driver.find_element(By.ID, "j_password").send_keys(password)
                # Submit data
                submit_button.click()
            except NoSuchElementException as exception:
                self.driver.quit()
                raise HTTPException(
                    status_code=500,
                    detail="Impossible de se connecter au service Akuiteo",
                ) from exception

            # Session started
            # Now we are logged in and we want to find the url to download the report
            self.driver.get('https://mazars-prod.aspaway.net/akuiteo.collabs/rapports/tous')

            # Launch download selector screen
            try:
                download_div = self.driver.find_element(
                    By.PARTIAL_LINK_TEXT, 'Ma Fiche Personnelle'
                )
                self.driver.execute_script(f"print({download_div.get_attribute('id')});")
            except NoSuchElementException as exception:
                self.driver.quit()
                raise HTTPException(
                    status_code=500,
                    detail="Impossible de charger la fiche personnelle",
                ) from exception

            # Log status
            logger.info("Getting the last date available")

            # Looping until finding the right element
            while True:
                try:
                    # Select the last date available
                    select_element = self.driver.find_element(
                        By.ID, 'combo.grp_annee_mois.0',
                    )
                    list(Select(select_element).options)[-1].click()
                    time.sleep(1)
                    break
                except NoSuchElementException:
                    # If the element is missing, it means page is not fully loaded
                    pass

            # Click on download button to get format options
            logger.info("Opening the download options")
            self.driver.find_element(By.ID, "sauvegarderParametres").click()

            files_before_dl = self.list_all_files(".")

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
            return self.find_new_file(files_before_dl)

        except KeyboardInterrupt:
            self.driver.quit()
            raise HTTPException(
                status_code=500,
                detail="Impossible de charger la fiche personnelle",
            ) from exception

    def list_all_files(self,path):
        """Lists all files in folder and subfolders
        
        return list of files paths
        """
        files_paths = []
        for path, _, files in os.walk(path):
            for name in files:
                files_paths.append(os.path.join(path, name))
        return files_paths

    def find_new_file(self,files_before_dl:list):
        """Checks if there is a new excel file in folders and subfolders

        Args:
            files_before_dl (list): list of files in folder and subfolders

        Returns:
            str: path to the new file
        """
        iteration = 0
        while iteration < 20:
            files_after_dl = self.list_all_files(".")
            for file in files_after_dl:
                if not file in files_before_dl and "xls" in file:
                    logger.info("File downloaded")
                    self.driver.quit()
                    return file
            time.sleep(1)
            iteration += 1

        self.driver.quit()
        raise HTTPException(
            status_code=500,
            detail="Le telechargement a échoué",
        )

    def read_excel_file(self,path:str):
        """Reads the xls file and returns timetable as json

        Args:
            path (str): path to xls file

        Returns:
            json: [{
                "AFFAIRES": str,
                "Total":int,
            }]
        """
        try:
            dataframe = pd.read_excel(f"{path}", engine="xlrd",sheet_name=2)
            os.remove(path)
            dataframe = dataframe.rename(columns=dataframe.iloc[0]).loc[1:]
            dataframe = dataframe[["AFFAIRES","Total"]]
            return json.loads(dataframe.to_json(orient="records"))

        except FileNotFoundError as exception:
            raise HTTPException(
                status_code=500,
                detail="Impossible de charger les temps",
            ) from exception
