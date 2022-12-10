
function emptySprite(x, y, width, height){
    let sprite = new PIXI.Sprite();
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.width = width;
    sprite.height = height;
    return sprite;
}

class Dialog{
    constructor(){
        // dialog
        let style = GetTextStyle();
        this.player = new BPTextPlayer(0, 10, 
            app.screen.width - 250, app.screen.height * 0.28, 17, style);
        this.back = emptySprite(0, 0, app.screen.width, app.screen.height * 0.28);
        this.back.filters = [
            gradientShader.get_filter(0, 0, 0, 0.8, 0, 1.0, 0)
        ];

        // naming
        style.fontSize = 18;
        this.name_player = new BPTextPlayer( - app.screen.width * 0.38, -app.screen.height * 0.2 - 1, 
        100, 22, 1, style);
        this.name_back = emptySprite(50 - app.screen.width / 2, -app.screen.height * 0.2, 100, 22);
        this.name_back.filters = [
            gradientShader.get_filter(0.0, 0.0, 0.0, 0.4, 0.1, -0.1, -0.2)
        ];
        
        //grid
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width / 2;
        this.grid.y = app.screen.height * 0.86;
        this.grid.addChild(this.back, this.player.layer, 
            this.name_back, this.name_player.layer);
    }
    display(name, text, nstyle=null, tstyle=null){
        this.name_player.display(name, nstyle);
        this.name_player.finish();
        this.player.display(text, tstyle);
    }
    finish(){
        this.player.finish();
    }
    get finished(){
        return this.player.isFinish;
    }
    set speed(value){
        this.player.speed = value;
    }
}

function _init_button(texture, x, y){
    let button = new BPButton(texture, null, x, y, 32, 32);
    button.button.alpha = 0.4;
    button.onenter = ()=>{
        if(!SettingInterface.muted){
            select.play();
        }
        button.button.alpha = 0.8;
    }
    button.onleave = ()=>{
        button.button.alpha = 0.4;
    }
    return button;
}

class Buttons{
    constructor(sheet){
        this.save = _init_button(sheet.save, 0, 0);
        this.load = _init_button(sheet.load, 32, 0);
        this.config = _init_button(sheet.config, 64, 0);
        this.auto = _init_button(sheet.auto, 96, 0);
        this.ctrl = _init_button(sheet.ctrl, 128, 0);
        this.exit = _init_button(sheet.exit, 160, 0);
        this.grid = new PIXI.Container();
        this.grid.addChild(this.save.button, this.load.button, this.auto.button, 
            this.ctrl.button, this.exit.button, this.config.button);
        this.grid.x = app.screen.width - 180;
        this.grid.y = app.screen.height - 16;
    }
    set disabled(value){
        this.grid.interactiveChildren = !value;
    }
}

class Confirm{
    constructor(back, text){
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width / 2;
        this.grid.y = app.screen.height / 2;
        this.back = emptySprite(0, 0, app.screen.width, app.screen.height * 0.2);
        this.back.filters = [
            gradientShader.get_filter(0.6, 0, 0.3, 0, 0.8, 0, 0.4)
        ]
        let style = GetTextStyle();
        style.fontSize = 14;
        style.fontWeight = "bold";

        let offset = app.screen.height * 0.1 - 12;
        this.yes = new BPButton(back, new PIXI.Text("是", style), -48, offset, 48, 24);
        this.no = new BPButton(back, new PIXI.Text("否", style), 48, offset, 48, 24);
        style.fontSize = 16;
        this.text = new PIXI.Text(text, style);
        this.text.anchor.set(0.5);
        this.text.y = -app.screen.height * 0.05;

        this.grid.addChild(this.back, this.yes.button, this.no.button, this.text);
    }
    set onyes(func){
        this.yes.onclick = func;
    }
    set onno(func){
        this.no.onclick = func;
    }
    set disabled(value){
        this.grid.interactiveChildren = !value;
    }
}

