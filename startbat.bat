@echo off
if not "%1"=="am_admin" (powershell -Command "Start-Process -FilePath '%~f0' -ArgumentList 'am_admin' -Verb RunAs")
takeown /f "data" /r /d y
icacls "data" /grant "%USERNAME%:F" /t

takeown /f "session" /r /d y
icacls "session" /grant "%USERNAME%:F" /t
node scriptServer.js
