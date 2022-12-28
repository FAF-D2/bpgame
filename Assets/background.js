
// background script, native message and popup function

const msg_controller = {
    0 : install_package,
    1 : remove_package,
    2 : init_websocket,
}

function install_package(zipFile, sendResponse){
    // TODO execute exe local filesystem
}

function remove_package(bvid, sendResponse){
    // TODO execute exe local filesystem
}


let IOPort = null;
let _port = '0';
function init_websocket(game_name, sendResponse){
    if(_port != '0'){
        sendResponse(_port);
    }
    if(!IOPort){
        let _onmessage = function(port){
            IOPort.onMessage.removeListener(_onmessage);
            IOPort.onMessage.removeListener(_ondisconnect);
            _port = port;
            sendResponse(port);
        }
        let _ondisconnect = function(){
            if(IOPort != null){
                IOPort = null;
                sendResponse('0');
            }
        }
        IOPort = chrome.runtime.connectNative("com.bpgame.bpwebsocket");
        IOPort.onMessage.addListener(_onmessage);
        IOPort.onDisconnect.addListener(_ondisconnect);
        IOPort.onDisconnect.addListener(()=>{
            IOPort = null;
        });
    }
    IOPort.postMessage(game_name);
    return true;
}

function backend_handler(request, sender, sendResponse){
    if(!sender.tab)
        return true;
    
    // console.log(`From ${sender.tab.url}`);
    try{
        let opt = request["opt"];
        let data = request["data"];
        let func = msg_controller[opt.toString()];
        if(!func)
        {
            console.log("Unknown requets:");
            console.log(request);
            return true;
        }
        func(data, sendResponse);
    }
    catch(err){
        console.log(err);
        console.log("Unknown request:");
        console.log(request);
    }
    return true;
}
chrome.runtime.onMessage.addListener(backend_handler);


// refresh
function refresh(tabID, changeInfo, tabInfo){
    if(tabInfo.url.substring(0, 30) == "https://www.bilibili.com/video"){
        // BUG ? receiving the update signals sometimes even if the tab unchange
        // to reproduce:
        // console.log("----------------");
        // console.log("update: ", tabID);
        // console.log(changeInfo);
        // console.log(tabInfo);
        chrome.tabs.sendMessage(tabID, {opt: "refresh", data: null}, ()=>{
            if(chrome.runtime.lastError)
            {
                message = chrome.runtime.lastError.message;
                if(message == "Could not establish connection. Receiving end does not exist.")
                {
                    return;
                }
                console.log("UnKnown Error: ", message);
            }
        });
    }
}
chrome.tabs.onUpdated.addListener(refresh);