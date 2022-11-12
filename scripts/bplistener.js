window.onload = function(){
    _check_game();
    bplayer._init();
}

//------------------------------
// utils
const V2 = {
    "wrap" : ".bilibili-player-video-wrap",
    "state" : ".bilibili-player-video-state",
    "toast": ".bilibili-player-video-toast-wrp",
    "video": "video",
    "pause": ".bilibili-player-video-btn-start",
    "fullscreen": ".bilibili-player-video-btn-fullscreen"
}

const V3 = {
    "wrap" : ".bpx-player-video-area",
    "state": ".bpx-player-state-wrap",
    "toast": ".bpx-player-toast-wrap",
    "video": "video",
    "pause": ".bpx-player-ctrl-btn-icon",
    "fullscreen": ".bpx-player-ctrl-full"
}

function selector(name, handler=function(e){return e;}){
    let element = document.querySelector(V2[name]);
    element = element ? element : document.querySelector(V3[name]);
    if(element){
        return handler(element);
    }
    console.log(`Error: can not find ${name}`);
    return null;
}

function _mask(e){
    e.stopPropagation();
}

//------------------------------
// extension file IO
async function open(file){
    let fullpath = chrome.runtime.getURL(file);
    try{
        var response = await fetch(fullpath);
        return await response.text();   
    }
    catch(err){
        console.log(err);
        return null;
    }
}


//------------------------------
// supervise, inject and remove

var _GameIndex = null;
function _check_game(){
    let gamelist = open("/scripts/Assests/gamelist.json");
    if(gamelist){
        let bvid = document.location.href.substring(31, 43);
        gamelist.then((text) => _load_game(JSON.parse(text)[bvid]));
    }
    // _load_game("./index/index.html");
}

function _load_game(index_path){
    if(!index_path){
        return;
    }
    index = chrome.runtime.getURL(`/scripts/Assests/${index_path}/seyana`);
    // index = index_path;
    _GameIndexInit(index);
    window.addEventListener("keydown", _cmdlistener, true);
}

function _cmdlistener(e){
    let key = e.key.toLowerCase();
    if(key == "enter"){
        selector("state", (state)=>{state.style.visibility = "hidden";});
        selector("toast", (toast)=>{toast.style.visibility = "hidden";});
        selector("wrap", (video_wrap)=>{
            video_wrap.addEventListener("mousemove", _mask, true);
            video_wrap.append(_GameIndex);
        });
        // document.body.append(_GameIndex);
        window.removeEventListener("keydown", _cmdlistener, true);
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
    _GameIndex.style.zIndex = 2000000000;
    _GameIndex.onload = function(){
        _GameIndex.contentWindow.postMessage("start", "*");
    }
    _GameIndex.src = index;
}

function _GameExit(){
    selector("state", (state)=>{state.style.visibility = "visible";});
    selector("toast", (toast)=>{toast.style.visibility = "visible";});
    selector("wrap", (video_wrap)=>{
        video_wrap.removeEventListener("mousemove", _mask, true);
    });
    if(_GameIndex){
        _GameIndex.parentNode.removeChild(_GameIndex);
        window.addEventListener("keydown", _cmdlistener, true);
    }
}

//------------------------
// video controller
class Bvideo{
    constructor(){
        this.video = null;
        this.pause_btn = null;
        this.fullscreen_btn = null;
        this.IsPaused = null;
        this.IsFullScreen = null;
    }
    _init(){
        this.video = selector("video");
        this.pause_btn = selector("pause");
        this.fullscreen_btn = selector("fullscreen");
        this.IsPaused = this.video.paused;
        this.IsFullScreen = (this.video.clientWidth >= window.clientWidth);
    }
    jump(t){
        t = (t <= 0? 0 : t);
        t = (t >= this.video.duration? this.video.duration - 1 : t);
        this.video.currentTime = t;
        return this.video.currentTime;
    }
    now(){
        return this.video.currentTime;
    }
    total(){
        return this.video.duration;
    }
    pause(){
        if(!this.pause_btn){
            this._init();
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
}
const bplayer = new Bvideo();


//------------------------
// communication
function _load(data){
    console.log(data);
    return null;
}

function _save(data){
    console.log(data);
}

function _remove(data){
    console.log(data);
}

const msg_func = {
    "load": _load,
    "save": _save,
    "remove": _remove,
    "exit": _GameExit,
    "jump": bplayer.jump,
    "now": bplayer.now,
    "total": bplayer.total,
    "pause": bplayer.pause,
    "fullscreen": bplayer.fullscreen
}

function _content_script_receiver(e){
    if(!_GameIndex){
        return;
    }
    if(e.source !== _GameIndex.contentWindow){
        return;
    }
    opt = e.data.opt;
    func = msg_func[opt];
    if(func){
        data = e.data.data;
        res = data ? func(data) : func();
        if(res && _GameIndex){
            res = {data: res};
            if(e.data.pipeID){
                res.pipeID = e.data.pipeID;
            }
            _GameIndex.contentWindow.postMessage(res, "*");
        }
    }
}
window.addEventListener("message", _content_script_receiver);