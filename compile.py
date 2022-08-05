# this is a simple example code to compile your game project
import json
import os

EXTS = ['js']

dir_name = 'seyana'
path = f'global/Assests/{dir_name}'
out_path = f'global/Assests/{dir_name}/info.json'

version = '0.1'
name = "seyana"


if __name__ == '__main__':
    res = []
    for root, dirs, files in os.walk(path, topdown=False):
        for file in files:
            if file == 'info.json':
                continue
            if file.split('.')[-1] in EXTS:
                res.append(os.path.join(root, file))
    print(res)
    info = dict(version=version, name=name, struct=res)
    print(info)
    with open(out_path, 'w') as f:
        json.dump(info, f)
    print('compile done')