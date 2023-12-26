@echo off
echo Please run [python\build.bat] first!
echo Copying messageParse...
copy python\dist\messageParse.exe QQMessageParse\
echo Copying JS...
xcopy /s /e /y js\ QQMessageParse\
ping 127.0.0.1 -n 5 >nul