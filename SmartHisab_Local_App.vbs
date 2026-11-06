Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the exact directory where this .vbs file is located
scriptFolder = fso.GetParentFolderName(WScript.ScriptFullName)

' Find Microsoft Edge path
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
If Not fso.FileExists(edgePath) Then
    edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
End If

' Ensure high-speed background server is running (hidden window)
serverScript = scriptFolder & "\server.cjs"
If fso.FileExists(serverScript) Then
    WshShell.Run "cmd /c node """ & serverScript & """", 0, False
    WScript.Sleep 600
End If

' Launch standalone desktop window pointing to localhost:3000
cmd = """" & edgePath & """" & " --app=""http://localhost:3000/"" --window-size=1280,800 --start-maximized --disable-features=Translate"

WshShell.Run cmd, 1, False
