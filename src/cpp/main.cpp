#include<iostream>
#include<memory>
#include<io.h>
#include<fcntl.h>
#include<direct.h>
#include"bpws.hpp"

template<class T>
using uptr = typename std::unique_ptr<T>;

using msgpair = std::pair<uptr<char>, int>;

//---------------------------
// communicate with Chrome
class ChromePipe {
public:
    ChromePipe() {
        _setmode(_fileno(stdout), O_BINARY);
        _setmode(_fileno(stdin), O_BINARY);
    }
    ChromePipe(const ChromePipe&) = delete;
    ~ChromePipe() = default;

    void send(char* data, unsigned int len) {
        std::cout << char((len >> 0) & 0xFF)
            << char((len >> 8) & 0xFF)
            << char((len >> 16) & 0xFF)
            << char((len >> 24) & 0xFF);
        std::cout.write(data, len);
        std::cout.flush();
    }
    msgpair read(unsigned int max_len = 0) {
        unsigned int msg_len = 0;
        fgets((char*)&msg_len, 5, stdin);
        if(msg_len <= 0){
            return std::move(msgpair(nullptr, -1));
        }
        if (max_len != 0) {
            if (msg_len > max_len) {
                return std::move(msgpair(nullptr, -1));
            }
        }
        uptr<char> buffer(new char[msg_len]);
        fgets(buffer.get(), msg_len, stdin);
        return std::move(msgpair(std::move(buffer), msg_len));
    }
};
static ChromePipe chromepipe;

std::string control_path()
{
    char buffer[512];
    _getcwd(buffer, 512);
    return std::move(std::string(buffer) + "/../Assets/games/");
}
static std::string _Path = control_path();

void send_port(int port){
    // ushort to str and send port
    char port_str[8];
    port_str[6] = '0';
    int i = 6;
    while (port) {
        port_str[i--] = port % 10 + 48;
        port /= 10;
    }
    port_str[7] = '\"';
    port_str[i] = '\"';
    chromepipe.send(port_str + i, 8 - i);
}

void _main()
{
    _init_WSA();
    int _init = 0;
    while (true)
    {
        msgpair res = chromepipe.read();
        if (res.second <= 0) {
            // close
            break;
        }
        else if (res.first.get()[1] == '\\' && res.second == 3) {
            // TODO root
            continue;
        }
        else {
            // ctx change
            std::string ctx = _Path;
            for (int i = 1; i < res.second - 1; i++) {
                ctx += res.first.get()[i];
            }
            ctx += '\\';
            if (_access(ctx.c_str(), 0) != -1) {
                context_mutex.lock();
                context = std::move(ctx);
                context_mutex.unlock();
                if(_init){
                    char res[] = "\"1\"";
                    chromepipe.send(res, 3);
                }
                else{
                    send_port(_init_ws());
                    _init = 1;
                }
            }
            else{
                if (_init) {
                    char res[] = "\"0\"";
                    chromepipe.send(res, 3);
                }
            }
        }
    }
    _clear_WSA();
}

int main()
{
    _main();
    return 0;
}