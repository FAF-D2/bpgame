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
        super(0.2);
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
        super(0.2);
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

class Show3 extends Animator{
    constructor(confirm){
        super(0.2);
        this.confirm = confirm;
        this.confirm.grid.alpha = 0.0;
        this.confirm.grid.y = app.screen.height / 2  - 20;
        this.confirm.disabled = true;
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.confirm.grid.y = app.screen.height / 2;
            this.confirm.grid.alpha = 1.0;
            this.confirm.disabled = false;
            this.destroy();
            return;
        }
        this.confirm.grid.y += 20 * d;
        this.confirm.grid.alpha += d;
    }
    destroy(){
        super._destroy();
    }
}

// for bgm
class easeIn extends Animator{
    constructor(bgm){
        super(1.0);
        this.bgm = bgm;
        this.bgm.volume = 0.0;
        this.bgm.play();
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.bgm.volume = 0.35;
            this.destroy();
            return;
        }
        this.bgm.volume += 0.3 * d;
    }
    destroy(){
        super._destroy();
    }
}

class easeOut extends Animator{
    constructor(bgm){
        super(1.0);
        this.bgm = bgm;
        this.bgm.volume = 0.35;
    }
    update(delta){
        let d = super.update(delta);
        if(d <= 0){
            this.bgm.volume = 0.0;
            this.bgm.pause();
            this.bgm.currentTime = 0.0;
            this.destroy();
            return;
        }
        if(this.bgm.volume - 0.3 * d < 0){
            this.bgm.volume = 0.0;
        }
        else{
            this.bgm.volume -= 0.3 * d;
        }
    }
    destroy(){
        super._destroy();
    }
}

