import urllib.request
import re

url = "https://drive.google.com/drive/folders/1s8_aRAhN9WPvSQ2kNBFeNTyjVXF5tOZY?usp=sharing"
req = urllib.request.Request(url)
html = urllib.request.urlopen(req).read().decode('utf-8')
matches = re.findall(r'<script nonce=.*?>_.*?window\[\'_initData_\'\].*?</script>', html)
for match in matches:
    if '.zip' in match:
        print("Found .zip in initial data!")

print("Looking for zip patterns:")
print(re.findall(r'[\w-]+\.zip', html, re.IGNORECASE))
