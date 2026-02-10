import json
import glob
import os
import sys

# Устанавливаем UTF-8 для вывода (чтобы избежать проблем с Æthertech)
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Пути
base_path = r'C:\Users\warfa\Downloads\Endfield\Equipment\Lv70'
output_path = r'C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\equipment\equipment_sets.json'

# Находим все папки с сетами
set_folders = [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d)) and d != 'Standalone Equipment']

result = []

for set_folder in sorted(set_folders):
    set_path = os.path.join(base_path, set_folder)
    
    # Читаем все 4 файла: Base, +1, +2, +3
    files_data = {}
    for file_type in ['Base', '+1', '+2', '+3']:
        file_name = f'{file_type}_{set_folder}_equipments.json'
        file_path = os.path.join(set_path, file_name)
        
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                files_data[file_type] = json.load(f)
    
    if 'Base' not in files_data:
        print(f'Skipping {set_folder}: no Base file found')
        continue
    
    base_data = files_data['Base']
    set_name = base_data['name']
    set_effect = base_data['setEffect']
    
    # Собираем items
    items = []
    
    for slot in ['Body', 'Hand', 'EDC']:
        if slot not in base_data['equipment']:
            continue
        
        for base_item in base_data['equipment'][slot]:
            item_id = base_item['itemId']
            
            # Создаём item со структурой equipment_sets
            item = {
                'id': item_id,
                'name': f'{set_name} {slot}',
                'slot': slot,
                'set': set_name,
                'level': 70,
                'image': base_item['imageSrc'],
                'baseStats': base_item['stats'],
                'upgrades': {}
            }
            
            # Добавляем данные из файлов +1, +2, +3
            for upgrade_level, file_key in [('+1', '+1'), ('+2', '+2'), ('+3', '+3')]:
                if file_key in files_data:
                    # Ищем этот item в файле upgrade
                    upgrade_file = files_data[file_key]
                    if slot in upgrade_file['equipment']:
                        for upgrade_item in upgrade_file['equipment'][slot]:
                            if upgrade_item['itemId'] == item_id:
                                item['upgrades'][upgrade_level] = upgrade_item['stats']
                                break
            
            items.append(item)
    
    # Добавляем сет в результат
    set_entry = {
        'name': set_name,
        'setEffect': set_effect,
        'items': items
    }
    
    result.append(set_entry)
    print(f'✓ {set_name}: {len(items)} items')

# Сохраняем
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f'\n✓ Successfully created equipment_sets.json with {len(result)} sets')
