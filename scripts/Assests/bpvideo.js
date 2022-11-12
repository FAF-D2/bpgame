
class Bvideo{
    constructor(){
        this.duration = -1;
         _postMessage({opt: "total", data: null}).then((duration)=>{
            this.duration = duration;
        });
    }
    jump(t, handler=null){
        if(this.duration <= 0 || isNaN(t)){
            return null;
        }
        t = (t <= 0? 0 : t);
        t = (t >= this.video.duration? this.video.duration - 1 : t);
        if(handler){
            let promise = _postMessage({opt: "jump", data: t});
            return promise ? promise.then(handler) : null;
        }
        return _postMessage({opt: "jump", data: t});
    }
    now(handler=null){
        if(handler){
            let promise = _postMessage({opt: "now", data: t});
            return promise ? promise.then(handler) : null;
        }
        return _postMessage({opt: "now", data: null});
    }
    total(){
        return this.duration;
    }
    pause(handler=null){
        if(handler){
            let promise = _postMessage({opt: "pause", data: t});
            return promise ? promise.then(handler) : null;
        }
        return _postMessage({opt: "pause", data: null});
    }
    fullscreen(handler=null){
        if(handler){
            let promise = _postMessage({opt: "fullscreen", data: t});
            return promise ? promise.then(handler) : null;
        }
        return _postMessage({opt: "fullscreen", data: null});
    }
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

const bplayer = new Bvideo();

function t2s(time){
    return Bvideo.t2s(time);
}