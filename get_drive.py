import subprocess
import os

url = "https://drive.google.com/drive/folders/1s8_aRAhN9WPvSQ2kNBFeNTyjVXF5tOZY?usp=sharing"
print("Attempting gdown again directly to download remaining files")
subprocess.run(["gdown", "--folder", url, "--remaining-ok"])
