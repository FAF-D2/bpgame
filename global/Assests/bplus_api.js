
//-----------------------------------------------
// game controller
const fps = 40;
var start = false;
var bmain = null;
var bquit = bclear;
var frame_handler = new Array();
var previous_time = null;
var delta = 0;

function bclear(){
    console.log("bclear");
    while(frame_handler.length > 0){
       clearInterval(frame_handler.pop());
       // cancelAnimationFrame(frame_handler.pop());
    }
    if(container){
        container.parentNode.removeChild(container);
    }
    // var video_wrap = document.querySelector("video").parentNode;
    var video_wrap = document.querySelector(".bilibili-player-video-wrap");
    if(!video_wrap)
        video_wrap = document.querySelector(".bpx-player-video-area");
    if(video_wrap)
        video_wrap.removeEventListener("mousemove", hover_mask, true);
    else{
        console.log("Error: can not find video wrap");
    }

    if(bplayer.is_fullscreen())
        bplayer.full_screen();

    var stat = document.querySelector(".bilibili-player-video-state");
    if(!stat)
        stat = document.querySelector(".bpx-player-state-wrap");
    stat.style.visibility = "visible";
}

const full_screen = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
}
//const max_zIndex = 2147483647;
const max_zIndex = 2000000000;

const keycode = {
    a : 65, b : 66, c : 67, d : 68, e : 69, f : 70, g : 71, h : 72, i : 73,
    j : 74, k : 75, l : 76, m : 77, n : 78, o : 79, p : 80, q : 81, r : 82,
    s : 83, t : 84, u : 85, v : 86, w : 87, x : 88, y : 89, z : 90, 0 : 48,
    1 : 49, 2 : 50, 3 : 51, 4 : 52, 5 : 53, 6 : 54, 7 : 55, 8 : 56, 9 : 57,
    enter : 13, shift : 16, escape : 27
};

var frame_code = Array(256);
for(var i = 0; i < frame_code.length; i++){
    frame_code[i] = 0;
}
var frame_hold = Array(256);
for(var i = 0; i < frame_code.length; i++){
    frame_hold[i] = false;
}

function frame_clear(){
    for(var i=0; i < frame_code.length; i++){
        if(frame_code[i])   frame_code[i] = 0;
    }
}

//-----------------------------------------------
// start listener
function is_ready(){
    if(!bmain || !bquit)
        return false;
    return true;
}

function hover_mask(e){
    e.stopPropagation();
}

function game_init(){
    var status = true;
    if(!bplayer.is_fullscreen())
        status = bplayer.fullscreen();
    bplayer.jump_at(0);
    if(!bplayer.is_pause())
        status = bplayer.pause();
    if(!status)
        bquit();

    container = document.createElement("div");
    container.id = "game-container";
    for(var key in full_screen){
        container.style[key] = full_screen[key];
    }
    container.style.zIndex = max_zIndex;

    // var video_wrap = document.querySelector("video").parentNode;
    var video_wrap = document.querySelector(".bilibili-player-video-wrap");
    if(!video_wrap)
        video_wrap = document.querySelector(".bpx-player-video-area");
    video_wrap.append(container);
    video_wrap.addEventListener("mousemove", hover_mask, true);

    var stat = document.querySelector(".bilibili-player-video-state");
    if(!stat)
        stat = document.querySelector(".bpx-player-state-wrap");
    stat.style.visibility = "hidden";

    var toast = document.querySelector(".bilibili-player-video-toast-wrp");
    if(!toast)
        toast = document.querySelector(".bpx-player-toast-wrap");
    toast.style.visibility = "hidden";
}


function _onkeydown(e){
    var key = e.key.toLowerCase();

    if(!start && key == "enter" && is_ready())
    {
        start = true;
        game_init();
        bmain();
        // try{
        //     bmain();
        // }
        // catch(err){
        //     console.log(err);
        //     bquit();
        // }
    }
    else if(start && key == "escape")
    {
        start = false;
        bquit();
    }
    if(start)
    {
        frame_code[keycode[key]]++;
        frame_hold[keycode[key]] = true;
        e.stopPropagation();
    }
}

function _onkeyup(e){
    var key = e.key.toLowerCase();
    if(frame_hold[keycode[key]])
        frame_hold[keycode[key]] = false;
}

window.addEventListener("keydown", _onkeydown, true);
window.addEventListener("keyup", _onkeyup, true);

//-----------------------------------------------
// api

screenWidth = window.innerWidth;
screenHeight = window.innerHeight;

function getkeydown(code){
    return frame_code[code];
}

function getkeyhold(code){
    return frame_hold[code];
}

function deltatime(){
    return Math.trunc(1000 / fps);
}

