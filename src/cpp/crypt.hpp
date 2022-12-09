#ifndef _CRYPT_HPP
#define _CRYPT_HPP
#include<string.h>
using uint = unsigned int;
using ulong = unsigned long;
constexpr ulong _H0 = 0x67452301UL;
constexpr ulong _H1 = 0xefcdab89UL;
constexpr ulong _H2 = 0x98badcfeUL;
constexpr ulong _H3 = 0x10325476UL;
constexpr ulong _H4 = 0xc3d2e1f0UL;

constexpr ulong _K_00_19 = 0x5a827999UL;
constexpr ulong _K_20_39 = 0x6ed9eba1UL;
constexpr ulong _K_40_59 = 0x8f1bbcdcUL;
constexpr ulong _K_60_79 = 0xca62c1d6UL;
#define _S(v, n) (((v) << (n)) | ((v) >> (32 - (n))))
#define _F_00_19(b, c, d)  ((((c) ^ (d)) & (b)) ^ (d))
#define _F_20_39(b, c, d)  ((b) ^ (c) ^ (d))
#define _F_40_59(b, c, d)  (((b) & (c)) | (((b)|(c)) & (d)))
#define _F_60_79(b, c, d)  ((b) ^ (c) ^ (d))

#define Xupdate(a,ix,ia,ib,ic,id) \
        ((a)=(ia^ib^ic^id), ix=(a)=_S((a), 1))

#define BODY_00_15(i,a,b,c,d,e,f,xi) \
        (f)=xi+(e)+_K_00_19+_S((a), 5)+_F_00_19((b),(c),(d)); \
        (b)=_S((b),30);

#define BODY_16_19(i,a,b,c,d,e,f,xi,xa,xb,xc,xd) \
        Xupdate(f,xi,xa,xb,xc,xd); \
        (f)+=(e)+_K_00_19+_S((a),5)+_F_00_19((b),(c),(d)); \
        (b)=_S((b),30);

#define BODY_20_31(i,a,b,c,d,e,f,xi,xa,xb,xc,xd) \
        Xupdate(f,xi,xa,xb,xc,xd); \
        (f)+=(e)+_K_20_39+_S((a),5)+_F_20_39((b),(c),(d)); \
        (b)=_S((b),30);

#define BODY_32_39(i,a,b,c,d,e,f,xa,xb,xc,xd) \
        Xupdate(f,xa,xa,xb,xc,xd); \
        (f)+=(e)+_K_20_39+_S((a),5)+_F_20_39((b),(c),(d)); \
        (b)=_S((b),30);

#define BODY_40_59(i,a,b,c,d,e,f,xa,xb,xc,xd) \
        Xupdate(f,xa,xa,xb,xc,xd); \
        (f)+=(e)+_K_40_59+_S((a),5)+_F_40_59((b),(c),(d)); \
        (b)=_S((b),30);

#define BODY_60_79(i,a,b,c,d,e,f,xa,xb,xc,xd) \
        Xupdate(f,xa,xa,xb,xc,xd); \
        (f)=xa+(e)+_K_60_79+_S((a),5)+_F_60_79((b),(c),(d)); \
        (b)=_S((b),30);

void _CHAR_TO_LONG(const unsigned char* c, ulong& l)
{
    l = (((ulong)(*(c++))) << 24);
    l |= (((ulong)(*(c++))) << 16);
    l |= (((ulong)(*(c++))) << 8);
    l |= (((ulong)(*(c++))));
}

void _LONG_TO_CHAR(unsigned char* c, ulong l)
{
    *(c++) = (unsigned char)((l >> 24) & 0xff);
    *(c++) = (unsigned char)((l >> 16) & 0xff);
    *(c++) = (unsigned char)((l >> 8) & 0xff);
    *(c++) = (unsigned char)((l) & 0xff);
}

