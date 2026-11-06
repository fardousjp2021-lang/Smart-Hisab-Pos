Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the exact directory where this .vbs file is located
scriptFolder = fso.GetParentFolderName(WScript.ScriptFullName)

' Find Microsoft Edge path
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
If Not fso.FileExists(edgePath) Then
    edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
End If

' Build file:// URL with URL space encoding
indexPath = scriptFolder & "\dist\index.html"
indexPath = Replace(indexPath, "\", "/")
indexPath = Replace(indexPath, " ", "%20")

' Launch Microsoft Edge App mode with Chromium file access permission flags
cmd = """" & edgePath & """" & " --app=""file:///" & indexPath & """ --allow-file-access-from-files --user-data-dir=""" & scriptFolder & "\.desktop_data"" --window-size=1280,800 --start-maximized --disable-features=Translate"

WshShell.Run cmd, 1, False