function bupdate(handler){
    if(typeof(handler) != "function")
        return false;
    // try{
    //     let id = window.requestAnimationFrame((timestamp) => {
    //         if(!previous_time)
    //             previous_time = timestamp;
    //         delta = timestamp - previous_time;
    //         console.log(delta);
    //         handler(); 
    //     });
    //     frame_handler.push(id);
    //     return true;
    // }
    // catch(err){
    //     console.log(err);
    //     return false
    // }
    try{
        let timer = setInterval(handler, deltatime());
        frame_handler.push(timer);
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

function start_key_listener(){
    frame_timer = setInterval(frame_clear, deltatime());
}

class Bvideo{
    constructor(){
        this.video = document.querySelector("video");
        this.isinit = this.video? true : false;
        if(!this.isinit){
            console.log("Error: can not find video");
        }
    }
    jump_at(t){
        t = (t <= 0? 0 : t);
        t = (t >= this.video.duration? this.video.duration - 1 : t);
        this.video.currentTime = t;
        return this.video.currentTime;
    }
    now_time(){
        return this.video.currentTime;
    }
    total_time(){
        return this.video.duration;
    }
    pause(){
        if(this.video.paused){
            this.video.play();
            return true;
        }
        var pause_btn = document.querySelector(".bilibili-player-video-btn-start");
        if(!pause_btn)
            pause_btn = document.querySelector(".bpx-player-ctrl-btn-icon");
        try{
            pause_btn.click();
        }  
        catch(err){
            console.log(err);
            return false;
        }
        return true;
        // if(this.video.paused)
        //     this.video.play();
        // else
        //     this.video.pause();
        // return true;
    }
    is_pause(){
        return this.video.paused;
    }
    fullscreen(){
        var fullscreen_btn = document.querySelector(".bilibili-player-video-btn-fullscreen");
        if(!fullscreen_btn){
            fullscreen_btn = document.querySelector(".bpx-player-ctrl-full");
        }
        try{
            fullscreen_btn.click();
        }
        catch(err){
            console.log(err);
            return false;
        }
        return true;
    }
    is_fullscreen(){
        if(this.video.clientWidth >= screenWidth)
            return true;
        return false;
    }

    static time2second(time){
        var time = time.split(":");
        if(time.length > 3)
            return 0;
        var second = 0;
        for(var i=0; i < time.length; i++)
            second = second * 60 + parseInt(time[i]);
        return second;
    }
}
bplayer = new Bvideo();

function attach_game(m, q=null){
    bmain = (typeof(m) == "function" ? m : bmain);
    bquit = (typeof(q) == "function" ? q : bquit);
}

//-----------------------------------------------
//IO
var IOBuffer = document.createElement("p");
IOBuffer.id = "BIO";
IOBuffer.innerText = "null";
IOBuffer.style.visibility = "hidden";
document.body.appendChild(IOBuffer);

function getIOresult(){
    try{
        var result = JSON.parse(IOBuffer.textContent);
        return result;
    }
    catch{
        return IOBuffer.textContent;
    }
}


function load(req, handler=null){
    let loading_eve = new CustomEvent("loading", {detail:{req: req}});
    document.dispatchEvent(loading_eve);
    return handler ? handler(getIOresult()) : getIOresult();
}

function save(data, handler=null){
    let saving_eve = new CustomEvent("saving", {detail:{data: data}});
    document.dispatchEvent(saving_eve);
    return handler ? handler(getIOresult()) : getIOresult();
}

function remove(key, handler=null){
    let removing_eve = new CustomEvent("removing", {detail:{key: key}});
    document.dispatchEvent(removing_eve);
    return handler ? handler(getIOresult()) : getIOresult();
}

function get_json(url){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.status == 200 ? JSON.parse(xhr.responseText) : null;
}

async function fetch_json(url){
    try{
        var response = await fetch(url);
        return await response.text();   
    }
    catch(err){
        console.log(err);
        return null;
    }
}

//-----------------------------------------------
// draw
var container = null;

//pre-built style
const pixelated = {
    mozImageSmoothingEnabled : false,
    webkitImageSmoothingEnabled : false,
    msImageSmoothingEnabled : false,
    imageSmoothingEnabled : false,
    oImageSmoothingEnabled : false,
    globalAlpha: 1.0
}

class BWindow{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.isclear = true;
    }
    getPos(rx, ry, rwidth, rheight, anchor="middle", IFRAW=false){
        var x = this.canvas.width * rx;
        var y = this.canvas.height * ry;
        var width = 0;
        var height = 0;
        if(IFRAW){
            width = rwidth;
            height = rheight;
        }
        else{
            width = this.canvas.width * rwidth;
            height = this.canvas.height * rheight;
        }
        if(anchor == "left"){
            y = y - (height / 2);
        }
        else if(anchor == "right"){
            x = x - width;
            y = y - (height / 2);
        }
        else if(anchor == "top"){
            x = x - (width / 2);
        }
        else if(anchor == "bottom"){
            x = x - (width / 2);
            y = y - height;
        }
        else{
            //middel
            x = x - (width / 2);
            y = y - (height / 2);
        }
        return new Array(x, y, width, height);
    }
    setStyle(ctx_style){
        for(var key in ctx_style){
            if(this.ctx[key] != ctx_style[key])
                this.ctx[key] = ctx_style[key];
        }
    }
    draw_rectangle(rx, ry, rwidth, rheight, rgba=null, ctx_style=null, anchor="middle"){
        let pos = this.getPos(rx, ry, rwidth, rheight, anchor);
        if(ctx_style)
            this.setStyle(ctx_style);
        if(rgba)
            this.ctx.fillStyle = rgba;
        this.ctx.fillRect(pos[0], pos[1], pos[2], pos[3]);
        this.isclear = false;
    }
    draw_img(img, rx, ry, ctx_style=null, anchor="middle"){
        if(!img.complete){
            img.onload = ( () => this.draw_img(img, rx, ry, ctx_style, anchor) );
            return;
        }
        if(ctx_style)
            this.setStyle(ctx_style);
        let pos = this.getPos(rx, ry, img.width, img.height, anchor, true);
        this.ctx.drawImage(img, pos[0], pos[1]);
        this.isclear = false;
    }
    draw_img(img, rx, ry, rwidth, rheight, ctx_style=null, anchor="middle"){
        if(!img.complete){
            img.onload = ( () => this.draw_img(img, rx, ry, rwidth, rheight, ctx_style, anchor) );
            return;
        }
        if(ctx_style)
            this.setStyle(ctx_style);
        let pos = this.getPos(rx, ry, rwidth, rheight, anchor, false);
        this.ctx.drawImage(img, pos[0], pos[1], pos[2], pos[3]);
        this.isclear = false;
    }
    draw_font(text, rx, ry, hollow=false, ctx_style=null, anchor="middle"){
        if(ctx_style)
            this.setStyle(ctx_style);
        var width = this.ctx.measureText(text).width;
        let pos = this.getPos(rx, ry, width, width, anchor, true);
        if(hollow)
            this.ctx.strokeText(text, pos[0], pos[1]);
        else
            this.ctx.fillText(text, pos[0], pos[1]);
        this.isclear = false;
    }
    clear(){
        if(this.isclear)
            return;
        this.isclear = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function init_obj(obj, attributes, style){
    for(var key in attributes){
        obj[key] = attributes[key];
    }
    for(var key in style){
        obj.style[key] = style[key];
    }
    return obj;
}

function create_window(rx, ry, rwidth=-1, rheight=-1, appendToContainter=true, zIndex=0){
    var left = (rx - rwidth / 2) * 100;
    left = left.toFixed(2).toString() + "%";
    var top = (ry - rheight / 2) * 100;
    top = top.toFixed(2).toString() + "%"
    rwidth = (rwidth >= 1 ? 1 : rwidth);
    rheight = (rheight >= 1 ? 1 : rheight);
    var width = (rwidth <= 0? screenWidth: screenWidth * rwidth);
    var height = (rheight <= 0? screenHeight: screenHeight * rheight);
    var swidth = (rwidth * 100).toFixed(2).toString() + "%";
    var sheight = (rheight * 100).toFixed(2).toString() + "%";
    var canvas = document.createElement("canvas");
    canvas.style.zIndex = (zIndex <= 0 ? 0 : zIndex);
    canvas = init_obj(canvas, {width: width, height: height}, 
        {position: "fixed", top: top, left: left, width: swidth, height: sheight});
    if(appendToContainter)
        container.appendChild(canvas);
    return new BWindow(canvas);
}

function create_img(src, appendToContainter=false, zIndex=1, attributes=null, style=null){
    var img = new Image();
    img.src = src;
    img = init_obj(img, attributes, style);
    if(appendToContainter){
        img.style.zIndex = (zIndex <= 0 ? 0 : zIndex);
        container.appendChild(img);
    }
    return img;
}

function create_button(onclick=null, appendToContainter=true, zIndex=1, attributes=null, style=null){
    var button = document.createElement("button");
    button.onclick = (onclick ? onclick : null);
    button.style.zIndex = (zIndex <= 0 ? 0 : zIndex);
    button = init_obj(button, attributes, style);
    if(appendToContainter)
        container.appendChild(button);
    return button;
}
//curve
function* linear(f0, f1, duration){
    var current = f0;
    var end = f1;
    var delta_t = (f1 - f0) * deltatime() / (duration * 1000);
    var times = 1000;
    var i = 0;
    while(i <= times){
        if(current >= end){
            return end;
        }
        current = yield current + delta_t;
        i++;
    }
    return end;
}

function lerp(f0, f1, t){
    t = (t <= 0 ? 0 : t);
    t = (t >= 1 ? 1 : t);
    return f0 + (f1 - f0) * t;
}


//-------------------------------------
// utils and misc
function dassign(a, b){
    var tem = {}
    for(var key in a){
        tem[key] = a[key];
    }
    for(var key in b){
        tem[key] = b[key];
    }
    return tem;
}