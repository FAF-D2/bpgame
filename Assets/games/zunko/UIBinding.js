class TextStream{
    constructor(script, dialog){
        this.script = script;
        this.dialog = dialog;
        this.cur_name = null;
        this.cur_text = null;
        this.onstop = null;
        this.idx = -1;
        this.pfn = -1;
    }
    update(delta){
        if(this.dialog.finished){
            return;
        }
        this.dialog.player.update(delta / 1000);
    }
    click(){
        if(this.dialog.finished){
            this.next();
        }
        else{
            this.dialog.finish();
        }
    }
    next(){
        this.idx += 1;
        if(this.idx >= this.script.length){
            this.onstop();
        }
        this.script[this.idx].read = 1;
        let data = this.script[this.idx];
        this.cur_name = data['name'];
        this.cur_text = data['text'];
        let opt = data['opt'];
        if(opt == 1){
            this.pfn += 1;
            processfn[this.pfn]();
            this.dialog.display(this.cur_name, this.cur_text);
            return;
        }
        else if(opt == 2){
            GlobalHandler.stop = true;
            this.pfn += 1;
            processfn[this.pfn]();
            // this.dialog.display(" ", " ");
            return;
        }
        else if(opt == 3){
            GlobalHandler.stop = false;
            this.pfn += 1;
            processfn[this.pfn]();
            // this.dialog.display(" ", " ");
            return;
        }
        this.dialog.display(this.cur_name, this.cur_text);
    }
    reset(){
        this.idx = -1;
        this.pfn = -1;
        this.cur_name = null;
        this.cur_text = null;
    }
    get read(){
        return this.script[this.idx + 1].read;
    }
}

class GlobalHandler extends GameObject{
    static start = false;
    static stop = true;
    static auto = false;
    static ctrl = false;
    constructor(script, dialog){
        super();
        this.handler = new PIXI.Graphics();
        this.handler.beginFill(0x000000, 0.01);
        this.handler.drawRect(0, 0, app.screen.width, app.screen.height);
        this.handler.endFill();
        this.handler.interactive = true;
        this.handler.on("click", ()=>{
            if(GlobalHandler.stop || GlobalHandler.auto || GlobalHandler.ctrl){
                return;
            }
            this.stream.click();
        })
        this.stream = new TextStream(script, dialog);
        this.auto_interval = 1000; // 1s
        this.stream.onstop = ()=>{
            // alert("done");
            bplayer.fullscreen(false).then(exit);
        }
    }
    update(delta){
        if(GlobalHandler.stop){
            return;
        }
        if(getkeyhold(keycode.control) || GlobalHandler.ctrl){
            if(this.stream.dialog.finished){
                if(!SettingInterface.all && !this.stream.read){
                    return;
                }
                this.stream.next();
            }
            this.stream.update(delta*2);
        }
        else if(getkeydown(keycode[' '])){
            if(GlobalHandler.stop || GlobalHandler.auto || GlobalHandler.ctrl){
                return;
            }
            this.stream.click();
        }
        else if(getkeydown(keycode.a)){
            this.timer = 0;
            GlobalHandler.auto = !GlobalHandler.auto;
            let muted = SettingInterface.muted;
            if(buttons.auto.clicked){
                buttons.auto.clicked = false;
                buttons.auto.button.alpha = 0.4;
                buttons.auto.onenter = ()=>{
                    if(!muted){
                        select.play();
                    }
                    buttons.auto.button.alpha = 0.8;
                }
                buttons.auto.onleave = ()=>{
                    buttons.auto.button.alpha = 0.4;
                }
            }
            else{
                buttons.auto.clicked = true;
                buttons.auto.button.alpha = 0.8;
                buttons.auto.onenter = null;
                buttons.auto.onleave = null;
            }
            if(!muted){
                button_click.currentTime = 0.0;
                button_click.play();
            }
        }
        else if(GlobalHandler.auto){
            if(this.stream.dialog.finished){
                if(this.timer >= this.auto_interval){
                    this.timer = 0;
                    this.stream.next();
                }
                else{
                    this.timer += delta;
                }
            }
            else{
                this.stream.update(delta);
            }
            return;
        }
        else{
            this.timer = 0;
            this.stream.update(delta);
        }
    }
    set status(status){
        this.timer = 0;
        let time = status["time"];
        bplayer.jump(time);
        bplayer.pause();
        this.stream.pfn = status["pfn"];
        this.stream.idx = status["idx"];
        this.stream.cur_name = status["cur_name"];
        this.stream.cur_text = status["cur_text"];
        BGMHandler.change(status["bgm"]);
        this.stream.dialog.display(this.stream.cur_name, this.stream.cur_text);
        this.stream.dialog.finish();
    }
    get status(){
        return bplayer.now().then((time)=>{
            return {
                time: time, 
                pfn: this.stream.pfn, 
                idx: this.stream.idx, 
                cur_name: this.stream.cur_name, 
                cur_text: this.stream.cur_text,
                date: new Date().toLocaleString(),
                bgm: BGMHandler.bgm
            };
        })
    }
    next(){
        this.stream.next();
    }
    destroy(){
        super._destroy();
    }
}

