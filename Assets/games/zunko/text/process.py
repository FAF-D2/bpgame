import json


if __name__ == '__main__':
    script = []
    with open("text.txt", 'r',encoding='utf-8') as f:
        while True:
            line = f.readline()
            if not line:
                break
            line = line.split('\t')
            if len(line) != 2 and len(line) != 3:
                print(len(line))
                print(line)
                raise NotImplementedError
            name = line[0]
            text = line[1].strip('\n')
            slice = {
                "name": name,
                "text": text,
                "read": 0
            }
            opt = int(line[2]) if len(line) == 3 else None
            if opt:
                slice["opt"] = opt
            script.append(slice)
        f.close()
    with open("script.json", 'w') as f:
        json.dump(script, f)
    print("all done")
        
