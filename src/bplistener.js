// content scripts

//------------------------------
// utils, from Bilibili-Evolved: https://github.com/the1812/Bilibili-Evolved
const V2 = {
    "wrap" : ".bilibili-player-video-wrap",
    "state" : ".bilibili-player-video-state",
    "toast": ".bilibili-player-video-toast-wrp",
    "video": "video",
    "pause": ".bilibili-player-video-btn-start",
    "fullscreen": ".bilibili-player-video-btn-fullscreen",
    "control": ".bilibili-player-control-wrap",
    "progress": ".bilibili-player-video-progress",
    "danmaku": ".bilibili-player-video-danmaku-switch input",
    "game": "#GameScreen",
}

const V3 = {
    "wrap" : ".bpx-player-video-area",
    "state": ".bpx-player-state-wrap",
    "toast": ".bpx-player-toast-wrap",
    "video": "video",
    "pause": ".bpx-player-ctrl-btn-icon",
    "fullscreen": ".bpx-player-ctrl-full",
    "control": ".bpx-player-control-wrap",
    "progress": ".bpx-player-progress",
    "danmaku": ".bpx-player-dm-switch input",
    "game": "#GameScreen",
}

function selector(name, handler=function(e){return e;}){
    let element = document.querySelector(V3[name]);
    element = element ? element : document.querySelector(V2[name]);
    if(element){
        return handler(element);
    }
    console.log(`Error: can not find ${name}`);
    return null;
}

function _mask(e){
    e.stopPropagation();
}
let current_bvid = document.location.href.substring(31, 43);

//------------------------------
// extension file IO
async function open(file){
    let fullpath = chrome.runtime.getURL(file);
    try{
        let response = await fetch(fullpath);
        return await response.text();   
    }
    catch(err){
        console.log(err);
        return null;
    }
}

//------------------------------
// supervise, inject and remove

let _GameList = {};
function _get_game_list(){
    let gamelist = open("/Assets/games/gamelist.json");
    if(gamelist){
        return gamelist.then((text)=>{
            _GameList = JSON.parse(text);
        });
    }
}

let _GameIndex = null;
function _check_game(){
    let path = _GameList[current_bvid];
    if(!path){
        return 0;
    }
    let index = chrome.runtime.getURL(`/Assets/games/${path}/index.html`);
    _GameIndexInit(index);
    window.addEventListener("keydown", _cmdlistener, true);
    return 1;
}

let _start = false;
function _cmdlistener(e){
    let key = e.key.toLowerCase();
    if(!_start && key == "enter"){
        bplayer.fullscreen();
        selector("state", (state)=>{state.style.visibility = "hidden";});
        selector("toast", (toast)=>{toast.style.visibility = "hidden";});
        selector("control", (control)=>{control.style.visibility= "hidden";});
        selector("progress", (progress)=>{progress.style.visibility= "hidden";});
        selector("wrap", (video_wrap)=>{
            video_wrap.addEventListener("mousemove", _mask, true);
            setTimeout(()=>{
                video_wrap.append(_GameIndex);
            }, 100);
        });
        _start = true;
    }
}

function _GameIndexInit(index){
    _GameIndex = document.createElement("iframe");
    _GameIndex.id = "GameScreen";
    _GameIndex.style.position = "fixed";
    _GameIndex.style.top = 0;
    _GameIndex.style.left = 0;
    _GameIndex.style.width = "100%";
    _GameIndex.style.height = "100%";
    _GameIndex.style.overflow = "hidden";
    _GameIndex.style.border = "none";
    _GameIndex.style.zIndex = 2000000000;
    _GameIndex.allow = "autoplay;";
    _GameIndex.style.lineHeight = 0;
    _GameIndex.src = index;
}

function _GameExit(){
    selector("state", (state)=>{state.style.visibility = "visible";});
    selector("toast", (toast)=>{toast.style.visibility = "visible";});
    selector("control", (control)=>{control.style.visibility= "visible";});
    selector("progress", (progress)=>{progress.style.visibility= "visible";});
    selector("wrap", (video_wrap)=>{
        video_wrap.removeEventListener("mousemove", _mask, true);
    });
    _start = false;
    _ws_init = false;
    if(_GameIndex){
        _GameIndex.parentNode.removeChild(_GameIndex);
    }
}

