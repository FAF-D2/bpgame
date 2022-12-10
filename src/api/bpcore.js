
//-------------------------------
// post message to content script and return with a result promise
const _maxID = 128;
const _communication_pipeline = new Array(_maxID);
const _communication_handler = new Array(_maxID);
const _communication_timer = new Array(_maxID);
for(let i=0; i < _maxID; i++){
    _communication_pipeline[i] = _maxID - i;
    _communication_timer[i] = 0;
}
function _GetPipeID(){
    if(_communication_pipeline.length <= 0){
        return null;
    }
    return _communication_pipeline.pop();
}

function _postMessage(req, _promise=true){
    if(_promise){
        let id = _GetPipeID();
        if(!id){
            return null;
        }
        req.pipeID = id;
        parent.postMessage(req, "*");
        return new Promise((resolve, reject) => {
            _communication_handler[id] = function(e){
                if(e.source != parent.window){
                    clearTimeout(_communication_timer[id]);
                    window.removeEventListener("message", _communication_handler[id]);
                    _communication_pipeline.push(id);
                    _communication_handler[id] = null;
                    reject(new Error("not the msg from parent window"));
                }
                if(e.data.pipeID == id){
                    clearTimeout(_communication_timer[id]);
                    window.removeEventListener("message", _communication_handler[id]);
                    _communication_pipeline.push(id);
                    _communication_handler[id] = null;
                    resolve(e.data.data);
                }
            }
            _communication_timer[id] = setTimeout(()=>{
                window.removeEventListener("message", _communication_handler[id]);
                _communication_pipeline.push(id);
                _communication_handler[id] = null;
                reject(new Error(`${id}: post time out`));
            }, 500);
            window.addEventListener("message", _communication_handler[id]);
        })
    }
    parent.postMessage(req, "*");
    return null;
}


//-------------------------------------
// API
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

function exit(){
    Promise.all(_EXIT_FUNC).then(()=>{
        _postMessage({opt: "exit", data: null}, false);
    });
}

function time_spend(){
    return _BPController.runtime;
}

function addInitFunc(func){
    if(typeof(func) != "function"){
        return;
    }
    _INIT_FUNC.push(new Promise(func));
}

function addExitFunc(func){
    if(typeof(func) != "function"){
        return;
    }
    _EXIT_FUNC.push(new Promise(func));
}

function addFlushFunc(func){
    if(typeof(func) != "function"){
        return;
    }
    _FLUSH_FUNC.push(func);
}

function addOnloadFunc(func){
    if(typeof(func) != "function"){
        return;
    }
    _ONLOAD_FUNC.push(func);
}

//-------------------------------------
// Game PipeLine
class GameObject{
    // should be implemented by child
    constructor(top=true){
        this.#_destroy = false;
        if(top){
            GameObject.#_RenderPipeLine.push(this);
        }
    }
    update(delta){
        alert("No [update] method provided");
        window.close();
    }
    destroy(){
        alert("No [destroy] method provided");
        window.close();
    }
    // should be used in child' s destroy method
    // usage: simply this._destroy() or super._destroy()
    _destroy(){
        this.#_destroy = true;
    }

    // render pipeline
    static #_RenderPipeLine = new Array();
    static _PIPELINE_RENDER(delta){
        GameObject.#_RenderPipeLine = GameObject.#_RenderPipeLine.filter((object)=>{
            return !object._IF_DESTROY; 
        });
        for(let i=0; i < GameObject.#_RenderPipeLine.length; i++){
            GameObject.#_RenderPipeLine[i].update(delta);
        }
    }
    #_destroy;
    get _IF_DESTROY(){
        return this.#_destroy;
    }
}

const _INIT_FUNC = new Array();
const _FLUSH_FUNC = new Array();
const _EXIT_FUNC = new Array();
const _ONLOAD_FUNC = new Array();

class _BPController{
    static #_RUN_TIME = null;
    static #_RENDERER_ID = null;
    static #_START = false;
    static #_BPMAIN(timestamp){
        let delta = 0;
        if(!_BPController.#_RUN_TIME){
            _BPController.#_RUN_TIME = timestamp;
            delta = timestamp;
        }
        else{
            delta = timestamp - _BPController.#_RUN_TIME;
            _BPController.#_RUN_TIME = timestamp;
        }
        GameObject._PIPELINE_RENDER(delta);
        for(let i=0; i < _FLUSH_FUNC.length; i++){
            _FLUSH_FUNC[i]();
        }
        _BPController.#_RENDERER_ID = requestAnimationFrame(_BPController.#_BPMAIN);
    }
    static _GAME_START(){
        if(_BPController.#_START){
            return;
        }
        _BPController.#_START = true;
        window.addEventListener("message", function(e){
            if(e.source != parent.window){
                return;
            }
            if(e.data == "exit"){
                exit();
            }
        });
        _BPController.#_RENDERER_ID = requestAnimationFrame(_BPController.#_BPMAIN);
    }
    // static #_GAME_START(e){
    //     if(e.source != parent.window){
    //         return;
    //     }
    //     if(e.data == "start"){
    //         _BPController.#_RENDERER_ID = requestAnimationFrame(_BPController.#_BPMAIN);
    //     }
    //     else if(e.data == "exit"){
    //         exit();
    //     }
    // }
    // static _INIT(){
    //     window.addEventListener("message", _BPController.#_GAME_START);
    // }
    static get runtime(){
        return _BPController.#_RUN_TIME;
    }
}

window.onload = function(){
    console.log("onload -> init");
    for(let i=0; i < _ONLOAD_FUNC.length; i++){
       _ONLOAD_FUNC[i]();
    }
    Promise.all(_INIT_FUNC).then(()=>{
        _BPController._GAME_START();
    });
}

// function _GAME_START(e){
//     if(e.source != parent.window){
//         return;
//     }
//     if(e.data == "start"){
//         window.removeEventListener("message", _GAME_START);
//         _RENDERER_ID = requestAnimationFrame(_BPMAIN);
//     }
// }

// let _RUN_TIME = null;
// let _RENDERER_ID = null;
// function _BPMAIN(timestamp){
//     let delta = 0;
//     if(!_DELTA_TIME){
//         _RUN_TIME = timestamp;
//         delta = timestamp;
//     }
//     else{
//         delta = timestamp - _RUN_TIME;
//         _RUN_TIME = timestamp;
//     }
//     GameObject._PIPELINE_RENDER();
//     _FLUSH();
//     _RENDERER_ID = requestAnimationFrame(_BPMAIN);
// }


// function _GAME_START(e){
//     if(e.source != parent.window){
//         return;
//     }
//     if(e.data == "start"){
//         window.removeEventListener("message", _GAME_START);
//         _RENDERER_ID = requestAnimationFrame(_BPMAIN);
//     }
// }