@echo off
chcp 65001 >nul

set "SOURCE=C:\Users\warfa\Downloads\Endfield\Оружия"
set "DEST=C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\weapons"

for /D %%d in ("%SOURCE%\*") do (
    if exist "%DEST%\%%~nxd" (
        if exist "%%d\*_Attributes.json" (
            copy "%%d\*_Attributes.json" "%DEST%\%%~nxd\" /Y >nul 2>&1
            echo Copied: %%~nxd
        )
    )
)

echo.
echo Done! Attributes files copied.
pause
