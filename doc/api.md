# API文档
### 目前所有的api代码都放在 global/Assests/bplus_api.js 下
---
## 视频操作
使用全局变量**bplayer(Bvideo类)**对视频进行操作  
```
bplayer.jump_at(t)	  // 跳转到第t秒

bplayer.now_time();	// 返回视频现在所在的秒数(double)

bplayer.total_time();  // 返回视频的总时长(double)

bplayer.pause(); 	  // 视频暂停

bplayer.is_pause();    // 返回是否暂停(bool)

bplayer.fullscreen();  // 视频全屏

bplayer.is_fullscreen(); // 返回是否全屏

Bvideo.time2second("2:30") // static方法， 返回2:30的秒数（150.0）
```
---
## 绘图功能
### 创建html元素
**appendToContainer** 表示使用api创建的元素是否会加在id为"game-container"的div下  
该div覆盖整个视频之上，可以理解为在视频上方多加了个一层用于嵌入游戏  
**attributes** 用于设置html元素的属性  
**style** 用于设置html元素的css style
```
// 返回html img
create_img(src, appendToContainter=false, zIndex=1, attributes=null, style=null)

// 返回html button
create_button(onclick=null, appendToContainter=true, zIndex=1, attributes=null, style=null)

// 返回封装了html canvas的BWindow类
create_window(rx, ry, rwidth=-1, rheight=-1, appendToContainter=true, zIndex=0)
/* (rx, ry, rwidth, right) 表示相对父元素的定位和宽高
    如(0.5, 0.5, 0.4, 0.2) 表示在父元素居中的位置，宽为父元素的0.4， 高为0.2
    默认rwidth和rheight为-1 表示拉满，即(0.5, 0.5, -1, -1) === (0.5, 0.5, 1, 1) 
    动态绘图请尽量都在BWindow上进行  */
```
	
### 画图
使用 **BWindow** 在 **canvas** 上绘图

```
var window = create_window(0.5, 0.5);	// 创建一个居中屏幕， 全屏的画布

window.setStyle(pixelated);	// 设置canvas 画笔的样式，pixelated为内置的像素style

var img = create_img(src, false); 	// 创建一个img，false表示不加到container上

window.draw_img(img, 0.5, 0.5, 0.2, 0.2); // 在画布上画一个居中的，宽高均为画布20%的img

window.draw_rectangle(0.5, 0.5, 0.2, 0.2, "rgba(255, 0, 0, 1.0)"); // 在画布上画一个居中的，宽高均为画布20%的红色矩形

window.draw_font("bpgame", 0.5, 0.5, hollow=false); // 在画布正中上写字， hollow表示文字是否镂空

window.clear();	// 清除画布所有内容，一般用于帧绘制
```
注意：draw_img()如果在img未加载完毕时会异步等待img加载完再绘图  
详细参数可参见api文件中的 **BWindow** 类

---
## 按键监听和帧调用
目前按键监听有几率监听不到，功能持续开发和完善中...
```
start_key_listener(); // 调用此函数以开启按键监听
getkeydown(keycode['k']); // 当前帧是否按下k键
getkeyhold(keycode['k']); // 当前帧是否按住k键
bupdate(handler);	// 将一个handler函数绑定，每一帧进行调用
```

---
## 文件IO
文件IO尚未完善与测试，请尽量只调用下面示例的load函数加载本地资源
```
let req = {location: "local", data: "seyana/img/note/red.png"};
var url = load(req); // 这样会返回文件的扩展url
var img = create_img(url);

//或是直接
var img = load(req, (url) => create_img(url));

// load(url, handler)， 在handler不为false时，会使用handler处理返回的数据并返回handler的值

```
