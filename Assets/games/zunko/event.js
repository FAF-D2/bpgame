class Animator extends GameObject{
    constructor(total){
        super();
        this.timer = 0;
        this.total = total;
    }
    update(delta){
        this.timer += delta / 1000;
        return this.timer >= this.total ? 0 : (delta / 1000) / this.total;
    }
}

// Show and Hide for _setting and saving
class Show extends Animator{
    constructor(who){
        super(0.1);
        this.object = who;
        this.object.disabled = true;
        this.object.shadow_mask.alpha = 0.0;
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.object.grid.alpha = 1.0;
            this.object.grid.scale.x = 1.0;
            this.object.grid.scale.y = 1.0;
            this.object.shadow_mask.alpha = 1.0;
            this.object.disabled = false;
            this.destroy();
            return;
        }
        this.object.grid.alpha += d;
        this.object.grid.scale.x += d;
        this.object.grid.scale.y += d;
    }
    destroy(){
        super._destroy();
    }
}

class Hide extends Animator{
    constructor(who){
        super(0.1);
        this.object = who;
        this.object.disabled = false;
        this.object.shadow_mask.alpha = 0.0;
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.object.grid.alpha = 0.0;
            this.object.grid.scale.x = 0.0;
            this.object.grid.scale.y = 0.0;
            this.object.disabled = true;
            this.destroy();
            return;
        }
        this.object.grid.alpha -= d;
        this.object.grid.scale.x -= d;
        this.object.grid.scale.y -= d;
    }
    destroy(){
        super._destroy();
    }
}

// Show and Hide for dialog with buttons
class Show2 extends Animator{
    constructor(dialog, buttons){
        this.dialog = dialog;
        this.buttons = buttons;
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.dialog.grid.scale.y = 1.0;
            this.buttons.grid.scale.y = 1.0;
            this.buttons.disabled = false;
            this.destroy();
            return;
        }
        this.dialog.grid.scale.y += d;
        this.buttons.grid.scale.y += d;
    }
    destroy(){
        super._destroy();
    }
}

class Hide2 extends Animator{
    constructor(dialog, buttons){
        this.dialog = dialog;
        this.buttons = buttons;
        this.buttons.disabled = true;
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.dialog.grid.scale.y = 0.0;
            this.buttons.grid.scale.y = 0.0;
            this.destroy();
            return;
        }
        this.dialog.grid.scale.y -= d;
        this.buttons.grid.scale.y -= d;
    }
    destroy(){
        super._destroy();
    }
}

class VideoNextFrame extends Animator{
    constructor(time, total, play=false, callback=null){
        super(total);
        this.play = play;
        this.callback = callback;
        bplayer.jump(time);
        if(play){
            this.promise = bplayer.play();
        }
        else{
            bplayer.pause();
        }
    }
    update(delta){
        let d = super.update(delta);
        if(d == 0){
            if(this.play){
                this.promise.then(bplayer.pause)
            }
            if(this.callback){
                this.callback();
            }
            this.destroy();
        }
    }
    destroy(){
        super._destroy();
    }
}
function easeIn(){

}

function easeOut(){

}

const processfn = [
    ()=>{let frame = new VideoNextFrame(2.0, 0.5, true);},
    ()=>{let frame = new VideoNextFrame(3.0, 0.5, true);},
    ()=>{let frame = new VideoNextFrame(4.0, 0.0);},
    ()=>{let frame = new VideoNextFrame(5.0, 0.0);},
    ()=>{let frame = new VideoNextFrame(6.0, 0.5, true);},
    ()=>{let frame = new VideoNextFrame(7.0, 0.5, true);},
    ()=>{let frame = new VideoNextFrame(8.0, 0.0);},
    ()=>{let frame = new VideoNextFrame(9.0, 0.5, true);},
    ()=>{let frame = new VideoNextFrame(10.0, 1.5, true);},
]