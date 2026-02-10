@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo Начинаю сортировку файлов персонажей...
echo.

:: Обрабатываем файлы формата "XXpx-Name_..."
for %%f in (*px-*.*) do (
    set "filename=%%~nf"
    :: Извлекаем имя после "px-" и до следующего разделителя
    for /f "tokens=2 delims=-" %%a in ("!filename!") do (
        for /f "tokens=1 delims=_'" %%b in ("%%a") do (
            set "charname=%%b"
            
            :: Создаем папку для персонажа, если её нет
            if not exist "!charname!" (
                mkdir "!charname!"
                echo Создана папка: !charname!
            )
            
            :: Перемещаем файл в папку персонажа
            move "%%f" "!charname!\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo Перемещен: %%f -^> !charname!\
            )
        )
    )
)

:: Обрабатываем обычные файлы формата "Name_..."
for %%f in (*_*.*) do (
    set "filename=%%~nf"
    for /f "tokens=1 delims=_" %%a in ("!filename!") do (
        set "charname=%%a"
        
        :: Создаем папку для персонажа, если её нет
        if not exist "!charname!" (
            mkdir "!charname!"
            echo Создана папка: !charname!
        )
        
        :: Перемещаем файл в папку персонажа
        move "%%f" "!charname!\" >nul 2>&1
        if !errorlevel! equ 0 (
            echo Перемещен: %%f -^> !charname!\
        )
    )
)

echo.
echo Сортировка завершена!
pause