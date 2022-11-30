<div align="center"><b>[ bpgame  一个在web bilibili上运行的简单游戏扩展 ]</b></div>  

# 项目介绍  (0.2 dev分支开发中)

#### 目前版本：v0.1.0

**注意: 扩展仍在开发中（目前还比较残疾），在stable版本出来前还请谨慎使用**

  
**bpgame是一个能够在b站上快速实现有趣想法的扩展**<font size="1">~~因b站互动视频功能垃圾~~</font>  
**观看一个小demo预览插件的功能吧 -----> [seyana](https://www.bilibili.com/video/BV1ig411C7Yu)**  

**其目标定位如下：**  
- **在b站游玩他人分发的有趣游戏**
- **使用该扩展提供的API，配合视频制作技术，快速实现你的有趣想法并分发出去**  

### 目前封装的功能有
- **InputSystem**
- **视频控制（跳转，暂停...）**
- **文件IO（本地IO已支持）**
- **使用Pixijs进行2d渲染**  
- **基于Pixijs的开发工具箱**
---


# ~~如何安装和使用~~（即将以dev分支为准）
### 目前因扩展未完善，请在开发者模式下使用
### 如果因扩展影响了web版b站的正常使用，请随时关闭此扩展  
#### 安装
- 先确保电脑安装了较新版本的Chrome浏览器
- 下载该扩展文件夹
- 在Chrome扩展（浏览器右上角中）勾选开发者模式
- 选择<加载已解压的扩展程序>，选择下载的扩展文件夹, 安装完毕！
- 更详细的图文教程可参照 -> [安装bpgame扩展](https://www.bilibili.com/read/cv17949898)  

#### 安装游戏
- 游戏均要放在本地**global/Assests**文件夹下（新安装的扩展内置seyana游戏，可在<https://www.bilibili.com/video/BV1BG411h7NV>进行测试）
- 下载他人分发的游戏文件夹解压到 **global/Assests** 文件夹，在 **global/Assests/gamelist.json** 中添加 **bv号和文件夹的对应关系**
- 找到他人分发的游戏视频，按下enter即可进入bpgame游戏模式
- 如要中途退出则按**两下esc**，界面退出全屏并清除游戏资源

#### 开始游戏
- 除**enter进入游戏**和**两下esc**为扩展内置按键外，其他游戏操作均以up主分发时为准


# ~~使用bpgame开发自己的《video game》~~（即将以dev分支为准）
完整的**API**文档可以在这里找到 -> [bpgame API](/doc/api.md)  
在**example**文件夹下是一些[建议](/example/example.md)和示例（示例后续会慢慢添加）
### ~~整体步骤~~
- 新建项目文件夹
- 项目文件夹下**必须**要有**info.json**，里面包含了项目信息，结构参照 -> [info示例](/example/seyana/info.json)
- 组织你的代码和资源，最后压缩后分发给他人
- 他人下载并解压你的文件夹到**global/Assests**并在**gamelist.json**中添加**bv**号信息即可游玩（后续会简化此步骤）
---
# 参与项目开发
***bpgame欢迎所有人的参与，有任何问题和想法都可在issue中提出！***  
### ~~主要代码文件~~（即将以dev分支为准）
- **[background后台](/global/backend.js) ---> 主要监听页面改动和一些全局处理**
- **[页面脚本](/js/bplus_listener.js) ---> 将bv号与游戏列表比对，动态注入游戏脚本**
- **[API](/global/Assests/bplus_api.js) ---> 同游戏脚本一起，最先注入的api脚本**  

### ? RoadMap
- **popup扩展程序界面**
- **更换扩展icon**
- **完善功能，优化API**
- **简化安装游戏步骤**
- **增添更多的视频控制功能**
- **等等...**  

~~目测12月中旬可以从残疾到半残疾~~