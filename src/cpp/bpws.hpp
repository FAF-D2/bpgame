#ifndef _BPWS_HPP
#define _BPWS_HPP
#include<WinSock2.h>
#include<Windows.h>
#include<io.h>
#include<string.h>
#include<string>
#include<thread>
#include<mutex>
#include<utility>
#include<fstream>
#include"crypt.hpp"
#pragma comment(lib, "ws2_32.lib")
constexpr int _MAX_LISTEN = 20;
constexpr int _MAX_WAIT_TIME = 30000; // 30s to ping
constexpr int _MAX_BUFFER_LEN = 2048;
static_assert(_MAX_BUFFER_LEN % 4 == 0 && _MAX_BUFFER_LEN >= 512, 
    "buffer_len: should be a multiple of 4 and >= 512");

static const char* WS_RESPONSE = "HTTP/1.1 101 Switching Protocols\r\n\
Upgrade: websocket\r\nConnection: Upgrade\r\n\
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n\r\n";

// windows socket environment
int _init_WSA();
void _clear_WSA();

// make socket
int _init_ws();
int _init_socket(SOCKET& sock);
u_short _getPort(SOCKET& sock);
void _listener(SOCKET&& sock, int max_listen);

// ws handler - little
void _web_socket(SOCKET&& client);
void _consumer(SOCKET& client, char* buffer);
int _REMOVE(std::string&& filename);
int _WRITE_INIT(std::ofstream& ofs, int mode, std::string&& filename);

// static context and mutex
static std::string context;
static std::mutex context_mutex;

int _init_socket(SOCKET& sock)
{
    if (sock == INVALID_SOCKET) {
        return 0;
    }
    sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = 0;
    addr.sin_addr.S_un.S_addr = INADDR_ANY;
    if (bind(sock, (LPSOCKADDR)&addr, sizeof(addr)) == SOCKET_ERROR) {
        return 0;
    }
    return 1;
}

u_short _getPort(SOCKET& sock)
{
    sockaddr_in addr;
    int size = sizeof(addr);
    if (getsockname(sock, (LPSOCKADDR)&addr, &size) != 0) {
        return 0;
    }
    return ntohs(addr.sin_port);
}

int _init_WSA()
{
    WORD version = MAKEWORD(2, 2);
    WSADATA wsadata;
    return WSAStartup(version, &wsadata) != 0;
}

void _clear_WSA(){
    WSACleanup();
}

int _init_ws()
{
    // init
    SOCKET server = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (!_init_socket(server)) {
        closesocket(server);
        return 0;
    }
    u_short port = _getPort(server);
    if (!port) {
        closesocket(server);
        return 0;
    }
    std::thread listener(
        _listener,
        std::move(server),
        _MAX_LISTEN
    );
    listener.detach();
    return port;
}

void _listener(SOCKET&& sock, int max_listen = _MAX_LISTEN)
{
    if (listen(sock, max_listen) == SOCKET_ERROR) {
        return;
    }
    while (true)
    {
        SOCKET client = accept(sock, NULL, NULL);
        if (client == INVALID_SOCKET) {
            break;
        }
        std::thread task(
            _web_socket,
            std::move(client)
        );
        task.detach();
    }
    if(sock != INVALID_SOCKET){
        closesocket(sock);
    }
}

void _web_socket(SOCKET&& client) {
    // init and connect
    char* buffer = new char[_MAX_BUFFER_LEN];
    {
        int time = _MAX_WAIT_TIME; // 30s
        int set = setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, (const char*)&time, sizeof(time));
        if (set != 0)
        {
            delete[] buffer;
            closesocket(client);
            return;
        }
        int ret = recv(client, buffer, 512, 0);
        if (ret <= 0 || ret >= 512 || (*(int*)buffer != 0x20544547))
        {
            delete[] buffer;
            closesocket(client);
            return;
        }
        // find key and encrpty
        const char* cmp = "Sec-WebSocket-Key: ";
        int i = 16, j = 0;
        while (i < ret)
        {
            if (j == 19) {
                break;
            }
            else if (buffer[i] == cmp[j]) {
                ++j;
                ++i;
            }
            else {
                j = 0;
                ++i;
                continue;
            }
        }
        if (j != 19 || i + 24 >= ret) {
            delete[] buffer;
            closesocket(client);
            return;
        }
        // encrypt and send response
        char key[64];
        memcpy(key, buffer + i, 24);
        memcpy(key + 24, "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", 36);
        sha1(key, key, 60);
        base64(key + 32, key, 20);

        memcpy(buffer, WS_RESPONSE, 129);
        memcpy(buffer + 97, key + 32, 28);
        send(client, buffer, 129, 0);
    }
    // connect done, recv
    _consumer(client, buffer);

    // done
    delete[] buffer;
    closesocket(client);
}

