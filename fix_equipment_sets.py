import json
import glob
import os

# Пути
base_path = r'C:\Users\warfa\Downloads\Endfield\Equipment\Lv70'
planner_path = r'C:\Users\warfa\Downloads\Endfield\endfield-planner\public\data\equipment'
old_json_path = os.path.join(planner_path, 'equipment_sets_OLD.json')
new_json_path = os.path.join(planner_path, 'equipment_sets.json')

# Читаем старый файл equipment_sets.json (с правильными items)
print('Reading old equipment_sets file...')
with open(old_json_path, 'r', encoding='utf-8') as f:
    old_content = f.read()
    # Пробуем распарсить, даже если он испорчен
    if old_content.strip().startswith('['):
        # Добавляем недостающие закрывающие скобки если нужно
        if not old_content.strip().endswith(']'):
            # Файл испорчен, попробуем починить
            old_content = old_content.rstrip()
            # Убираем последнюю незавершённую часть
            if old_content.endswith('['):
                old_content = old_content[:-len('[')]
            old_content = old_content.rstrip(' ,\n')
            old_content += '\n]'
        
        try:
            old_data = json.loads(old_content)
            print(f'Successfully loaded {len(old_data)} sets from old file')
        except json.JSONDecodeError as e:
            print(f'Error parsing: {e}')
            old_data = []
    else:
        old_data = []

# Создаём map старых данных по именам
old_data_map = {item['name']: item for item in old_data if 'name' in item}

# Собираем setEffect из Base файлов
print('\nExtracting setEffect from Base files...')
base_files = glob.glob(os.path.join(base_path, '*', 'Base_*_equipments.json'))
set_effects_map = {}

for file_path in base_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            set_name = data['name']
            set_effects_map[set_name] = data['setEffect']
            print(f'  {set_name}: OK')
    except Exception as e:
        print(f'  Error reading {file_path}: {e}')

print(f'\nTotal setEffects extracted: {len(set_effects_map)}')

# Обновляем данные: берём items из старого файла, setEffect из Base файлов
updated_data = []

for set_name, set_effect in set_effects_map.items():
    if set_name in old_data_map:
        # Обновляем существующий сет
        set_entry = old_data_map[set_name].copy()
        set_entry['setEffect'] = set_effect
        updated_data.append(set_entry)
        print(f'Updated: {set_name}')
    else:
        # Создаём новый сет (если его не было в старом файле)
        set_entry = {
            'name': set_name,
            'setEffect': set_effect,
            'items': []
        }
        updated_data.append(set_entry)
        print(f'Created new: {set_name}')

# Сортируем по именам
updated_data.sort(key=lambda x: x['name'])

# Сохраняем обновлённый файл
print('\nSaving updated file...')
with open(new_json_path, 'w', encoding='utf-8') as f:
    json.dump(updated_data, f, indent=2, ensure_ascii=False)

print(f'\n✓ Successfully saved {len(updated_data)} sets to {new_json_path}')