class VideoNextFrame extends Animator{
    constructor(time, total=0, play=false, callback=null){
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

function nf(time, total=0, play=false, callback=null){
    new VideoNextFrame(time, total, play, callback);
}
function sd(dialog, buttons){
    new Show2(dialog, buttons);
}
function hd(dialog, buttons){
    new Hide2(dialog, buttons);
}

const processfn = [
    // TODO change .8
    ()=>{nf(1.0, 20.5, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(22.0, 0.1, false, ()=>{handler.next()});BGMHandler.change(normal)},
    ()=>{nf(23.0, 0.8, true)},
    ()=>{nf(24.0, 0.6, true)},
    ()=>{nf(25.0)},
    ()=>{nf(26.0, 0.6, true)},
    ()=>{nf(27.0, 0.6, true)},
    ()=>{nf(28.0, 0.6, true)},
    ()=>{nf(29.0, 0.6, true)},
    ()=>(nf(30.0)),
    ()=>{nf(31.0, 0.6, true)},
    ()=>{nf(32.0)},
    ()=>{hd(dialog, buttons);nf(33.0, 3.0, true, ()=>{handler.next();});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(34.0, 0.0, false, ()=>{handler.next();})},
    ()=>{hd(dialog, buttons);nf(36.0, 28.0, true, ()=>{handler.next();})},
    // stage 2
    ()=>{sd(dialog, buttons);nf(65.0, 0.1, false, ()=>{handler.next();});BGMHandler.change(lucky)},
    ()=>{hd(dialog, buttons);nf(66.0, 1.8, true, ()=>{handler.next();})},
    ()=>{nf(68.0, 0.5, true, ()=>{handler.next();})},
    ()=>{sd(dialog, buttons);nf(68.7, 0.0, false, ()=>{handler.next();})},
    ()=>{nf(69.0, 0.5, true);},
    ()=>{nf(70.0);},
    ()=>{hd(dialog, buttons);setTimeout(()=>nf(71.0, 1.1, true, ()=>{handler.next()}), 500);BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(72.2, 0.0, false, ()=>{handler.next();})},
    ()=>{hd(dialog, buttons);nf(73.0, 1.0, true, ()=>{handler.next();})},
    ()=>{sd(dialog, buttons);nf(74.0, 0, false, ()=>{handler.next();})},
    ()=>{nf(75.0, 0.8, true);BGMHandler.change(ease2)},
    ()=>{nf(76.0, 0.5, true)},
    ()=>{nf(77.0, 0.8, true)},
    ()=>{nf(78.0)},
    ()=>{nf(79.0, 0.8, true);BGMHandler.change(baka)},
    ()=>{nf(80.9, 0.9, true);},
    ()=>{nf(82.0)},
    ()=>{nf(83.0)},
    ()=>{hd(dialog, buttons);nf(84.0, 1.8, true, ()=>{handler.next();})},
    ()=>{sd(dialog, buttons);nf(86.0, 0.0, false, ()=>{handler.next();})},
    ()=>{nf(86.0, 0.8, true)},
    ()=>{hd(dialog, buttons);BGMHandler.change(null);nf(87.0, 2.0, true, ()=>{handler.next();BGMHandler.change(ease3);})},
    ()=>{sd(dialog, buttons);nf(89.0, 0.0, false, ()=>{handler.next();})},
    ()=>{hd(dialog, buttons);nf(90.0, 1.0, true, ()=>{handler.next();});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(92.0, 0.0, false, ()=>{handler.next();})},
    ()=>{hd(dialog, buttons);nf(93.0, 31.0, true, ()=>{handler.next();})},
    // stage 3
    ()=>{sd(dialog, buttons);nf(125.0, 0.0, false, ()=>{handler.next();});BGMHandler.change(lucky)},
    ()=>{BGMHandler.change(danger)},
    ()=>{nf(126.0, 0.8, true)},
    ()=>{nf(127.0, 0.8, true)},
    ()=>{nf(128.0, 0.5, true)},
    ()=>{nf(129.0, 0.8, true)},
    ()=>{nf(130.0, 0.6, true)},
    ()=>{nf(131.0)},
    ()=>{nf(132.0)},
    ()=>{nf(133.0)},
    ()=>{hd(dialog, buttons);nf(134.0, 4.0, true, ()=>{handler.next();});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(138.0, 0.0, false, ()=>{handler.next();})},
    ()=>{nf(138.0, 0.9, true);BGMHandler.change(ease2)},
    ()=>{nf(139.1, 0.6, true)},
    ()=>{nf(140.0, 0.8, true)},
    ()=>{nf(141.0, 0.8, true)},
    ()=>{nf(142.0, 0.8, true)},
    ()=>{nf(143.0)},
    ()=>{nf(144.0)},
    ()=>{nf(145.0, 0.8, true)},
    ()=>{nf(146.0, 0.8, true)},
    ()=>{hd(dialog, buttons);nf(147.0, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(149.1, 0.0, false, ()=>{handler.next()});BGMHandler.change(train)},
    ()=>{nf(150.0, 0.7, true)},
    ()=>{nf(151.0)},
    ()=>{nf(152.0, 1.1, true)},
    ()=>{hd(dialog,buttons);nf(154.1, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{sd(dialog,buttons);nf(156.0, 0.0, false, ()=>{handler.next()});BGMHandler.change(normal)},
    ()=>{hd(dialog, buttons);nf(157.0, 1.0, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(158.1, 0.0, false, ()=>{handler.next()});BGMHandler.change(ease2)},
    ()=>{nf(159.0, 0.8, true)},
    ()=>{nf(160.0)},
    ()=>{nf(160.8, 0.8, true)},
    ()=>{nf(161.8, 0.8, true)},
    ()=>{nf(163.0);},
    ()=>{hd(dialog, buttons);nf(164.0, 1.0, true, ()=>{setTimeout(()=>handler.next(), 1000)});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(167.5, 0, false, ()=>{handler.next()});BGMHandler.change(sweet)},
    ()=>{nf(168.0)},
    ()=>{nf(169.0, 0.8, true)},
    ()=>{hd(dialog, buttons);nf(170.0, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{nf(172.0, 1.0, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(173.5, 0.0, false, ()=>{handler.next()})},
    ()=>{hd(dialog, buttons);nf(174.0, 1.8, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(175.8, 0.0, false, ()=>{handler.next()})},
    ()=>{hd(dialog, buttons);nf(176.0, 1.0, true, ()=>{handler.next()})},
    ()=>{nf(178.0, 1.0, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(179.5, 0.0, false, ()=>{handler.next()});BGMHandler.change(ease)},
    ()=>{nf(180.0, 0.8, true)},
    ()=>{nf(181.0, 0.8, true)},
    ()=>{BGMHandler.change(fight)},
    ()=>{nf(180.8)},
    ()=>{BGMHandler.change(sweet)},
    ()=>{nf(181.0, 0.8, true)},
    ()=>{nf(182.0);BGMHandler.change(null)},
    ()=>{nf(183.0);BGMHandler.change(sweet)},
    ()=>{nf(182.0)},
    ()=>{nf(183.0)},
    ()=>{nf(184.0, 1.0, true)},
    ()=>{hd(dialog, buttons);nf(186.0, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(187.1, 0, false, ()=>{handler.next()});BGMHandler.change(ease2)},
    ()=>{hd(dialog, buttons);nf(188.0, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{nf(190.0, 0.6, true, ()=>{handler.next()});BGMHandler.change(grey)},
    ()=>{sd(dialog, buttons);nf(190.6, 0.0, false, ()=>{handler.next()})},
    ()=>{nf(191.0, 1.2, true)},
    ()=>{nf(193.0, 1.2, true)},
    ()=>{nf(195.0, 1.2, true)},
    ()=>{nf(197.0, 1.1, true);BGMHandler.change(null)},
    ()=>{nf(199.0, 0.6, true)},
    ()=>{nf(200, 0.5, true)},
    ()=>{nf(201, 1.1, true)},
    ()=>{hd(dialog, buttons);nf(203.0, 1.1, true, ()=>{handler.next()})},
    ()=>{nf(205.0, 0.5, true, ()=>{handler.next()});BGMHandler.change(sweet)},
    ()=>{sd(dialog, buttons);nf(205.6, 0, false, ()=>{handler.next()})},
    ()=>{nf(207.0, 1.0, true)},
    ()=>{nf(209.0, 1.5, true)},
    ()=>{nf(211.0, 0.8, true)},
    ()=>{nf(212.0, 0.6, true)},
    ()=>{nf(213.0)},
    ()=>{nf(214.0)},
    ()=>{nf(211.8)},
    ()=>{nf(214.0)},
    ()=>{hd(dialog, buttons);nf(215.0, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{nf(217.0, 0.5, true, ()=>{handler.next()});BGMHandler.change(danger)},
    ()=>{sd(dialog, buttons);nf(217.6, 0, false, ()=>{handler.next()})},
    ()=>{nf(218.0, 1.1, true)},
    ()=>{hd(dialog, buttons);nf(220.0, 1.0, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{nf(222.0, 1.0, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(223.5, 0.0, false, ()=>{handler.next()});BGMHandler.change(reality)},
    ()=>{hd(dialog, buttons);nf(224.0, 5.0, true, ()=>{handler.next()})},
    ()=>{sd(dialog, buttons);nf(229.5, 0.0, false, ()=>{handler.next()})},
    ()=>{hd(dialog, buttons);nf(230.0, 21.2, true, ()=>{handler.next()});BGMHandler.change(null)},
    ()=>{sd(dialog, buttons);nf(253.0, 0.0, false, ()=>{handler.next()})}
]