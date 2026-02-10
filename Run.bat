@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Организация файлов оружия по папкам
echo ========================================
echo.

REM Проверяем наличие weapons_list.json
if not exist "weapons_list.json" (
    echo ОШИБКА: Файл weapons_list.json не найден!
    echo Убедитесь, что файл находится в той же папке, что и батник.
    pause
    exit /b
)

REM Создаем основную папку для оружия
if not exist "Оружия" (
    mkdir "Оружия"
    echo Создана папка: Оружия
)

echo Чтение списка оружия из weapons_list.json...
echo.

REM Читаем JSON и обрабатываем каждое оружие
for /f "tokens=*" %%a in ('type weapons_list.json ^| findstr /C:"\"name\":"') do (
    set "line=%%a"
    REM Извлекаем название оружия из строки "name": "Weapon Name"
    set "line=!line:*"name": "=!"
    set "line=!line:"=!"
    set "weaponName=!line:,=!"
    
    REM Удаляем пробелы в начале и конце
    for /f "tokens=* delims= " %%b in ("!weaponName!") do set "weaponName=%%b"
    
    if not "!weaponName!"=="" (
        echo Обработка: !weaponName!
        
        REM Создаем папку для оружия
        if not exist "Оружия\!weaponName!" (
            mkdir "Оружия\!weaponName!"
            echo   Создана папка: Оружия\!weaponName!
        )
        
        REM Создаем безопасное имя файла (заменяем пробелы на дефисы)
        set "safeName=!weaponName: =-!"
        
        REM Ищем и перемещаем файлы с этим названием
        set "foundFiles=0"
        
        REM Ищем _Attributes.json
        if exist "!safeName!_Attributes.json" (
            move "!safeName!_Attributes.json" "Оружия\!weaponName!\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   ^+ Перемещен: !safeName!_Attributes.json
                set "foundFiles=1"
            )
        )
        
        REM Ищем _Tuning.json
        if exist "!safeName!_Tuning.json" (
            move "!safeName!_Tuning.json" "Оружия\!weaponName!\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   ^+ Перемещен: !safeName!_Tuning.json
                set "foundFiles=1"
            )
        )
        
        REM Ищем _Skills.json
        if exist "!safeName!_Skills.json" (
            move "!safeName!_Skills.json" "Оружия\!weaponName!\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   ^+ Перемещен: !safeName!_Skills.json
                set "foundFiles=1"
            )
        )
        
        REM Ищем иконку (различные варианты имени)
        set "iconMoved=0"
        
        REM Вариант 1: Название_с_подчеркиваниями_icon.*
        set "safeNameUnderscore=!weaponName: =_!"
        for %%e in (png jpg jpeg webp gif) do (
            if exist "!safeNameUnderscore!_icon.%%e" (
                if !iconMoved! equ 0 (
                    move "!safeNameUnderscore!_icon.%%e" "Оружия\!weaponName!\" >nul 2>&1
                    if !errorlevel! equ 0 (
                        echo   ^+ Перемещена иконка: !safeNameUnderscore!_icon.%%e
                        set "iconMoved=1"
                        set "foundFiles=1"
                    )
                )
            )
        )
        
        REM Вариант 2: Название-с-дефисами_icon.*
        if !iconMoved! equ 0 (
            for %%e in (png jpg jpeg webp gif) do (
                if exist "!safeName!_icon.%%e" (
                    if !iconMoved! equ 0 (
                        move "!safeName!_icon.%%e" "Оружия\!weaponName!\" >nul 2>&1
                        if !errorlevel! equ 0 (
                            echo   ^+ Перемещена иконка: !safeName!_icon.%%e
                            set "iconMoved=1"
                            set "foundFiles=1"
                        )
                    )
                )
            )
        )
        
        REM Вариант 3: Без специальных символов
        set "cleanName=!weaponName:'=!"
        set "cleanName=!cleanName::=!"
        set "cleanName=!cleanName: =!"
        for %%e in (png jpg jpeg webp gif) do (
            if exist "!cleanName!_icon.%%e" (
                if !iconMoved! equ 0 (
                    move "!cleanName!_icon.%%e" "Оружия\!weaponName!\" >nul 2>&1
                    if !errorlevel! equ 0 (
                        echo   ^+ Перемещена иконка: !cleanName!_icon.%%e
                        set "iconMoved=1"
                        set "foundFiles=1"
                    )
                )
            )
        )
        
        if !foundFiles! equ 0 (
            echo   ^! Файлы не найдены для: !weaponName!
        )
        
        echo.
    )
)

REM Перемещаем weapons_list.json в папку Оружия
if exist "weapons_list.json" (
    move "weapons_list.json" "Оружия\" >nul 2>&1
    echo Перемещен: weapons_list.json -^> Оружия\
)

echo ========================================
echo Готово!
echo ========================================
echo Все файлы организованы в папке "Оружия"
echo.
pause