int sha1(void* dst, void* _data, uint len)
{
    if (len != 60) {
        return 0;
    }
    unsigned char data[128];
    memcpy(data, _data, len);
    // pad
    ulong low = ((len << 3) & 0xffffffffUL);
    ulong high = (len >> 29);
    data[len++] = 0x80;
    memset(data + len, 0, 59);

    _LONG_TO_CHAR(data + 120, high);
    _LONG_TO_CHAR(data + 124, low);

    ulong A = _H0, B = _H1, C = _H2, D = _H3, E = _H4;
    ulong H[5] = { A, B, C, D, E };
    ulong T, l;
    uint XX[16];
    for (int i = 0; i < 2; i++)
    {
        // 00 - 15
        int offset = 64 * i;
        _CHAR_TO_LONG(data + offset, l); XX[0] = l;
        _CHAR_TO_LONG(data + 4 + offset, l); XX[1] = l;
        BODY_00_15(0, A, B, C, D, E, T, XX[0]);
        _CHAR_TO_LONG(data + 8 + offset, l); XX[2] = l;
        BODY_00_15(1, T, A, B, C, D, E, XX[1]);
        _CHAR_TO_LONG(data + 12 + offset, l); XX[3] = l;
        BODY_00_15(2, E, T, A, B, C, D, XX[2]);
        _CHAR_TO_LONG(data + 16 + offset, l); XX[4] = l;
        BODY_00_15(3, D, E, T, A, B, C, XX[3]);
        _CHAR_TO_LONG(data + 20 + offset, l); XX[5] = l;
        BODY_00_15(4, C, D, E, T, A, B, XX[4]);
        _CHAR_TO_LONG(data + 24 + offset, l); XX[6] = l;
        BODY_00_15(5, B, C, D, E, T, A, XX[5]);
        _CHAR_TO_LONG(data + 28 + offset, l); XX[7] = l;
        BODY_00_15(6, A, B, C, D, E, T, XX[6]);
        _CHAR_TO_LONG(data + 32 + offset, l); XX[8] = l;
        BODY_00_15(7, T, A, B, C, D, E, XX[7]);
        _CHAR_TO_LONG(data + 36 + offset, l); XX[9] = l;
        BODY_00_15(8, E, T, A, B, C, D, XX[8]);
        _CHAR_TO_LONG(data + 40 + offset, l); XX[10] = l;
        BODY_00_15(9, D, E, T, A, B, C, XX[9]);
        _CHAR_TO_LONG(data + 44 + offset, l); XX[11] = l;
        BODY_00_15(10, C, D, E, T, A, B, XX[10]);
        _CHAR_TO_LONG(data + 48 + offset, l); XX[12] = l;
        BODY_00_15(11, B, C, D, E, T, A, XX[11]);
        _CHAR_TO_LONG(data + 52 + offset, l); XX[13] = l;
        BODY_00_15(12, A, B, C, D, E, T, XX[12]);
        _CHAR_TO_LONG(data + 56 + offset, l); XX[14] = l;
        BODY_00_15(13, T, A, B, C, D, E, XX[13]);
        _CHAR_TO_LONG(data + 60 + offset, l); XX[15] = l;
        BODY_00_15(14, E, T, A, B, C, D, XX[14]);
        BODY_00_15(15, D, E, T, A, B, C, XX[15]);

        //16 -31
        BODY_16_19(16, C, D, E, T, A, B, XX[0], XX[0], XX[2], XX[8], XX[13]);
        BODY_16_19(17, B, C, D, E, T, A, XX[1], XX[1], XX[3], XX[9], XX[14]);
        BODY_16_19(18, A, B, C, D, E, T, XX[2], XX[2], XX[4], XX[10], XX[15]);
        BODY_16_19(19, T, A, B, C, D, E, XX[3], XX[3], XX[5], XX[11], XX[0]);

        BODY_20_31(20, E, T, A, B, C, D, XX[4], XX[4], XX[6], XX[12], XX[1]);
        BODY_20_31(21, D, E, T, A, B, C, XX[5], XX[5], XX[7], XX[13], XX[2]);
        BODY_20_31(22, C, D, E, T, A, B, XX[6], XX[6], XX[8], XX[14], XX[3]);
        BODY_20_31(23, B, C, D, E, T, A, XX[7], XX[7], XX[9], XX[15], XX[4]);
        BODY_20_31(24, A, B, C, D, E, T, XX[8], XX[8], XX[10], XX[0], XX[5]);
        BODY_20_31(25, T, A, B, C, D, E, XX[9], XX[9], XX[11], XX[1], XX[6]);
        BODY_20_31(26, E, T, A, B, C, D, XX[10], XX[10], XX[12], XX[2], XX[7]);
        BODY_20_31(27, D, E, T, A, B, C, XX[11], XX[11], XX[13], XX[3], XX[8]);
        BODY_20_31(28, C, D, E, T, A, B, XX[12], XX[12], XX[14], XX[4], XX[9]);
        BODY_20_31(29, B, C, D, E, T, A, XX[13], XX[13], XX[15], XX[5], XX[10]);
        BODY_20_31(30, A, B, C, D, E, T, XX[14], XX[14], XX[0], XX[6], XX[11]);
        BODY_20_31(31, T, A, B, C, D, E, XX[15], XX[15], XX[1], XX[7], XX[12]);

        //32 - 39
        BODY_32_39(32, E, T, A, B, C, D, XX[0], XX[2], XX[8], XX[13]);
        BODY_32_39(33, D, E, T, A, B, C, XX[1], XX[3], XX[9], XX[14]);
        BODY_32_39(34, C, D, E, T, A, B, XX[2], XX[4], XX[10], XX[15]);
        BODY_32_39(35, B, C, D, E, T, A, XX[3], XX[5], XX[11], XX[0]);
        BODY_32_39(36, A, B, C, D, E, T, XX[4], XX[6], XX[12], XX[1]);
        BODY_32_39(37, T, A, B, C, D, E, XX[5], XX[7], XX[13], XX[2]);
        BODY_32_39(38, E, T, A, B, C, D, XX[6], XX[8], XX[14], XX[3]);
        BODY_32_39(39, D, E, T, A, B, C, XX[7], XX[9], XX[15], XX[4]);

        // 40 - 59
        BODY_40_59(40, C, D, E, T, A, B, XX[8], XX[10], XX[0], XX[5]);
        BODY_40_59(41, B, C, D, E, T, A, XX[9], XX[11], XX[1], XX[6]);
        BODY_40_59(42, A, B, C, D, E, T, XX[10], XX[12], XX[2], XX[7]);
        BODY_40_59(43, T, A, B, C, D, E, XX[11], XX[13], XX[3], XX[8]);
        BODY_40_59(44, E, T, A, B, C, D, XX[12], XX[14], XX[4], XX[9]);
        BODY_40_59(45, D, E, T, A, B, C, XX[13], XX[15], XX[5], XX[10]);
        BODY_40_59(46, C, D, E, T, A, B, XX[14], XX[0], XX[6], XX[11]);
        BODY_40_59(47, B, C, D, E, T, A, XX[15], XX[1], XX[7], XX[12]);
        BODY_40_59(48, A, B, C, D, E, T, XX[0], XX[2], XX[8], XX[13]);
        BODY_40_59(49, T, A, B, C, D, E, XX[1], XX[3], XX[9], XX[14]);
        BODY_40_59(50, E, T, A, B, C, D, XX[2], XX[4], XX[10], XX[15]);
        BODY_40_59(51, D, E, T, A, B, C, XX[3], XX[5], XX[11], XX[0]);
        BODY_40_59(52, C, D, E, T, A, B, XX[4], XX[6], XX[12], XX[1]);
        BODY_40_59(53, B, C, D, E, T, A, XX[5], XX[7], XX[13], XX[2]);
        BODY_40_59(54, A, B, C, D, E, T, XX[6], XX[8], XX[14], XX[3]);
        BODY_40_59(55, T, A, B, C, D, E, XX[7], XX[9], XX[15], XX[4]);
        BODY_40_59(56, E, T, A, B, C, D, XX[8], XX[10], XX[0], XX[5]);
        BODY_40_59(57, D, E, T, A, B, C, XX[9], XX[11], XX[1], XX[6]);
        BODY_40_59(58, C, D, E, T, A, B, XX[10], XX[12], XX[2], XX[7]);
        BODY_40_59(59, B, C, D, E, T, A, XX[11], XX[13], XX[3], XX[8]);

        // 60 - 79
        BODY_60_79(60, A, B, C, D, E, T, XX[12], XX[14], XX[4], XX[9]);
        BODY_60_79(61, T, A, B, C, D, E, XX[13], XX[15], XX[5], XX[10]);
        BODY_60_79(62, E, T, A, B, C, D, XX[14], XX[0], XX[6], XX[11]);
        BODY_60_79(63, D, E, T, A, B, C, XX[15], XX[1], XX[7], XX[12]);
        BODY_60_79(64, C, D, E, T, A, B, XX[0], XX[2], XX[8], XX[13]);
        BODY_60_79(65, B, C, D, E, T, A, XX[1], XX[3], XX[9], XX[14]);
        BODY_60_79(66, A, B, C, D, E, T, XX[2], XX[4], XX[10], XX[15]);
        BODY_60_79(67, T, A, B, C, D, E, XX[3], XX[5], XX[11], XX[0]);
        BODY_60_79(68, E, T, A, B, C, D, XX[4], XX[6], XX[12], XX[1]);
        BODY_60_79(69, D, E, T, A, B, C, XX[5], XX[7], XX[13], XX[2]);
        BODY_60_79(70, C, D, E, T, A, B, XX[6], XX[8], XX[14], XX[3]);
        BODY_60_79(71, B, C, D, E, T, A, XX[7], XX[9], XX[15], XX[4]);
        BODY_60_79(72, A, B, C, D, E, T, XX[8], XX[10], XX[0], XX[5]);
        BODY_60_79(73, T, A, B, C, D, E, XX[9], XX[11], XX[1], XX[6]);
        BODY_60_79(74, E, T, A, B, C, D, XX[10], XX[12], XX[2], XX[7]);
        BODY_60_79(75, D, E, T, A, B, C, XX[11], XX[13], XX[3], XX[8]);
        BODY_60_79(76, C, D, E, T, A, B, XX[12], XX[14], XX[4], XX[9]);
        BODY_60_79(77, B, C, D, E, T, A, XX[13], XX[15], XX[5], XX[10]);
        BODY_60_79(78, A, B, C, D, E, T, XX[14], XX[0], XX[6], XX[11]);
        BODY_60_79(79, T, A, B, C, D, E, XX[15], XX[1], XX[7], XX[12]);
        H[0] = (H[0] + E) & 0xffffffffL;
        H[1] = (H[1] + T) & 0xffffffffL;
        H[2] = (H[2] + A) & 0xffffffffL;
        H[3] = (H[3] + B) & 0xffffffffL;
        H[4] = (H[4] + C) & 0xffffffffL;
        A = H[0];
        B = H[1];
        C = H[2];
        D = H[3];
        E = H[4];
    }

    _LONG_TO_CHAR((unsigned char*)dst, A);
    _LONG_TO_CHAR((unsigned char*)dst + 4, B);
    _LONG_TO_CHAR((unsigned char*)dst + 8, C);
    _LONG_TO_CHAR((unsigned char*)dst + 12, D);
    _LONG_TO_CHAR((unsigned char*)dst + 16, E);
    return 1;
}