class SavingBlock{
    constructor(border, x, y, width, height){
        this.saved = false;
        this.status = null;
        // UI
        this.grid = new PIXI.Container();
        this.grid.x = x;
        this.grid.y = y;
        this.block = new BPButton(border, null, 0, 0, width, height);
        this.select = new PIXI.Graphics();
        this.select.lineStyle(0);
        this.select.beginFill(0xffffff, 1.0);
        this.select.drawRect(-width/2, -height/2, width, height);
        this.select.endFill();
        this.select.alpha = 0;
        let style = GetTextStyle();
        style.fill = ['#ffffff'];
        style.fontWeight = "bold";
        this.nodata = new PIXI.Text("NO DATA", style);
        this.nodata.anchor.set(0.5);
        this.data = null;
        this.block.onenter = ()=>{
            this.select.alpha = 0.4;
            if(!SettingInterface.muted){
                select2.currentTime = 0.0;
                select2.play();
            }
        }
        this.block.onleave = ()=>{
            this.select.alpha = 0;
        }
        this.grid.addChild(this.select, this.block.button, this.nodata);
    }
    set onclick(func){
        this.block.onclick = func;
    }
    save(name, text, _date=new Date().toLocaleString()){
        if(this.saved){
            this.grid.removeChildAt(2).destroy(true);
        }
        else{
            this.saved = true;
            this.grid.removeChildAt(2).destroy();
        }
        if(text.length > 12){
            text = text.substr(0, 12) + "...";
        }
        let style = GetTextStyle();

        style.fontSize = 10;
        style.fill = ['#ffffff'];
        style.dropShadowAlpha = 0.8;
        let t = new PIXI.Text(text, style);
        t.anchor.set(0.5);

        style.fontWeight = "bold";
        style.fontSize = 16;
        let n = new PIXI.Text(name, style);
        n.anchor.set(0.5, 0);
        n.y = -this.block.back.height * 0.5;

        style.fontSize = 8;
        style.fill = ['#c7deff'];
        style.dropShadow = false;
        let date = new PIXI.Text(_date, style);
        date.anchor.set(0.5);
        date.y = this.block.back.height / 2 - 10;

        this.data = new PIXI.Container();
        this.data.addChild(date, n, t);

        this.grid.alpha = 0.8;
        this.block.onenter = ()=>{
            this.grid.alpha = 1.0;
            if(!SettingInterface.muted){
                select2.currentTime = 0.0;
                select2.play();
            }
        }
        this.block.onleave = ()=>{
            this.grid.alpha = 0.8;
        }
        this.select.clear();
        this.select.alpha = 1.0;
        this.select.beginFill(0xf80088, 1.0);
        let w = this.block.back.width;
        let h = this.block.back.height;
        this.select.drawRect(-w/2, -h/2, w, h);
        this.select.endFill();
        this.grid.addChild(this.data);
    }
}

class SavingInterface{
    static executor = null;
    static mode = "save";
    constructor(sheet, back){
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width / 2;
        this.grid.y = app.screen.height / 2;

        this.shadow_mask = new PIXI.Graphics();
        this.shadow_mask.beginFill(0x000000, 0.2);
        this.shadow_mask.drawRect(-app.screen.width / 2, -app.screen.height / 2,
        app.screen.width, app.screen.height);
        this.grid.addChild(this.shadow_mask);

        this.back = new PIXI.Sprite(back);
        this.back.anchor.set(0.5);
        this.back.width = app.screen.width * 0.8;
        this.back.height = this.back.width * 9 / 16;
        this.grid.addChild(this.back);

        this.blocks = new Array(8);
        let xx = -(0.32 * this.back.width);
        let yy = -(0.32 * this.back.height);
        for(let i = 0; i < 8; i++){
            this.blocks[i] = new SavingBlock(sheet.border, xx, yy, 
                this.back.width * 0.3, this.back.height * 0.3);
            xx += 0.32 * this.back.width;
            if((i+1) % 3 == 0){
                xx = -(0.32 * this.back.width);
                yy += 0.32 * this.back.height;
            }
            this.grid.addChild(this.blocks[i].grid);
        }
        let style = GetTextStyle();
        style.fontSize = 10;
        style.dropShadow = false;
        style.fontWeight = "bold";
        style.fill = ['#d20fd2'];
        this.exit = new BPButton(sheet.button2, new PIXI.Text("返回游戏", style), xx, yy, 64, 32);
        this.grid.addChild(this.exit.button);
    }
    set disabled(value){
        this.grid.interactiveChildren = !value;
        // for(let i=0; i < 8; i++){
        //     this.save_blocks[i].grid.interactiveChildren = !value;
        // }
        // this.exit.disabled = value;
    }
    get savings(){
        let s = {};
        for(let i=0; i < 8; i++){
            let status = this.blocks[i].status;
            if(status){
                s[String.fromCharCode(i)] = status;
            }
        }
        return s;
    }
    destroy(){
        this.grid.destroy({children: true, texture: true, baseTexture: false})
    }
}

