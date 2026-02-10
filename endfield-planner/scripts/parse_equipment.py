import json
import os

def calculate_stat_deltas(base_stats, upgrade_stats):
    """Вычисляет разницу между базовыми и улучшенными статами"""
    deltas = {}
    for stat_name, base_value in base_stats.items():
        if stat_name in upgrade_stats:
            # Убираем % и конвертируем в число
            base_val = float(base_value.replace('%', ''))
            upgrade_val = float(upgrade_stats[stat_name].replace('%', ''))
            delta = upgrade_val - base_val
            
            # Сохраняем дельту с % если был процент
            if '%' in base_value:
                deltas[stat_name] = f"{delta}%"
            else:
                deltas[stat_name] = str(int(delta))
    return deltas

def parse_equipment_sets():
    """Парсит все сеты снаряжения из папки Equipment/Lv70"""
    equip_path = r'C:/Users/warfa/Downloads/Endfield/Equipment/Lv70'
    sets = {}
    
    for folder in os.listdir(equip_path):
        folder_path = os.path.join(equip_path, folder)
        if not os.path.isdir(folder_path) or folder == 'Standalone Equipment':
            continue
        
        # Читаем базовый файл
        base_file = os.path.join(folder_path, f'Base_{folder}_equipments.json')
        if not os.path.exists(base_file):
            print(f"Warning: Base file not found for {folder}")
            continue
        
        with open(base_file, 'r', encoding='utf-8') as f:
            base_data = json.load(f)
        
        # Читаем файлы улучшений
        upgrade_data = {}
        for upgrade in ['+1', '+2', '+3']:
            upgrade_file = os.path.join(folder_path, f'{upgrade}_{folder}_equipments.json')
            if os.path.exists(upgrade_file):
                with open(upgrade_file, 'r', encoding='utf-8') as f:
                    upgrade_data[upgrade] = json.load(f)
        
        # Обрабатываем каждый предмет
        processed_set = {
            'name': folder,
            'setEffect': base_data.get('setEffect', ''),
            'equipment': {}
        }
        
        for slot_type, items in base_data['equipment'].items():
            processed_set['equipment'][slot_type] = []
            
            for idx, item in enumerate(items):
                item_data = {
                    'itemId': item['itemId'],
                    'imageSrc': item['imageSrc'],
                    'level': item['level'],
                    'baseStats': item['stats'],
                    'statUpgrades': {}
                }
                
                # Вычисляем дельты для каждого стата на каждом уровне улучшения
                for stat_name in item['stats'].keys():
                    if stat_name == 'DEF':
                        continue  # DEF не улучшается
                    
                    item_data['statUpgrades'][stat_name] = {
                        '+1': '0',
                        '+2': '0',
                        '+3': '0'
                    }
                    
                    for upgrade_level in ['+1', '+2', '+3']:
                        if upgrade_level in upgrade_data:
                            upgrade_items = upgrade_data[upgrade_level]['equipment'][slot_type]
                            if idx < len(upgrade_items):
                                upgrade_stats = upgrade_items[idx]['stats']
                                if stat_name in upgrade_stats:
                                    # Вычисляем дельту относительно базы
                                    base_val = float(item['stats'][stat_name].replace('%', ''))
                                    upgrade_val = float(upgrade_stats[stat_name].replace('%', ''))
                                    delta = upgrade_val - base_val
                                    
                                    # Сохраняем с % если был процент
                                    if '%' in item['stats'][stat_name]:
                                        item_data['statUpgrades'][stat_name][upgrade_level] = f"{delta:.1f}%"
                                    else:
                                        item_data['statUpgrades'][stat_name][upgrade_level] = str(int(delta))
                
                processed_set['equipment'][slot_type].append(item_data)
        
        sets[folder] = processed_set
        try:
            print(f"Processed set: {folder}")
        except:
            print(f"Processed set: [encoding issue]")
    
    return sets

# Запускаем парсинг
print("Starting equipment parsing...")
all_sets = parse_equipment_sets()
print(f"\nTotal sets processed: {len(all_sets)}")

# Сохраняем в JSON
output_file = r'C:/Users/warfa/Downloads/Endfield/endfield-planner/public/data/gear/all_equipment.json'
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_sets, f, indent=2, ensure_ascii=False)

print(f"\nSaved to: {output_file}")
print("\nSample of first set:")
first_set = list(all_sets.values())[0]
print(f"Set: {first_set['name']}")
print(f"Set Effect: {first_set['setEffect'][:100]}...")
print(f"Equipment slots: {list(first_set['equipment'].keys())}")
