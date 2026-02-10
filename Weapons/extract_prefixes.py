import json
import os
from pathlib import Path

print("Поиск файлов *_Skills.json во всех подпапках...")
print()

primary_stats = set()    # Основные (позиция 1 - Intellect Boost, Strength Boost, Main Attribute Boost и т.д.)
secondary_stats = set()  # Вторичные (позиция 2 - Electric DMG Boost, Cryo DMG Boost и т.д.)
passive_skills = set()   # Пассивки (позиция 3 - Infliction, Suppression и т.д.)
files_processed = 0

# Для детального отчёта
secondary_details = {}  # {stat_name: [list of files]}

# Поиск всех *_Skills.json файлов
for json_file in Path('.').rglob('*_Skills.json'):
    print(f"Обработка: {json_file.name}")
    files_processed += 1
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Берем первый массив (первую строку данных)
        if len(data) > 0:
            first_row = data[0]
            
            # Позиция 1 - Основной стат
            if len(first_row) > 1:
                element = first_row[1]
                # Убираем квадратные скобки [L], [M], [S]
                clean_name = element.split('[')[0].strip()
                primary_stats.add(clean_name)
            
            # Позиция 2 - Вторичный стат
            if len(first_row) > 2:
                element = first_row[2]
                # Убираем квадратные скобки [L], [M], [S]
                clean_name = element.split('[')[0].strip()
                secondary_stats.add(clean_name)
                
                # Добавляем в детальный отчёт
                if clean_name not in secondary_details:
                    secondary_details[clean_name] = []
                secondary_details[clean_name].append(json_file.name)
            
            # Позиция 3 - Пассивка
            if len(first_row) > 3:
                element = first_row[3]
                # Берем только префикс до двоеточия
                if ':' in element:
                    prefix = element.split(':')[0].strip()
                    passive_skills.add(prefix)
                    
    except Exception as e:
        print(f"  Ошибка: {e}")

print()
print(f"Обработано файлов: {files_processed}")
print(f"Найдено основных статов: {len(primary_stats)}")
print(f"Найдено вторичных статов: {len(secondary_stats)}")
print(f"Найдено пассивок: {len(passive_skills)}")
print()

# Сохранение основных статов
if primary_stats:
    sorted_primary = sorted(primary_stats)
    with open('Primary_Stats.txt', 'w', encoding='utf-8') as f:
        for stat in sorted_primary:
            f.write(stat + '\n')
    print("Основные статы сохранены в: Primary_Stats.txt")
    print("=== Основные статы ===")
    for stat in sorted_primary:
        print(stat)
    print()

# Сохранение вторичных статов
if secondary_stats:
    sorted_secondary = sorted(secondary_stats)
    with open('Secondary_Stats.txt', 'w', encoding='utf-8') as f:
        for stat in sorted_secondary:
            f.write(stat + '\n')
    print("Вторичные статы сохранены в: Secondary_Stats.txt")
    print("=== Вторичные статы ===")
    for stat in sorted_secondary:
        print(stat)
    print()

# Сохранение детального отчёта по вторичным статам
if secondary_details:
    with open('Secondary_Stats_Details.txt', 'w', encoding='utf-8') as f:
        f.write("=== Детальный отчёт: Вторичные статы в файлах ===\n\n")
        for stat in sorted(secondary_details.keys()):
            f.write(f"{stat}:\n")
            for filename in sorted(secondary_details[stat]):
                f.write(f"  - {filename}\n")
            f.write(f"  Всего файлов: {len(secondary_details[stat])}\n\n")
    print("Детальный отчёт сохранён в: Secondary_Stats_Details.txt")
    print()

# Сохранение пассивок
if passive_skills:
    sorted_passive = sorted(passive_skills)
    with open('Passive_Skills.txt', 'w', encoding='utf-8') as f:
        for skill in sorted_passive:
            f.write(skill + '\n')
    print("Пассивки сохранены в: Passive_Skills.txt")
    print("=== Пассивки ===")
    for skill in sorted_passive:
        print(skill)
    print()

if not primary_stats and not secondary_stats and not passive_skills:
    print("Ничего не найдено!")

print()
input("Нажмите Enter для выхода...")