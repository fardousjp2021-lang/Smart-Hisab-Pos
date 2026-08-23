import urllib.request
import re

url = "https://drive.google.com/drive/folders/1s8_aRAhN9WPvSQ2kNBFeNTyjVXF5tOZY?usp=sharing"
req = urllib.request.Request(url)
html = urllib.request.urlopen(req).read().decode('utf-8')
print("ZIP files found:", re.findall(r'[\w-]+\.zip', html, re.IGNORECASE))
