
class Button{
    constructor(back, text, x, y, a){
        this.grid = new PIXI.Container();
        this.grid.x = x;
        this.grid.y = y;
        let style = GetTextStyle();
        style.fill = ["#ffffff"];
        style.fontWeight = "bold";
        style.dropShadowAlpha = 0.4
        this.text = new PIXI.Text(text, style);
        this.text.anchor.set(0.5);
        this.button = new BPButton(back, null, 0, 0, a, a);
        this.button.button.alpha = 0.9;
        this.mask = new PIXI.Graphics();
        this.mask.lineStyle(0);
        this.mask.beginFill(0x000000, 1.0);
        let t = (Math.sqrt(2) / 2) * a;
        this.mask.drawRect(-t/2, -t/2, t , t);
        this.mask.angle = 45;
        this.grid.mask = this.mask;
        this.grid.addChild(this.button.button, this.text, this.mask);
        this.button.onenter = ()=>{
            this.grid.scale.x = 1.1;
            this.grid.scale.y = 1.1;
        };
        this.button.onleave = ()=>{
            this.grid.scale.x = 1.0;
            this.grid.scale.y = 1.0;
        }
        this.button.onclick = ()=>{
            xconfirm.currentTime = 0.0;
            lazy.play();
            xconfirm.play();
        }
    }
}

class Buttons{
    constructor(sheet){
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width * 0.30;
        this.grid.y = app.screen.height * 0.5;
        this.Work = new Button(sheet.work, "工作", -app.screen.width * 0.1, -app.screen.height * 0.2, 192);
        this.Store = new Button(sheet.store, "商店", app.screen.width * 0.05, -app.screen.height * 0.05, 128);
        this.Play = new Button(sheet.play, "? ? ?", -app.screen.width * 0.05, app.screen.height * 0.05, 64);
        this.Eat = new Button(sheet.eat, "喂食", -app.screen.width * 0.15, app.screen.height * 0.05, 96);
        this.grid.addChild(this.Work.grid, this.Store.grid, this.Play.grid, this.Eat.grid);
    }
}

class Speak{
    constructor(){
        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width * 0.850;
        this.grid.y = app.screen.height * 0.45;
        this.bubble = PIXI.Sprite.from("./img/bubble.png");
        this.bubble.anchor.set(1.0, 1.0);
        this.grid.addChild(this.bubble);
        this.style = GetTextStyle();
        this.style.fontSize = 12;
        this.style.fill = ["#ffffff"];
        this.style.fontWeight = "bold";
        this.style.wordWrapWidth = 192;
        this.text = new PIXI.Text(" ", this.style);
        this.text.y -= 100;
        this.text.x -= 220;
        this.grid.addChild(this.text);
        this.grid.scale.x = 0;
        this.grid.scale.y = 0;
    }
    change(text, style=null){
        this.grid.removeChildAt(1);
        this.text = new PIXI.Text(text, style ? style : this.style);
        this.text.y -= 100;
        this.text.x -= 220;
        this.grid.addChild(this.text);
    }
}
let speak = new Speak();

class animator extends GameObject{
    constructor(total){
        super();
        this.timer = 0;
        this.total = total;
    }
    update(delta){
        this.timer += delta;
        return this.timer >= this.total * 1000 ? 0 : delta / (this.total * 1000);
    }
    destroy(){
        super._destroy();
    }
}

class ShowBubble extends animator{
    constructor(bubble){
        super(0.05);
        this.bubble = bubble;
        this.bubble.scale.x = 0.0;
        this.bubble.scale.y = 0.0;
    }
    update(delta){
        let d = super.update(delta);
        if(d === 0){
            this.bubble.scale.x = 1.0;
            this.bubble.scale.y = 1.0;
            this.destroy();
        }
        this.bubble.scale.x += d;
        this.bubble.scale.y += d;
    }
    destroy(){
        super._destroy();
    }
}

class HideBubble extends animator{
    constructor(bubble){
        super(0.05);
        this.bubble = bubble;
    }
    update(delta){
        let d = super.update(delta);
        if(d === 0){
            this.bubble.scale.x = 0.0;
            this.bubble.scale.y = 0.0;
            this.destroy();
        }
        if(this.bubble.scale.x - d <= 0){
            this.bubble.scale.x = 0.0;
            this.bubble.scale.y = 0.0;
            this.destroy();
            return;
        }
        this.bubble.scale.x -= d;
        this.bubble.scale.y -= d;
    }
    destroy(){
        super._destroy();
    }
}