//------------------------
// video controller
// TODO: change the api with async selector
class Bvideo{
    constructor(){
        this.video = null;
        this.pause_btn = null;
        this.fullscreen_btn = null;
        this.IsPaused = null;
        this.IsFullScreen = null;
        this.danmaku_btn = null;
    }
    _init(){
        this.IsPaused = false;
        this.IsFullScreen = false;
        if(this.video){
            this.IsPaused = this.video.paused;
            this.IsFullScreen = (this.video.clientWidth >= window.clientWidth)
        }
        else{
            selector("video", (e)=>{
                this.video = e;
                this.IsPaused = this.video.paused;
                this.IsFullScreen = (this.video.clientWidth >= window.clientWidth);
            });
        }
        this.pause_btn = this.pause_btn? this.pause_btn : selector("pause");
        this.fullscreen_btn = this.fullscreen_btn ? this.fullscreen_btn: selector("fullscreen");
        this.danmaku_btn = this.danmaku_btn ? this.danmaku_btn: selector("danmaku");
    }
    jump(t){
        if(!this.video){
            this._init();
        }
        t = (t <= 0? 0 : t);
        t = (t >= this.video.duration? this.video.duration - 1 : t);
        this.video.currentTime = t;
        return this.video.currentTime;
    }
    now(){
        if(!this.video){
            this._init();
        }
        return this.video.currentTime;
    }
    total(){
        if(!this.video){
            this._init();
        }
        return this.video.duration;
    }
    play(){
        if(!this.pause_btn){
            this._init();
        }
        if(!this.video.paused){
            return true;
        }
        this.pause_btn.click();
        this.IsPaused = this.video.paused;
        return !this.IsPaused;
    }
    pause(){
        if(!this.pause_btn){
            this._init();
        }
        if(this.video.paused){
            return true;
        }
        this.pause_btn.click();
        this.IsPaused = this.video.paused;
        return this.IsPaused;
    }
    fullscreen(){
        if(!this.fullscreen_btn){
            this._init();
        }
        this.fullscreen_btn.click();
        this.IsFullScreen = (this.video.clientWidth >= window.clientWidth);
        return this.IsFullScreen;
    }
    danmaku(on){
        if(!this.danmaku_btn){
            this._init();
        }
        if(on && !this.danmaku_btn.checked){
            // on == true
            this.danmaku_btn.click();
        }
        else if(!on && this.danmaku_btn.checked){
            // on == false;
            this.danmaku_btn.click();
        }
        return this.danmaku_btn.checked;
    }
}
const bplayer = new Bvideo();

function _jump(t){
    return bplayer.jump(t);
}
function _now(){
   return bplayer.now();
}
function _total(){
    return bplayer.total();
}
function _play(){
    return bplayer.play();
}
function _pause(){
    return bplayer.pause();
}
function _fullscreen(){
    return bplayer.fullscreen();
}
function _danmaku(on){
    return bplayer.danmaku(on);
}

//------------------------
// communication with index
function _load(file){
    let fullpath = chrome.runtime.getURL(file);
    return fullpath;
}

let _ws_init = false;
let _port = '0';
function _ws(pipeID){
    if(!_ws_init){
        if(_port != '0'){
            _GameIndex.contentWindow.postMessage({pipeID: pipeID, data: _port}, "*");
        }
        chrome.runtime.sendMessage({opt: 2, data:_GameList[current_bvid]}, (port)=>{
            _port = port;
            _GameIndex.contentWindow.postMessage({pipeID: pipeID, data: _port}, "*");
            _ws_init = true;
        })
        return null;
    }
    return '0';
}

const _index_func = {
    "play": _play,
    "load": _load,
    "ws": _ws,
    "exit": _GameExit,
    "jump": _jump,
    "now": _now,
    "total": _total,
    "pause": _pause,
    "danmaku": _danmaku,
    "fullscreen": _fullscreen
}

function _index_receiver(e){
    if(!_GameIndex){
        return;
    }
    if(e.source !== _GameIndex.contentWindow){
        return;
    }
    opt = e.data.opt;
    func = _index_func[opt];
    if(func){
        data = e.data.data;
        res = (data !== null && data !== undefined) ? func(data, e.data.pipeID) : func(e.data.pipeID);
        if((res !== null && res !== undefined) && _GameIndex){
            res = {data: res};
            if(e.data.pipeID){
                res.pipeID = e.data.pipeID;
            }
            try{
                _GameIndex.contentWindow.postMessage(res, "*");
            }
            catch(err){
                console.log(err);
                console.log(e.data, res);
            }
        }
    }
}
window.addEventListener("message", _index_receiver);


//------------------------
// communication with background
function _refresh(){
    if(current_bvid){
        let bvid = document.location.href.substring(31, 43);
        if(current_bvid == bvid){
            return;
        }
        else{
            current_bvid = bvid;
            window.removeEventListener("keydown", _cmdlistener, true);
        }
    }
    else{
        current_bvid = document.location.href.substring(31, 43);
        window.removeEventListener("keydown", _cmdlistener, true);
    }
    if(_GameIndex && _start){
        _GameIndex.contentWindow.postMessage("exit", "*");
    }
    else{
        _GameExit();
    }
    if(_check_game()){
        bplayer._init();
    }
}

const _background_func = {
    "refresh": _refresh,
}

function _background_receiver(req, sender, sendResponse){
    opt = req.opt;
    func = _background_func[opt];
    if(func){
        data = req.data;
        if(data){
            res = func(data);
        }
        else{
            res = func();
        }
    }
    sendResponse(res? res: null);
    return true;
}
chrome.runtime.onMessage.addListener(_background_receiver);

// init
window.onload = function(){
    _get_game_list().then(()=>{
        if(_check_game()){
            bplayer._init();
        }
    });
}