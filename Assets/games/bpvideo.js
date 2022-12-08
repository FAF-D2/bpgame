class Bvideo{
    static #_total;
    static _init(resolve, reject){
        Bvideo.#message({opt: "total", data: null}, (total)=>{
            Bvideo.#_total = total;
            resolve(null);
        });
    }

    // get total video time - no promise
    static get total(){
        return Bvideo.#_total;
    }

    // video jump to t, t must be a number
    // get promise -> current video time
    static jump(t, handler=null){
        return isNaN(t) ? null : Bvideo.#message({opt: "jump", data: t}, handler);
    }

    // get promise -> current video time
    static now(handler=null){
        return Bvideo.#message({opt: "now", data: null}, handler);
    }

    // get promise -> if playing
    static play(handler){
        return Bvideo.#message({opt: "play", data: null}, handler);
    }

    // get promise -> if paused
    static pause(handler=null){
        return Bvideo.#message({opt: "pause", data: null}, handler);
    }

    // get promise -> if fullscreen
    static fullscreen(handler=null){
        return Bvideo.#message({opt: "fullscreen", data: null}, handler);
    }

    // get promise -> if danmaku {on}
    static danmaku(on, handler=null){
        return Bvideo.#message({opt: "danmaku", data: on}, handler);
    }

    // parent window communication
    static #message(req, handler){
        if(handler){
            let promise = _postMessage(req);
            return promise ? promise.then(handler) : null;
        }
        return _postMessage(req);
    }

    // convert time str like "2:30:12" to seconds(int)
    // support {hour}:{minute}:{second}, {minute}:{second}, {second}
    static t2s(time){
        time = time.split(":");
        if(time.length > 3)
            return 0;
        let second = 0;
        for(let i = 0; i < time.length; i++)
            second = second * 60 + parseInt(time[i]);
        return second;
    }
}
let bplayer = Bvideo;
addInitFunc(bplayer._init);

function t2s(time){
    return Bvideo.t2s(time);
}