class ShowFace extends animator{
    constructor(face, callback=null){
        super(0.1);
        this.face = face;
        this.timer = 0;
        this.done = false;
        this.callback = callback;
        this.face.scale.x = 0.20; 
    }
    update(delta){
        if(this.done){
            this.timer += delta;
            if(this.timer >= 3000){
                if(this.callback){
                    this.callback();
                }
                this.destroy();
            }
            return;
        }
        let d = super.update(delta);
        if(d === 0){
            this.face.scale.x = 0.24;
            this.done = true;
        }
        this.face.scale.x += 0.04 * d;
    }
    destroy(){
        super._destroy();
    }
}

class Faces{
    constructor(faces, words){
        this.words = words;
        let _init = function(tex){
            let sprite = new PIXI.Sprite(tex);
            sprite.anchor.set(0.5);
            sprite.scale.x = 0.240;
            sprite.scale.y = 0.240;
            sprite.alpha = 0;
            return sprite;
        }
        this.mu = _init(faces.mu);
        this.normal = _init(faces.normal);
        this.angry = _init(faces.angry);
        this.he = _init(faces.he);
        this.siro = _init(faces.siro);
        this.eihe = _init(faces.eihe);
        this.cur_face = this.normal;
        this.cur_face.alpha = 1.0;

        this.grid = new PIXI.Container();
        this.grid.x = app.screen.width * 0.870;
        this.grid.y = app.screen.height * 0.502;
        this.grid.addChild(this.normal, this.angry, this.mu, this.he, this.siro, this.eihe);

        this.hit = new PIXI.Graphics();
        this.hit.beginFill(0x000000, 0.01);
        this.hit.drawRect(-app.screen.width * 0.17, -app.screen.height*0.15, app.screen.width * 0.3, app.screen.height * 0.65);
        this.grid.addChild(this.hit);
        this.grid.interactive = true;
        this.changing = false;
        this.grid.on("click", ()=>{
            if(this.changing){
                return;
            }
            lazy.play();
            this.changeface();
        });
    }
    changeface(){
        let seed = Math.floor(7 * Math.random());
        this.changing = true;
        this.cur_face.alpha = 0.0;
        click.currentTime = 0.12;
        click.play();
        switch(seed){
            case 0:{
                angry1.play();
                speak.change(this.words.angry1[Math.floor(this.words.angry1.length * Math.random())]);
                angry1.currentTime = 0.2;
                this.cur_face = this.angry;
                break;
            }
            case 1:{
                angry2.play();
                speak.change(this.words.angry2[Math.floor(this.words.angry2.length * Math.random())]);
                angry2.currentTime = 0.2;
                this.cur_face = this.siro;
                break;
            }
            case 2:{
                angry3.play();
                speak.change(this.words.angry3[Math.floor(this.words.angry3.length * Math.random())]);
                angry3.currentTime = 0.5;
                this.cur_face = this.angry;
                break;
            }
            case 3:{
                doya.play();
                speak.change(this.words.doya[Math.floor(this.words.doya.length * Math.random())]);
                doya.currentTime = 0.3;
                this.cur_face = this.eihe;
                break;
            }
            case 4:{
                hai.play();
                speak.change(this.words.hai[Math.floor(this.words.hai.length * Math.random())]);
                hai.currentTime = 0.2;
                this.cur_face = this.siro;
                break;
            }
            case 5:{
                naruhodo.play();
                speak.change(this.words.naruhodo[Math.floor(this.words.naruhodo.length * Math.random())]);
                naruhodo.currentTime = 0.2;
                this.cur_face = this.he;
                break;
            }
            case 6:{
                sigoto.play();
                speak.change(this.words.sigoto[Math.floor(this.words.sigoto.length * Math.random())]);
                sigoto.currentTime = 0.2;
                this.cur_face = this.mu;
                break;
            }
        }
        new ShowBubble(speak.grid);
        new ShowFace(this.cur_face, ()=>{
            this.changing = false;
            this.cur_face.alpha = 0.0;
            this.cur_face = this.normal;
            this.cur_face.alpha = 1.0;
            new HideBubble(speak.grid);
        })
        this.cur_face.alpha = 1.0;
    }
}