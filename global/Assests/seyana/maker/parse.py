
import json
file = './map.qua'
outfile = './map.json'
lines = None
with open(file, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    f.close()

start = False
maps = {'red': [], 'blue': []}
idx = 0
try:
    while True:
        if idx >= len(lines):
            break
        line = lines[idx]
        if line == "HitObjects:\n":
            start = True
            print('---start---')
            idx += 1
            continue
        if start == False:
            idx += 1
            continue
        else:
            if line.startswith('-'):
                time = int(line.split(':')[1]) - 760
                idx += 1
                line = lines[idx].replace(' ', '')
                while not line.startswith('-'):
                    if line.startswith("Lane"):
                        lane = int(line.split(':')[1])
                        if lane <= 2:
                            maps['blue'].append(time)
                        elif lane >= 3:
                            maps['red'].append(time)
                        idx += 1
                        if idx >= len(lines):
                            break
                        line = lines[idx].replace(' ', '')
                        continue
                    else:
                        idx += 1
                        if idx >= len(lines):
                            break
                        line = lines[idx].replace(' ', '')
                        continue
        if idx >= len(lines):
            print(maps['red'])
            print()
            print(maps['blue'])
            with open(outfile, 'w') as f:
                json.dump(maps, f)
            break
except Exception as e:
    print(e)
    print()
    print(maps['red'])
    print()
    print(maps['blue'])
    with open(outfile, 'w') as f:
        json.dump(maps, f)