class SettingInterface{
    static muted = false;
    static all = false;
    static executor = null;
    static dialog = null;
    constructor(sheet, back){
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width / 2;
        this.grid.y = app.screen.height / 2;

        this.shadow_mask = new PIXI.Graphics();
        this.shadow_mask.beginFill(0x000000, 0.2);
        this.shadow_mask.drawRect(-app.screen.width / 2, -app.screen.height / 2,
        app.screen.width, app.screen.height);
        this.grid.addChild(this.shadow_mask);

        this.back = new PIXI.Sprite(back);
        this.back.anchor.set(0.5);
        this.back.width = app.screen.width * 0.8;
        this.back.height = this.back.width * 9 / 16;
        this.grid.addChild(this.back);
        
        let style = GetTextStyle();
        
        // text speed
        style.fill = ['#ffffff'];
        style.dropShadowAlpha = 0.4;

        style.fontSize = 18;
        style.fontWeight = "bold";
        this.speed_text = new PIXI.Text("字体播放速度", style);
        this.speed_text.anchor.set(0.5, 0);
        this.speed_text.y = -this.back.height * 0.45;
        style.fontSize = 10;
        let h = -this.back.height * 0.30;
        this.slow = new BPButton(sheet.button1, new PIXI.Text("慢", style), -96, h, 48, 24);
        this.middle = new BPButton(sheet.button1, new PIXI.Text("普通", style), 0, h, 48, 24);
        this.fast = new BPButton(sheet.button1, new PIXI.Text("快", style), 96, h, 48, 24);
        this.slow.button.alpha = 0.6;
        this.fast.button.alpha = 0.6;
        this.grid.addChild(this.speed_text, this.slow.button, this.middle.button, this.fast.button);
        this.slow.onclick = ()=>{
            if(this.slow.button.alpha >= 1.0){
                return;
            }
            this.slow.button.alpha = 1.0;
            this.middle.button.alpha = 0.6;
            this.fast.button.alpha = 0.6;
            SettingInterface.dialog.speed = 0.5;
            if(!SettingInterface.muted){
                xswitch.currentTime = 0.0;
                xswitch.play();
            }
        }
        this.middle.onclick = ()=>{
            if(this.middle.button.alpha >= 1.0){
                return;
            }
            this.middle.button.alpha = 1.0;
            this.slow.button.alpha = 0.6;
            this.fast.button.alpha = 0.6;
            SettingInterface.dialog.speed = 1.0;
            if(!SettingInterface.muted){
                xswitch.currentTime = 0.0;
                xswitch.play();
            }
        }
        this.fast.onclick = ()=>{
            if(this.fast.button.alpha >= 1.0){
                return;
            }
            this.fast.button.alpha = 1.0;
            this.middle.button.alpha = 0.6;
            this.slow.button.alpha = 0.6;
            SettingInterface.dialog.speed = 2.0;
            if(!SettingInterface.muted){
                xswitch.currentTime = 0.0;
                xswitch.play();
            }
        }

        // muted
        let w = -this.back.width * 0.20;
        style.fontSize = 16;
        this.muted_text = new PIXI.Text("效果音开启", style);
        this.muted_text.anchor.set(0.5, 0);
        this.muted_text.x = w;
        this.muted_text.y = -this.back.height * 0.20;
        style.fontSize = 10;
        h = -this.back.height * 0.05;
        this.mute_yes = new BPButton(sheet.button1, new PIXI.Text("是", style), w-48, h, 48, 24);
        this.mute_no = new BPButton(sheet.button1, new PIXI.Text("否", style),w+48, h, 48, 24);
        this.mute_no.button.alpha = 0.6;
        this.grid.addChild(this.muted_text, this.mute_yes.button, this.mute_no.button);
        this.mute_yes.onclick = ()=>{
            if(this.mute_yes.button.alpha >= 1.0){
                return;
            }
            this.mute_yes.button.alpha = 1.0;
            this.mute_no.button.alpha = 0.6;
            SettingInterface.muted = false;
            xswitch.currentTime = 0.0;
            xswitch.play();
        }
        this.mute_no.onclick = ()=>{
            if(this.mute_no.button.alpha >= 1.0){
                return;
            }
            this.mute_no.button.alpha = 1.0;
            this.mute_yes.button.alpha = 0.6;
            SettingInterface.muted = true;
        }

        // ctrl
        w = this.back.width * 0.20;
        style.fontSize = 16;
        this.ctrl_text = new PIXI.Text("文本跳过设置", style);
        this.ctrl_text.anchor.set(0.5, 0);
        this.ctrl_text.x = w;
        this.ctrl_text.y = -this.back.height * 0.20;
        style.fontSize = 10;
        this.read = new BPButton(sheet.button1, new PIXI.Text("已读", style), w-48, h, 48, 24);
        this.all = new BPButton(sheet.button1, new PIXI.Text("全部", style), w+48, h, 48, 24); 
        this.all.button.alpha = 0.6;
        this.grid.addChild(this.ctrl_text, this.read.button, this.all.button);
        this.read.onclick = ()=>{
            if(this.read.button.alpha >= 1.0){
                return;
            }
            this.read.button.alpha = 1.0;
            this.all.button.alpha = 0.6;
            SettingInterface.all = false;
            if(!SettingInterface.muted){
                xswitch.currentTime = 0.0;
                xswitch.play();
            }
        }
        this.all.onclick = ()=>{
            if(this.all.button.alpha >= 1.0){
                return;
            }
            this.all.button.alpha = 1.0;
            this.read.button.alpha = 0.6;
            SettingInterface.all = true;
            if(!SettingInterface.muted){
                xswitch.currentTime = 0.0;
                xswitch.play();
            }
        }

        // font set
        style.fontSize = 18;
        this.font_text = new PIXI.Text("对话字体设置（下次一定）", style);
        this.font_text.anchor.set(0.5, 0);
        this.font_text.y = this.back.height * 0.05;
        style.fontSize = 10;
        h = this.back.height * 0.2;
        this.KaiTi = new BPButton(sheet.button1, new PIXI.Text("楷体", style), -96, h, 48, 24);
        this.HeiTi = new BPButton(sheet.button1, new PIXI.Text("黑体", style), 0, h, 48, 24);
        this.FangSong = new BPButton(sheet.button1, new PIXI.Text("仿宋", style), 96, h, 48, 24);
        this.KaiTi.button.alpha = 0.6;
        this.FangSong.button.alpha = 0.6;
        this.grid.addChild(this.font_text, this.KaiTi.button, this.HeiTi.button, this.FangSong.button);

        style.fontSize = 10;
        style.dropShadow = false;
        style.fill = ['#d20fd2'];
        this.exit = new BPButton(sheet.button2, new PIXI.Text("返回游戏", style), 
        0, this.back.height * 0.35, 64, 32);
        this.grid.addChild(this.exit.button);
    }
    set disabled(value){
        this.grid.interactiveChildren = !value;
    }
}

