
//-------------------------------
// postMessage with promise
const _maxID = 256;
const _communication_pipeline = new Array(_maxID);
for(let i=0; i < _maxID; i++){
    _communication_pipeline[i] = _maxID - i;
}
function _getPipeID(){
    if(_communication_pipeline.length <= 0){
        return null;
    }
    return _communication_pipeline.pop();
}


function _postMessage(req, _promise=true){
    if(_promise){
        let id = _getPipeID();
        if(id === null){
            return null;
        }
        req.pipeID = id;
        parent.postMessage(req, "*");
        return new Promise((resolve, reject) => {
            handler = function(e){
                if(e.source != parent.window){
                    return;
                }
                if(e.data.pipeID == id){
                    window.removeEventListener("message", handler);
                    _communication_pipeline.push(id);
                    resolve(e.data.data);
                }
            };
            window.addEventListener("message", handler);
        })
    }
    parent.postMessage(req, "*");
    return null;
}


//-------------------------------------
// API
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

function load(data, handler=null){
    if(handler){
        return _postMessage({opt: "load", data: data}, true).then(handler);
    }
    return _postMessage({opt: "load", data: data}, true);
}

function save(data, handler=null){
    if(handler){
        return _postMessage({opt: "save", data: data}, true).then(handler);
    }
    return _postMessage({opt: "save", data: data}, true);
}

function remove(data, handler=null){
    if(handler){
        return _postMessage({opt: "remove", data: data}, true).then(handler);
    }
    return _postMessage({opt: "remove", data: data}, true);
}

function exit(){
    return _postMessage({opt: "exit", data: data}, false);
}

//-------------------------------------
// Game PipeLine
function _game_start(e){
    if(e.source != parent.window){
        return;
    }
    if(e.data == "start"){
        _init();
        // _GLOBALID = requestAnimationFrame(_PipeLine);
    }
}
window.addEventListener("message", _game_start);


const _initfunc = Array();
const _initargs = Array();
function addInitfunc(func, args=null){
    _initfunc.push(func);
    _initargs.push(args);
}

const _exitfunc = Array();
const _exitargs = Array();
function addExitfunc(func, args=null){
    _exitfunc.push(func);
    _exitargs.push(args);
}

const _flushfunc = Array();
const _flushargs = Array();
function addFlushfunc(func, args=null){
    _flushfunc.push(func);
    _flushargs.push(args);
}

function func_foreach(func_array, args_array){
    for(let i = 0; i < func_array.length; i++){
        args = args_array[i];
        if(!args){
            func_array[i](args);
        }
        else{
            func_array[i]();
        }
    }
}
function _init(){
    func_foreach(_initfunc, _initargs);
}

function _exit(){
    func_foreach(_exitfunc, _exitargs);
}

function _flush(){
    func_foreach(_flushfunc, _flushargs);
}

// var _DELTA_TIME = -1;
// var _GLOBALID = null;
// function _PipeLine(timestamp){
//     if(_DELTA_TIME == -1){
//         _DELTA_TIME = timestamp;
//     }
//     else{
//         _DELTA_TIME = timestamp - _DELTA_TIME;
//     }
//     _flush();
//     _GLOBALID = requestAnimationFrame(_PipeLine);
// }