class BGMHandler{
    static cur_bgm = null;
    static table = {
        lucky: lucky,
        sunset_mati, sunset_mati,
        normal: normal,
        mori: mori,
        grey: grey,
        ease: ease,
        ease2: ease2,
        ease3: ease3,
        baka: baka,
        danger: danger,
        train: train,
        sweet: sweet,
        fight: fight,
        reality: reality
    }
    constructor(){}
    static change(bgm){
        bgm = typeof(bgm) == "string" ? BGMHandler.table[bgm] : bgm;
        if(BGMHandler.cur_bgm == bgm){
            return;
        }
        if(BGMHandler.cur_bgm){
            new easeOut(BGMHandler.cur_bgm);
        }
        BGMHandler.cur_bgm = bgm;
        if(BGMHandler.cur_bgm){
            new easeIn(BGMHandler.cur_bgm);
        }
    }
    static get bgm(){
        if(!BGMHandler.cur_bgm){
            return null;
        }
        return Object.keys(BGMHandler.table).find((key)=>{
            return BGMHandler.table[key] === BGMHandler.cur_bgm;
        })
    }
}

let dialog = new Dialog();
SettingInterface.dialog = dialog;
let buttons = null;
let saving = null;
let _setting = null;
let begin = new BeginInterface();
let handler = null;
let save_confirm = null;
let load_confirm = null;
let exit_confirm = null;

function reset(){
    handler.stream.reset();
    GlobalHandler.auto = false;
    GlobalHandler.ctrl = false;
    buttons.auto.clicked = false;
    buttons.auto.button.alpha = 0.4;
    buttons.ctrl.clicked = false;
    buttons.ctrl.button.alpha = 0.4;
}

function AssetsInit(){
    let promise = Promise.all([
        sheet.then((sheet)=>{buttons = new Buttons(sheet)}),
        sheet2.then((sheet)=>{
            saving = new SavingInterface(sheet, letter);
            _setting = new SettingInterface(sheet, letter);
            save_confirm = new Confirm(sheet.button2, "覆盖此存档吗？");
            load_confirm = new Confirm(sheet.button2, "读取此存档吗？");
            exit_confirm = new Confirm(sheet.button2, "退出到主界面吗？");
        }),
        script.then(
            (script)=>{handler = new GlobalHandler(script, dialog);}
        ).catch((err)=>{
            handler = new GlobalHandler({}, dialog);
        }),
        bplayer.jump(0.5),
        bplayer.pause(),
        bplayer.danmaku(false)
    ])
    return promise.then(()=>{
        savings.then((data)=>{
            for(let i=0; i < 8; i++){
                let status = data[String.fromCharCode(i)];
                if(status){
                    saving.blocks[i].saved = true;
                    saving.blocks[i].status = status;
                    saving.blocks[i].save(
                        status["cur_name"], status["cur_text"], status["date"]
                    );
                }
            }
        })
    });
}

