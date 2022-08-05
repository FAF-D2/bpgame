import json
import os

path = './Assests/boss'
dir_name = 'boss'
out_path = './Assests/boss/info.json'

version = '1.0.0'
name = "muc"


if __name__ == '__main__':
    res = []
    for root, dirs, files in os.walk(path, topdown=False):
        for file in files:
            if file == 'info.json':
                continue
            res.append(os.path.join('global/Assests', dir_name, file))
    print(res)
    info = dict(version=version, name=name, struct=res)
    print(info)
    with open(out_path, 'w') as f:
        json.dump(info, f)
    print('compile done')