static const char* _BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";


#define _BASE_TAIL_2(i, dst, data) \
        *((dst)++)=_BASE64_TABLE[(*((data)))>>2]; \
        *((dst)++)=_BASE64_TABLE[(((*((data)))<<4)&0x30)|((*((data)+1))>>4)];++(data); \
        *((dst)++)=_BASE64_TABLE[(((*((data)))<<2)&0x3c)]; \
        *((dst))= '=';

#define _BASE_BODY(i,dst,data) \
        *((dst)++)=_BASE64_TABLE[(*(data))>>2]; \
        *((dst)++)=_BASE64_TABLE[(((*((data)))<<4)&0x30)|((*((data)+1))>>4)];++(data); \
        *((dst)++)=_BASE64_TABLE[(((*((data)))<<2)&0x3c)|((*((data)+1))>>6)];++(data); \
        *((dst)++)=_BASE64_TABLE[(*((data)++))&0x3f]; \

int base64(void* dst, void* data, int len)
{
    if (len != 20) {
        return 0;
    }
    unsigned char* _dst = (unsigned char*)dst;
    unsigned char* _data = (unsigned char*)data;
    _BASE_BODY(0, _dst, _data);
    _BASE_BODY(1, _dst, _data);
    _BASE_BODY(2, _dst, _data);
    _BASE_BODY(3, _dst, _data);
    _BASE_BODY(4, _dst, _data);
    _BASE_BODY(5, _dst, _data);
    _BASE_TAIL_2(6, _dst, _data);
    return 1;
}

#endif