void _consumer(SOCKET& client, char* buffer)
{
    context_mutex.lock();
    std::string ctx = context;
    context_mutex.unlock();
    std::ofstream ofs;
    int status_ws = 0;
    while (true)
    {
        if (status_ws == 0) {
            // check header
            int ret = recv(client, buffer, 256, 0);
            {
                //time over ping client
                if (ret == SOCKET_ERROR) {
                    char ping_pong[8] = { '\x89', '\x00' };
                    if (send(client, ping_pong, 2, 0) != 2) {
                        break;
                    }
                    if (recv(client, ping_pong, 6, 0) != 6) {
                        break;
                    }
                    if (*((u_short*)ping_pong) != 0x808a) {
                        break;
                    }
                    continue;
                }
            }
            if (ret < 2 || ret >= 256) {
                break;
            }
            u_short status = *((u_short*)buffer);
            if ((status & 0x808f) != 0x8081) {
                break;
            }
            unsigned int offset = 2, len = (status & 0x7f00) >> 8;
            if (len < 4 || len >= 127) {
                break;
            }
            else if (len == 126) {
                *(((unsigned char*)&len) + 1) = buffer[2];
                *(((unsigned char*)&len)) = buffer[3];
                offset = 4;
            }
            // mask decode
            unsigned int num_blocks = len / 4;
            for (unsigned int i = 0; i < num_blocks; i++) {
                *((int*)(buffer + 4 * i + offset + 4)) ^= *((int*)(buffer + offset));
            }
            for (unsigned int i = 0; i < len % 4; i++) {
                buffer[num_blocks * 4 + i + offset + 4] ^= buffer[i + offset];
            }
            buffer[len + offset + 4] = '\0';
            // opt check
            u_short opt = *((u_short*)(buffer + offset + 4));
            auto rm_dot = [len, offset, buffer]() {
                int flag = 0;
                for (unsigned int i = len + offset + 3; i >= offset + 7; i--) {
                    if (buffer[i] == '.') {
                        if (!flag) {
                            flag = 1;
                        }
                        else {
                            buffer[i] = '/';
                        }
                    }
                }
            };
            if (opt == 0x6d72) {
                // rm
                rm_dot();
                char response[4] = { '\x81', '\x02', 'r', '0' };  // e.g. __r0
                response[3] += _REMOVE(std::move(ctx + (buffer + offset + 7)));
                if (send(client, response, 4, 0) != 4) {
                    break;
                }
            }
            else if (opt == 0x6277) {
                // wb
                rm_dot();
                char response[4] = { '\x81', '\x02', 'w', '0' };
                int ret = _WRITE_INIT(ofs, std::ios::out | std::ios::binary, 
                std::move(ctx + (buffer + offset + 7)));
                response[3] += ret;
                if (send(client, response, 4, 0) != 4) {
                    break;
                }
                status_ws = !ret;
            }
            else if (opt == 0x6261) {
                // ab
                rm_dot();
                char response[4] = { '\x81', '\x02', 'a', '0' };
                int ret = _WRITE_INIT(ofs, std::ios::app | std::ios::binary, 
                std::move(ctx + (buffer + offset + 7)));
                response[3] += ret;
                if (send(client, response, 4, 0) != 4) {
                    break;
                }
                status_ws = !ret;
            }
            else {
                break;
            }
        }
        else if (status_ws == 1) {
            int code = 0;
            while (true)
            {
                // check header and len
                int ret = recv(client, buffer, _MAX_BUFFER_LEN, 0);
                if (ret <= 6) {
                    code = 1;
                    break;
                }
                u_short status = *((u_short*)buffer);
                if ((status & 0x8000) != 0x8000) {
                    code = 2;
                    break; // no mask
                }
                u_short flag = (status & 0x0080) == 0x0080; // if fin
                unsigned int offset = 2;
                unsigned long len = (status & 0x7f00) >> 8;
                if (len == 126) {
                    *(((unsigned char*)&len) + 1) = buffer[2];
                    *(((unsigned char*)&len)) = buffer[3];
                    offset = 4;
                }
                else if (len == 127) {
                    *(((unsigned char*)&len) + 7) = buffer[2];
                    *(((unsigned char*)&len) + 6) = buffer[3];
                    *(((unsigned char*)&len) + 5) = buffer[4];
                    *(((unsigned char*)&len) + 4) = buffer[5];
                    *(((unsigned char*)&len) + 3) = buffer[6];
                    *(((unsigned char*)&len) + 2) = buffer[7];
                    *(((unsigned char*)&len) + 1) = buffer[8];
                    *(((unsigned char*)&len)) = buffer[9];
                    offset = 10;
                }
                // small data or BIG DATA
                if(len <= _MAX_BUFFER_LEN - offset - 4)
                {
                    unsigned int num_blocks = len / 4;
                    for (unsigned int i = 0; i < num_blocks; i++) {
                        *((int*)(buffer + 4 * i + offset + 4)) ^= *((int*)(buffer + offset));
                    }
                    for (unsigned int i = 0; i < len % 4; i++) {
                        buffer[num_blocks * 4 + i + offset + 4] ^= buffer[i + offset];
                    }
                    ofs.write(buffer + offset + 4, len);
                }
                else
                {
                    unsigned int head_len = (_MAX_BUFFER_LEN - offset - 4);
                    unsigned int times = (len - head_len) / _MAX_BUFFER_LEN;
                    unsigned int tail_len = (len - head_len) % _MAX_BUFFER_LEN;
                    unsigned int mask = *((int*)(buffer + offset));
                    {
                        // head block
                        for (unsigned int i = 0; i < head_len / 4; i++) {
                            *((unsigned int*)(buffer + 4 * i + offset + 4)) ^= mask;
                        }
                        unsigned int head_left = head_len % 4;
                        for (unsigned int i = 0; i < head_left; i++) {
                            buffer[head_len - head_left + i + offset] ^= *(((char*)&mask) + i);
                        }
                        ofs.write(buffer + offset + 4, head_len);
                        if(head_left == 2){
                            // It occurs when offset == 10, a really big file
                            // buffer_len = 4*n, left = (4n - offset) % 4
                            // when offset == 2, left == 2, but it is a small file
                            // when offset == 4, left == 0, no need to transform mask
                            // when offset == 10, left == 2, mask should be moved
                            mask = mask >> 16;
                            *(((unsigned char*)&mask) + 2) = buffer[offset];
                            *(((unsigned char*)&mask) + 3) = buffer[offset + 1];
                        }
                    }
                    {
                        // body blocks
                        for(unsigned int i = 0; i < times; i++)
                        {
                            if(recv(client, buffer, _MAX_BUFFER_LEN, MSG_WAITALL) != _MAX_BUFFER_LEN)
                            {
                                break;
                            }
                            for(int i = 0; i < _MAX_BUFFER_LEN / 4; i++){
                                *((unsigned int*)buffer + i) ^= mask;
                            }
                            ofs.write(buffer, _MAX_BUFFER_LEN);
                        }
                    }
                    {
                        // tail block
                        if(recv(client, buffer, tail_len, MSG_WAITALL) != tail_len){
                            break;
                        }
                        unsigned int tail_left = tail_len % 4;
                        for(unsigned int i = 0; i < tail_len / 4; i++){
                            *((unsigned int*)buffer + i) ^= mask;
                        }
                        for(unsigned int i=0; i < tail_left; i++){
                            buffer[tail_len - tail_left + i] ^= *(((char*)&mask) + i);
                        }
                        ofs.write(buffer, tail_len);
                    }
                }
                if (flag) {
                    break;
                }
            }
            ofs.close();
            status_ws = 0;
            char response[4] = { '\x81', '\x02', 'W', '0' + code };
            if (send(client, response, 4, 0) != 4) {
                break;
            }
        }
    }
}

// remove status code
// --- 0: success
// --- 1: remove fail
// --- 2: no such file
int _REMOVE(std::string&& filename)
{
    if (_access(filename.c_str(), 0) == -1) {
        return 2;
    }
    return remove(filename.c_str()) != 0;
}


// write init status code
// --- 0: success
// --- 1: exists but no permission
// --- 2: create fail
int _WRITE_INIT(std::ofstream& ofs, int mode, std::string&& filename)
{
    if (_access(filename.c_str(), 2) != -1)
    {
        ofs.open(filename, mode);
        if (!ofs.is_open()) {
            ofs.close();
            return 1;
        }
        return 0;
    }
    ofs.open(filename, mode);
    if (!ofs.is_open()) {
        ofs.close();
        return 2;
    }
    return 0;
}

#endif