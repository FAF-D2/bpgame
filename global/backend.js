//IO no use
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

function install_package(zipFile, sendResponse){

}

function remove_package(bvid, sendResponse){

}


function msg_listener(request, sender, sendResponse){
    //do not support extension communication
    if(!sender.tab)
        return true;
    
    console.log(`From ${sender.tab.url}`);
    try{
        var opt = request["opt"];
        var data = request["data"];
        var func = msg_controller[opt.toString()];
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
chrome.runtime.onMessage.addListener(msg_listener);

const msg_controller = {
    0 : install_package,
    1 : remove_package
}

// refresh
var currentBvid = null;
function reload(tabID, changeInfo, tabInfo){
    if(tabInfo.url.substring(0, 30) == "https://www.bilibili.com/video"){
        if(tabInfo.url.substring(31, 43) != currentBvid){
            console.log("-------------");
            console.log(tabInfo.url.substring(31, 43));
            console.log(currentBvid);
            console.log(tabInfo);
            currentBvid = tabInfo.url.substring(31, 43);
            let reloading = chrome.tabs.reload(tabID);
            reloading.then(null, (err) => console.log(err));
        }
    }
}

chrome.tabs.onUpdated.addListener(reload);