function ButtonsInit(){
    // buttons.save.onclick
    // buttons.load.onclick
    // buttons.auto.onclick
    // buttons.ctrl.onclick
    // buttons.config.onclick
    // buttons.exit.onclick
    let fn1 = (who)=>{
        GlobalHandler.stop = true;
        buttons.disabled = true;
        let animator = new Show(who);
        if(!SettingInterface.muted){
            button_click.currentTime = 0.0;
            button_click.play();
        }
    };
    let fn2 = (button)=>{
        let muted = SettingInterface.muted;
        if(button.clicked){
            button.clicked = false;
            button.button.alpha = 0.8;
            button.onenter = ()=>{
                if(!muted){
                    select.play();
                }
                button.button.alpha = 0.8;
            }
            button.onleave = ()=>{
                button.button.alpha = 0.4;
            }
        }
        else{
            button.clicked = true;
            button.button.alpha = 0.8;
            button.onenter = null;
            button.onleave = null;
        }
        if(!muted){
            button_click.currentTime = 0.0;
            button_click.play();
        }
    };
    buttons.save.onclick = ()=>{
        fn1(saving);
        SavingInterface.executor = buttons;
        SavingInterface.mode = "save";
    };
    buttons.load.onclick = ()=>{
        fn1(saving);
        SavingInterface.executor = buttons;
        SavingInterface.mode = "load";
    };
    buttons.config.onclick = ()=>{
        SettingInterface.executor = buttons;
        fn1(_setting);
    };
    buttons.auto.clicked = false;
    buttons.ctrl.clicked = false;
    buttons.auto.onclick = ()=>{
        GlobalHandler.auto = !GlobalHandler.auto;
        fn2(buttons.auto);
    };
    buttons.ctrl.onclick = ()=>{
        GlobalHandler.ctrl = !GlobalHandler.ctrl;
        fn2(buttons.ctrl);
    };
    buttons.exit.onclick = ()=>{
        GlobalHandler.stop = true;
        app.stage.addChild(exit_confirm.grid);
        let animator = new Show3(exit_confirm);
        buttons.disabled = true;
        if(!SettingInterface.muted){
            button_click.currentTime = 0.0;
            button_click.play();
        }
    };
}

function ConfirmInit(){
    // confirm.onyes
    // confirm.onno
    exit_confirm.onyes = ()=>{
        app.stage.removeChildAt(app.stage.children.length - 1);
        dialog.grid.scale.y = 0.0;
        buttons.grid.scale.y = 0.0;
        buttons.disabled = true;
        begin.disabled = false;
        begin.grid.alpha = 1.0;
        BGMHandler.change(mori);
        bplayer.jump(0.5);
        bplayer.pause();
        if(!SettingInterface.muted){
            xconfirm.play();
        }
    }
    exit_confirm.onno = ()=>{
        GlobalHandler.stop = false;
        app.stage.removeChildAt(app.stage.children.length - 1);
        buttons.disabled = false;
        if(!SettingInterface.muted){
            cancel.play();
        }
    };
    save_confirm.onno = ()=>{
        app.stage.removeChildAt(app.stage.children.length - 1);
        saving.disabled = false;
        if(!SettingInterface.muted){
            cancel.play();
        }
    };
    load_confirm.onno = ()=>{
        app.stage.removeChildAt(app.stage.children.length - 1);
        saving.disabled = false;
        if(!SettingInterface.muted){
            cancel.play();
        }
    };
}

