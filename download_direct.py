import urllib.request
import re
import sys

url = "https://drive.google.com/drive/folders/1s8_aRAhN9WPvSQ2kNBFeNTyjVXF5tOZY"

# Since this is a public folder, let's use the Google Drive API directly if we can't extract the ID easily.
# But actually `gdown` has a folder mode which we ran. Let's see if we downloaded the zip in a different directory.

