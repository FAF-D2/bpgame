#include<string>
#include<direct.h>
#include<Windows.h>
#include<fstream>

std::string current_path()
{
    char buffer[256];
    _getcwd(buffer, 256);
    return std::string(buffer);
}

std::string cur_path = current_path();
std::string config_path = cur_path + "\\config.json";
void save_config()
{
    std::string text = "{\n \
    \"name\": \"com.bpgame.bpwebsocket\",\n \
    \"description\": \"manage the local game file\",\n \
    \"type\": \"stdio\",\n \
    \"allowed_origins\": [\"chrome-extension://bniedpojpfkimbohohnipnkejmgehken/\"],\n \
    \"path\": \"";
    for(int i=0; i < cur_path.size(); i++)
    {
        if(cur_path[i] == '\\'){
            text += "\\\\"; 
            continue;
        }
        text += cur_path[i];
    }
    text += "\\\\ws\\\\bpws.exe\"\n}";
    std::ofstream ofs(cur_path + "\\config.json", std::ios::out);
    ofs << text;
    ofs.close();
}
LPCTSTR path = "Software\\Google\\Chrome\\NativeMessagingHosts\\com.bpgame.bpwebsocket";

bool EXIST_REG(){
    HKEY hkey;
    bool res = ERROR_SUCCESS == RegOpenKeyEx(HKEY_CURRENT_USER, path, 0, KEY_READ, &hkey);
    RegCloseKey(hkey);
    return res;
}

bool WRITE_REG()
{
    HKEY hkey;
    DWORD dwrod;
    if(ERROR_SUCCESS != RegCreateKeyEx(HKEY_CURRENT_USER, path, 0, NULL,
    REG_OPTION_NON_VOLATILE, KEY_ALL_ACCESS, NULL, &hkey, &dwrod))
    {
        return false;
    }
    if(ERROR_SUCCESS != RegSetValueEx(hkey, NULL, 0, REG_SZ, 
    (BYTE*)config_path.c_str(), config_path.length())){
        RegCloseKey(hkey);
        return false;
    }
    RegCloseKey(hkey);
    return true;
}

bool RM_REG(){
    return ERROR_SUCCESS == RegDeleteKey(HKEY_CURRENT_USER, path);
}

int main()
{
    save_config();
    if(EXIST_REG())
    {
        if(RM_REG()){
            MessageBox(GetConsoleWindow(), "É¾³ý×¢²á±í³É¹¦£¡", "Info", MB_OK);
        }
        else{
            MessageBox(GetConsoleWindow(), "É¾³ý×¢²á±íÊ§°Ü£¡", "Info", MB_OK);
        }
    }
    else
    {
        if(WRITE_REG()){
            MessageBox(GetConsoleWindow(), "×¢Èë×¢²á±í³É¹¦£¡", "Info", MB_OK);
        }
        else{
            MessageBox(GetConsoleWindow(), "×¢Èë×¢²á±íÊ§°Ü£¡", "Info", MB_OK);
        }
    }
    return 0;
}