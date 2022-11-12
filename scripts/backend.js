
const msg_controller = {
    0 : install_package,
    1 : remove_package
}

function install_package(zipFile, sendResponse){

}

function remove_package(bvid, sendResponse){

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
var currentBvid = null;
function reload(tabID, changeInfo, tabInfo){
    if(tabInfo.url.substring(0, 30) == "https://www.bilibili.com/video"){
        if(tabInfo.url.substring(31, 43) != currentBvid){
            // console.log("-------------");
            // console.log(tabInfo.url.substring(31, 43));
            // console.log(currentBvid);
            // console.log(tabInfo);
            currentBvid = tabInfo.url.substring(31, 43);
            let reloading = chrome.tabs.reload(tabID);
            reloading.then(null, (err) => console.log(err));
        }
    }
}
chrome.tabs.onUpdated.addListener(reload);