class BeginButton{
    constructor(text, style, x, y){
        this.text = new PIXI.Text(text, style);
        this.text.anchor.set(0.5);
        this.text.x = x;
        this.text.y = y;
        this.text.alpha = 0.6;
        this.text.interactive = true;
        this.text.on("mouseenter", ()=>{
            if(!SettingInterface.muted){
                select.play();
            }
            this.text.alpha = 1.0;
        });
        this.text.on("mouseleave", ()=>{
            this.text.alpha = 0.6;
        })
        this.func = null;
    }
    set onclick(func){
        if(this.func){
            this.text.off("click", this.func);
        }
        this.func = func;
        this.text.on("click", this.func);
    }
}

class BeginInterface{
    constructor(){
        let style = GetTextStyle();
        style.fill = ['#ffffff'];
        style.fontWeight = "bold";
        style.fontSize = 18;
        style.dropShadowAlpha = 0.6;
        this.start = new BeginButton("开始游戏", style, 0, 0);
        this.load = new BeginButton("加载回忆", style, 10, 30);
        this.config = new BeginButton("设置界面", style, 20, 60);
        this.exit = new BeginButton("退出游戏", style, 30, 90);
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width * 0.85;
        this.grid.y = app.screen.height * 0.7;
        this.grid.addChild(this.start.text);
        this.grid.addChild(this.load.text);
        this.grid.addChild(this.config.text);
        this.grid.addChild(this.exit.text);
    }
    set disabled(value){
        this.grid.interactiveChildren = !value;
    }
}