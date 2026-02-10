# Копирование всех Attributes.json файлов

$sourceBase = "C:\Users\warfa\Downloads\Endfield\Персонажи"
$targetBase = "C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\operators"

# Список всех персонажей
$operators = @(
    "Laevatain", "Snowshine", "Xaihi", "Endministrator", "Lifeng", "Gilberta", 
    "Yvonne", "Arclight", "Wulfgard", "Perlica", "Pogranichnik", "Estella", 
    "Last Rite", "Ardelia", "Fluorite", "Antal", "Chen Qianyu", "Akekuri", 
    "Avywenna", "Ember", "Da Pan", "Alesh", "Catcher"
)

foreach ($op in $operators) {
    $sourceFolder = Join-Path $sourceBase $op
    $targetFolder = Join-Path $targetBase $op
    
    # Создаём папку персонажа
    if (!(Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }
    
    # Копируем Attributes.json
    $sourceFile = Join-Path $sourceFolder "${op}_Attributes.json"
    $targetFile = Join-Path $targetFolder "${op}_Attributes.json"
    
    if (Test-Path $sourceFile) {
        Copy-Item -Path $sourceFile -Destination $targetFile -Force
        Write-Host "✓ Скопирован: $op" -ForegroundColor Green
    } else {
        Write-Host "✗ Не найден: $sourceFile" -ForegroundColor Red
    }
}

Write-Host "`nГотово!" -ForegroundColor Cyan
