
// FileSystem, communicate with local exe using websocket
// check all the backend detail in src/cpp

class BpFileController
{
    static #_WSClient = class WSClient{
        constructor(port){
            this.busy = false;
            this.handler = null;
            this.ws = new WebSocket(`ws://localhost:${port}`);
            this.ws.onmessage = function(e){
                this.busy = false;
                let code = e.data.charAt(e.data.length - 1) - '0';
                if(this.handler){
                    this.handler(code);
                    this.handler = null;
                }
            }
        };
        get connect(){
            return this.ws.readyState == 1 || this.ws.readyState == 0;
        }
        close(){
            this.ws.close();
        }
        send(data){
            if(this.ws.readyState == 0){
                this.ws.onopen = ()=>{
                    this.busy = true;
                    this.ws.send(data);
                }
                return;
            }
            else if(!this.connect()){
                if(this.handler){
                    this.handler(-1);
                }
                return;
            }
            this.busy = true;
            this.ws.send(data);
        }
    }
    static #port = '0';
    static #max_worker = 1;
    static #workers = new Array();
    static _init(resolve, reject){
        if(BpFileController.#port == '0'){
            _postMessage({opt: "ws", data: null}).then((port)=>{
                if(port == '0'){
                    reject(new Error("Can not init websocket port"));
                }
                BpFileController.#port = port;
                resolve(null);
            });
        }
    }
    static load(file, handler=null){
        if(handler){
            return _postMessage({opt: "load", data: file}, true).then(handler);
        }
        return _postMessage({opt: "load", data: file}, true);
    }
    static remove(file, handler=null){
        let worker = this.#find_worker();
        worker.handler = handler;
        worker.send(`rm ${file}`);
    } 
    static write(file, data, mode='w', handler=null){
        if(mode != 'w' && mode != 'a'){
            return;
        }
        let worker = this.#find_worker();
        worker.handler = (code)=>{
            if(code != 0){
                if(handler){
                    handler(code);
                }
                return;
            }
            worker.handler = handler;
            worker.send(data);
        };
        worker.send(`${mode}b ${file}`);
    }
    static #find_worker(){
        let workers = BpFileController.#workers;
        for(let i=0, j=0; i <  BpFileController.#workers.length; i++){
            if( BpFileController.#workers.length - j > BpFileController.#max_worker){
                if(! BpFileController.#workers[i].busy){
                    BpFileController.#workers[i].close();
                    j++;
                }
            }
            else{
                break;
            }
        }
        BpFileController.#workers =  BpFileController.#workers.filter((worker)=>{
            return worker.connect;
        });
        for(let i = 0; i <  BpFileController.#workers.length; i++){
            if(! BpFileController.#workers[i].busy){
                return  BpFileController.#workers[i];
            }
        }
        BpFileController.#workers.push(
            new BpFileController.#_WSClient(BpFileController.#port)
        );
        return BpFileController.#workers[BpFileController.#workers.length - 1];
    }
}
let bpfile = BpFileController;
addInitFunc(bpfile._init);

function _S(json){
    return JSON.stringify(json);
}