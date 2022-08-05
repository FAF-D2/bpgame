
//-----------------------------------------------
//IO
async function open(file)
{
    const fullpath = chrome.runtime.getURL(file);
    try{
        var response = await fetch(fullpath);
        return await response.text();   
    }
    catch(err){
        console.log(err);
        return null;
    }
}

function load_game(dir){
    if(!dir){
        return;
    }
    var info = open("/global/Assests/" + dir + "/info.json");
    if(!info){
        console.log(`No *info.json* in game dir: [${dir}]`);
        return;
    }
    info.then(function(text){
        let api =  document.createElement("script");
        api.type = "text/javascript";
        document.body.append(api);
        var game_info = JSON.parse(text);
        var sync_loading = function({i}, length, info){
            if(i >= length){
                set_ready();
                return;
            }
            var file = chrome.runtime.getURL(info["struct"][i]);
            let xscript = document.createElement("script");
            xscript.type = "text/javascript";
            document.body.append(xscript);
            i++;
            xscript.onload = ( () => sync_loading({i}, length, info) );
            xscript.src = file;
        }
        var i = 0;
        api.onload = ( () => sync_loading({i}, game_info["struct"].length, game_info) );
        api.src = chrome.runtime.getURL("/global/Assests/bplus_api.js");
    });
}

function check_game(){
    var gamelist =  open("/global/Assests/gamelist.json");
    if(!gamelist){
        console.log("Error: can not open gamelist.json");
    }
    else
    {
        var bvid = document.location.href.substring(31, 43);
        gamelist.then((text) => load_game(JSON.parse(text)[bvid]));
    }
}
window.onload = check_game();



//-----------------------------------------------
// communicate with backend
function send_msg(msg, handler){
    var sending = chrome.runtime.sendMessage(msg);
    sending.then(handler, (error) => console.log(error));
}



//-----------------------------------------------
// communicate with dom-script

function set_result(result){
    var bio = document.getElementById("BIO");
    if(!bio){
        console.log("Can not find BIO");
        return;
    }
    try{
        if(typeof(result) != "string")
            result = JSON.stringify(result);
        bio.innerText = result;
    }
    catch(err){
        console.log(err);
        bio.innerText = "null";
    }
}

function loading(e){
    var req = e.detail.req;
    if(req["location"] == "storage"){
        chrome.storage.local.get(req["data"], set_result);
    }
    else if(req["location"] == "local"){
        set_result(chrome.runtime.getURL("/global/Assests/" + req["data"]));
    }
    else if(req["location"] == "raw"){
        open("/global/Assests/" + req["data"][i]).then((text) => set_result(text));
    }
}

function saving(e){
    var data = e.detail.data;
    chrome.storage.local.set(data, set_result);
}

function removing(e){
    var key = e.detail.key;
    chrome.storage.local.remove(key, set_result);
}

function set_readListener(){
    document.addEventListener("loading", loading);
}

function set_saveListener(){
    document.addEventListener("saving", saving);
}

function set_removeListener(){
    document.addEventListener("removing", removing);
}


function set_ready(){
    set_readListener();
    set_saveListener();
    set_removeListener();
    let ready = document.createElement("div");
    ready.id = "game-ready";
    document.body.appendChild(ready);
}