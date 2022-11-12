// Input System
//

const keycode = {
    a : 65, b : 66, c : 67, d : 68, e : 69, f : 70, g : 71, h : 72, i : 73,
    j : 74, k : 75, l : 76, m : 77, n : 78, o : 79, p : 80, q : 81, r : 82,
    s : 83, t : 84, u : 85, v : 86, w : 87, x : 88, y : 89, z : 90, 0 : 48,
    1 : 49, 2 : 50, 3 : 51, 4 : 52, 5 : 53, 6 : 54, 7 : 55, 8 : 56, 9 : 57,
    enter : 13, shift : 16, escape : 27
};

const KEY_STATUS = {
    NULL: 0,
    PRESS: 1,
    HOLDING: 2,
    RELEASE: 3,
}

const _KEY = Array(256);
function _keycode_init(){
    for(let i = 0; i < 256; i++){
        _KEY[i] = KEY_STATUS.NULL;
    }
}

function getkeydown(code){
    return _KEY[code] == KEY_STATUS.PRESS;
}

function getkeyhold(code){
    return _KEY[code] == KEY_STATUS.HOLDING;
}

function getkeyup(code){
    return _KEY[code] == KEY_STATUS.RELEASE;
}

function _onkeydown(e){
    let key = e.key.toLowerCase();
    let code = keycode[key];
    if(code === undefined){
        return;
    }
    if(_KEY[code] === KEY_STATUS.NULL){
        _KEY[code] = KEY_STATUS.PRESS;
    }
    e.stopPropagation();
}

function _onkeyup(e){
    let key = e.key.toLowerCase();
    let code = keycode[key];
    if(code === undefined){
        return;
    }
    _KEY[code] = KEY_STATUS.RELEASE;
}

function _updateKeyCode(){
    for(let i=0; i < 256; i++)
    {
        if(_KEY[i] == KEY_STATUS.PRESS){
            _KEY[i] = KEY_STATUS.HOLDING;
        }
        else if(_KEY[i] == KEY_STATUS.RELEASE){
            _KEY[i] = KEY_STATUS.NULL;
        }
        // // check
        // else if(_KEY[i] == KEY_STATUS.HOLDING){
        //     console.log(`holding: ${i}`);
        // }
    }
}

function startInputListener(){
    _keycode_init();
    window.addEventListener("keydown", _onkeydown, true);
    window.addEventListener("keyup", _onkeyup, true);
}

function stopInputListner(){
    _keycode_init();
    window.removeEventListener("keydown", _onkeydown, true);
    window.removeEventListener("keyup", _onkeydown, true);
}

addFlushfunc(_updateKeyCode)
addExitfunc(stopInputListner);