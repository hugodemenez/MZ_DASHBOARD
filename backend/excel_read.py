import pandas as pd
import os
import xlrd

for root, dirs, files in os.walk("."):
    for name in files:
        if name.endswith(("xls")):
            print(name,root)
            print(f"readng {name}")
            try:
                df = pd.read_excel(f"{root}\{name}", engine="xlrd",sheet_name=2)
                df = df.rename(columns=df.iloc[0]).loc[1:]
                df = df[["AFFAIRES","Total"]]
                print(df.to_json())
            except:
                pass