function SavingInit(){
    // saving.exit.onclick
    // saving.blocks[i].onclick
    saving.exit.onclick = ()=>{
        if(begin.grid.alpha <= 0.0){
            GlobalHandler.stop = false;
        }
        if(!SettingInterface.muted){
            cancel.play();
        }
        SavingInterface.executor.disabled = false;
        let animator = new Hide(saving);
    }
    for(let i=0; i < 8; i++){
        saving.blocks[i].onclick = ()=>{
            let muted = SettingInterface.muted;
            if(SavingInterface.mode == "load"){
                if(!saving.blocks[i].saved){
                    return;
                }
                if(!muted){
                    button_click.currentTime = 0.0;
                    button_click.play();
                }
                app.stage.addChild(load_confirm.grid);
                let animator = new Show3(load_confirm);
                if(GlobalHandler.stop){
                    // begin interface
                    load_confirm.onyes = ()=>{
                        if(!muted){
                            xconfirm.play();
                        }
                        app.stage.removeChildAt(app.stage.children.length - 1);
                        GlobalHandler.stop = false;
                        let animator = new Hide(saving);
                        begin.disabled = true;
                        begin.grid.alpha = 0.0;
                        dialog.grid.scale.y = 1.0;
                        buttons.grid.scale.y = 1.0;
                        buttons.disabled = false;
                        handler.status = saving.blocks[i].status;
                    };
                    return;
                }
                load_confirm.onyes = ()=>{
                    if(!muted){
                        xconfirm.play();
                    }
                    app.stage.removeChildAt(app.stage.children.length - 1);
                    GlobalHandler.stop = false;
                    SavingInterface.executor.disabled = false;
                    let animator = new Hide(saving);
                    handler.status = saving.blocks[i].status;
                };
            }
            else if(SavingInterface.mode == "save"){
                saving.blocks[i].saved = true;
                if(!muted){
                    button_click.currentTime = 0.0;
                    button_click.play();
                }
                saving.disabled = true;
                app.stage.addChild(save_confirm.grid);
                let animator = new Show3(save_confirm);
                save_confirm.onyes = ()=>{
                    let status = handler.status;
                    status.then((status)=>{
                        saving.blocks[i].status = status;
                        saving.blocks[i].save(status["cur_name"], status["cur_text"]);
                        bpfile.write("/save/savings.json", _S(saving.savings));
                        app.stage.removeChildAt(app.stage.children.length - 1);
                        saving.disabled = false;
                        if(!muted){
                            xconfirm.play();
                        }
                    })
                };
            }
        }
    }
}

function SettingInit(){
    // _setting.exit.onclick
    _setting.exit.onclick = ()=>{
        if(begin.grid.alpha <= 0.0){
            GlobalHandler.stop = false;
        }
        if(!SettingInterface.muted){
            cancel.play();
        }
        SettingInterface.executor.disabled = false;
        let animator = new Hide(_setting);
    }
}

function BeginInit(){
    // begin.start.onclick
    // begin.exit.onclick
    // begin.config.onclick
    // begin.load.onclick
    begin.start.onclick = ()=>{
        let frame = new VideoNextFrame(1.1, 0);
        GlobalHandler.stop = false;
        BGMHandler.change(null);
        begin.disabled = true;
        begin.grid.alpha = 0.0;
        dialog.grid.scale.y = 0.0;
        buttons.grid.scale.y = 0.0;
        // let animator = new Show2(dialog, buttons);
        buttons.disabled = false;
        reset();
        handler.next();
    }
    begin.exit.onclick = ()=>{
        bplayer.fullscreen(false).then(exit);
    };
    begin.load.onclick = ()=>{
        SavingInterface.mode = "load";
        SavingInterface.executor = begin;
        begin.disabled = true;
        let animator = new Show(saving);
    }
    begin.config.onclick = ()=>{
        SettingInterface.executor = begin;
        begin.disabled = true;
        let animator = new Show(_setting);
    }
}

function FuncInit(resolve, reject){
    let promise = AssetsInit();
    promise.then(()=>{
        ButtonsInit();
        ConfirmInit();
        SavingInit();
        SettingInit();
        BeginInit();
        saving.grid.alpha = 0.0;
        saving.grid.scale.x = 0.0;
        saving.grid.scale.y = 0.0;
        saving.disabled = true;
        _setting.grid.alpha = 0.0;
        _setting.grid.scale.x = 0.0;
        _setting.grid.scale.y = 0.0;
        _setting.disabled = true;
        dialog.grid.scale.y = 0.0;
        buttons.grid.scale.y = 0.0;
        buttons.disabled = true;
        app.stage.addChild(handler.handler);
        app.stage.addChild(begin.grid);
        app.stage.addChild(dialog.grid);
        app.stage.addChild(buttons.grid);
        app.stage.addChild(_setting.grid);
        app.stage.addChild(saving.grid);
        addExitFunc(()=>{
            return new Promise((resolve)=>{
                bpfile.write("/text/script.json", _S(handler.stream.script), 'w', ()=>{
                    resolve(null);
                });
            });
        });
        resolve(null);
    })
}
addInitFunc(FuncInit);