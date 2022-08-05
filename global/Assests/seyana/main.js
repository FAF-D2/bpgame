
const perfect_interval = 80;
const great_interval = 120;


function local_req(data){
    return {location: "local", data: data};
}

class boss_lovebar{
    constructor(){
        // static
        this.lovebar = load(local_req("seyana/img/boss_lovebar.png"), (url) => create_img(url));
        var fill_url = load(local_req("seyana/img/boss_lovebar_fill.png"));
        this.bar_wrap = create_img(fill_url);

        // health - dynamic
        this.lovebar_fill = create_img(fill_url);
        this.lovebar_fill_shadow = create_img(fill_url);
        this.health = 1.0;
        this.health_shadow = 1.0;

        // static window
        this.window1 = create_window(0.5, 0.09, 0.8, 0.18, true, 0);
        this.window1.setStyle(pixelated);
        
        // dynamic window
        this.window2 = create_window(0.5, 0.09, 0.8, 0.18, true, 1);
        this.window2.setStyle(pixelated);
    }
    draw1(){
        this.window1.draw_img(this.lovebar, 0.5, 0.5, 1, 1, {globalAlpha: 1.0});
        this.window1.draw_img(this.bar_wrap, 0.5, 0.5, 1, 1, {globalAlpha: 0.2});
    }
    draw2(){
        this.window2.clear();
        this.window2.draw_img(this.lovebar_fill_shadow, 0.5, 0.5, 1 * this.health_shadow, 1, {globalAlpha: 0.4});
        this.window2.draw_img(this.lovebar_fill, 0.5, 0.5, 1 * this.health, 1, {globalAlpha: 0.8});
        this.step();
    }
    step(){
        if(this.health_shadow - this.health < 0.02){
            this.health_shadow = this.health;
            return;
        }
        this.health_shadow = lerp(this.health_shadow, this.health, 0.6);
    }
    clear(){
        this.window1.clear();
        this.window2.clear();
    }
}

class gamer_lovebar{
    constructor(){
        this.lovebar = load(local_req("seyana/img/boss_lovebar.png"), (url) => create_img(url));
        this.lovebar_fill = load(local_req("seyana/img/glovebar_fill.png"), (url) => create_img(url));
        this.health = 1.0;
        
        this.window1 = create_window(0.87, 0.95, 0.26, 0.08, true, 0);
        this.window1.setStyle(pixelated);
        this.window2 = create_window(0.87, 0.95, 0.26, 0.08, true, 1);
        this.window2.setStyle(pixelated);
    }
    draw1(){
        this.window1.draw_img(this.lovebar, 0.5, 0.5, 1, 1, {globalAlpha: 1.0});
    }
    draw2(){
        this.window2.clear();
        this.window2.draw_img(this.lovebar_fill, 0.5, 0.5, 1 * this.health, 1, {globalAlpha: 0.8});
    }
    clear(){
        this.window1.clear();
        this.window2.clear();
    }
}

class TapInfo{
    constructor(r, b){
        this.all = r + b;
        this.rall = r;
        this.ball = b; 
        this.perfect = 0; 
        this.great = 0; 
        this.miss = 0; 
        this.combo = 0;
        this.max_combo = 0;
        this.window2 = create_window(0.5, 0.88, 0.2, 0.2, true, 4);
        this.text = "";
        //this.window2 = create_window(0.5, 0.5, 1.0, 1.0, true, 1);
        this.window2.setStyle({font: "30px bold fantasy"});
    }
    p(){
        this.perfect++;
        this.combo++;
        this.text = "Perfect";
        this.window2.setStyle({fillStyle: "#ffd700"});
    }
    g(){
        this.great++;
        this.combo++;
        this.text = "Great";
        this.window2.setStyle({fillStyle: "#dda0dd"});
    }
    m(){
        this.miss++;
        if(this.combo > this.max_combo)
            this.max_combo = this.combo;
        this.combo = 0;
        this.text = "miss";
        this.window2.setStyle({fillStyle: "#ffffff"});
    }
    accuracy(){
        this.window2.clear();
        let accu = ( (this.perfect + 0.6 * this.great) / this.all ).toFixed(4) * 100;
        let accus = accu.toString() + "%";
        this.window2.setStyle({font: "40px bold fantasy", fillStyle: "#ffffff"});
        this.window2.draw_font(accus, 0.5, 0.5);
        return accu;
    }
    draw2(){
        this.window2.clear();
        if(this.text != null){
            this.window2.draw_font(this.text, 0.5, 0.8);
        }
        if(this.combo == 0){
            return;
        }
        this.window2.draw_font(this.combo.toString(), 0.5, 0.85);
    }
}

class Note{
    static red = null;
    static blue = null;
    static double = null;
    constructor(hittime, IFRED, IFDOUBLE=false){
        if(!Note.red)
            Note.red = load(local_req("seyana/img/note/red.png"), (url) => create_img(url));
        if(!Note.blue)
            Note.blue = load(local_req("seyana/img/note/blue.png"), (url) => create_img(url));
        if(!Note.double)
            Note.double = load(local_req("seyana/img/note/double.png"), (url) => create_img(url));
        this.hittime = hittime;
        this.x = (IFRED ? 1.05 : -0.05);
        this.y = 0.5;
        this.red = IFRED;
        this.double = IFDOUBLE;
        this.alpha = 0.8;
    }
    step(){
        var delta = 0.5 * deltatime() / 1000;
        if(this.red)
            this.x -= delta;
        else
            this.x += delta;
        
    }
    draw2(window){
        window.setStyle({globalAlpha: this.alpha});
        if(this.red)
            window.draw_img(Note.red, this.x, this.y, 0.08, 1.0);
        else
            window.draw_img(Note.blue, this.x, this.y, 0.08, 1.0);
        if(this.double)
            window.draw_img(Note.double, this.x, this.y, 0.08, 1.0);
        this.step();
    }
}

class particle{
    static red = null;
    static blue = null;
    constructor(IFRED){
        if(!particle.red)
            particle.red = load(local_req("seyana/img/note/hit_red.png"), (url) => create_img(url));
        if(!particle.blue)
            particle.blue = load(local_req("seyana/img/note/hit_blue.png"), (url) => create_img(url));
        this.alpha = 1.0;
        this.scale = 0.2;
        this.red = IFRED;
        this.done = false;
    }
    step(){
        if(this.scale >= 0.95)
           this.done = true;
        this.scale = lerp(this.scale, 1.0, 0.45);
        this.alpha = lerp(this.alpha, 0.4, 0.45);
    }
    draw2(window){
        window.setStyle({globalAlpha: this.alpha});
        if(this.red)
            window.draw_img(particle.red, 0.5, 0.5, this.scale, this.scale);
        else
            window.draw_img(particle.blue, 0.5, 0.5, this.scale, this.scale);
        this.step();
    }
}

class reader{
    constructor(){
        this.reader = load(local_req("seyana/img/note/reader.png"), (url) => create_img(url));

        this.window1 = create_window(0.5, 0.68, 1.0, 0.16, true, 0);
        this.window1.setStyle(pixelated);


        this.note_window = create_window(0.5, 0.68, 1.0, 0.14, true, 2); this.note_window.setStyle(pixelated);
        this.pr_window = create_window(0.55, 0.68, 0.14, 0.28, true, 1); this.pr_window.setStyle(pixelated);
        this.pb_window = create_window(0.45, 0.68, 0.14, 0.28, true, 1); this.pb_window.setStyle(pixelated);

        this.times = 0;
        this.hit_red_window = create_window(0.75, 0.5, 0.5, 1.0, true, 3);
        this.hit_blue_window = create_window(0.25, 0.5, 0.5, 1.0, true, 3);

        // maps
        this.map = load(local_req("seyana/maker/map.json"), (url) => get_json(url));
        this.red_idx = 0; this.blue_idx = 0;
        this.speed = 1000;
        this.info = new TapInfo(this.map['red'].length, this.map['blue'].length);
        this.red_particles = new Array();
        this.blue_particles = new Array();
        this.rnotes = new Array();
        this.bnotes = new Array();

    }
    draw1(){
        this.window1.draw_img(this.reader, 0.5, 0.5, 0.2, 1, {globalAlpha: 1.0});
        this.window1.draw_rectangle(0.25, 0.5, 0.5, 1, "rgba(44, 186, 216, 0.08)");
        this.window1.draw_rectangle(0.75, 0.5, 0.5, 1, "rgba(177, 42, 53, 0.12)");
    }
    draw2(){
        if(this.times > 3){
            this.hit_red_window.clear();
            this.hit_blue_window.clear();
            this.times = 0;
        }
        else{
            this.times++;
        }
        this.pr_window.clear();
        this.pb_window.clear();
        this.note_window.clear();
        for(var i=0; i < this.rnotes.length; i++){
            this.rnotes[i].draw2(this.note_window);
        }
        for(var i=0; i < this.bnotes.length; i++){
            this.bnotes[i].draw2(this.note_window);
        }
        if(this.red_particles.length > 0){
            for(var i=0; i < this.red_particles.length; i++){
                this.red_particles[i].draw2(this.pr_window);
            }
            if(this.red_particles[0].done){
                this.red_particles.shift();
            }
        }
        if(this.blue_particles.length > 0){
            for(var i=0; i< this.blue_particles.length; i++){
                this.blue_particles[i].draw2(this.pb_window);
            }
            if(this.blue_particles[0].done){
                this.blue_particles.shift();
            }
        }
        this.info.draw2();
    }
    read(){
        var now = bplayer.now_time() * 1000;
        var red_buffer = new Array();
        var blue_buffer = new Array();
        while(this.red_idx < this.map['red'].length){
            let hittime = this.map['red'][this.red_idx];
            if(hittime - now > this.speed)
                break;
            red_buffer.push(hittime);
            this.red_idx++;
        }
        var blue_buffer = new Array();
        while(this.blue_idx < this.map['blue'].length){
            let hittime = this.map['blue'][this.blue_idx];
            if(hittime - now > this.speed)
                break;
            blue_buffer.push(hittime);
            this.blue_idx++;
        }
        var red_pointer = 0;
        var blue_pointer = 0;
        while(red_pointer < red_buffer.length || blue_pointer < blue_buffer.length){
            let bhit = (blue_pointer < blue_buffer.length ? blue_buffer[blue_pointer] : -1);
            let rhit = (red_pointer < red_buffer.length ? red_buffer[red_pointer] : -1);
            if(rhit == -1){
                this.bnotes.push(new Note(bhit, false, false));
                blue_pointer++;
            }
            else if(bhit == -1){
                this.rnotes.push(new Note(rhit, true, false));
                red_pointer++;
            }
            else if(rhit == bhit){
                this.rnotes.push(new Note(rhit, true, true));
                this.bnotes.push(new Note(bhit, false, true));
                red_pointer++;
                blue_pointer++;
            }
            else if(rhit < bhit){
                this.rnotes.push(new Note(rhit, true, false));
                red_pointer++;
            }
            else if(bhit < rhit){
                this.bnotes.push(new Note(bhit, false ,false));
                blue_pointer++;
            }
        }
    }
    opt(){
        var left_down = getkeydown(keycode.d) + getkeydown(keycode.f);
        var right_down = getkeydown(keycode.j) + getkeydown(keycode.k);
        var now = bplayer.now_time() * 1000;
        var current_red_note = (this.rnotes.length > 0 ? this.rnotes[0] : null);
        var current_blue_note = (this.bnotes.length > 0 ? this.bnotes[0] : null);
        var result = [0, 0];
        if(right_down){
            if(!this.hit_red_window.isclear)
                this.hit_red_window.clear();
            let color = "rgba(177, 42, 53, 0.1)";
            this.hit_red_window.draw_rectangle(0.5, 0.5, 1.0, 1.0, color);
            this.times = 0;
        }
        while(right_down && current_red_note){
            let offset = Math.abs(now - current_red_note.hittime);
            if(offset < perfect_interval){
                this.info.p();
                this.red_particles.push(new particle(true));
                this.rnotes.shift();
                result[0] += 2;
                current_red_note = (this.rnotes.length > 0 ? this.rnotes[0] : null);
                right_down--;
            }
            else if(offset < great_interval){
                this.info.g();
                this.red_particles.push(new particle(true));
                this.rnotes.shift();
                result[0] += 1;
                right_down--;
            }
            else{
                break;
            }
        }
        if(current_red_note){
            if(now - current_red_note.hittime > great_interval){
                this.info.m();
                this.rnotes.shift();
            }
            else if(now - current_red_note.hittime > perfect_interval){
                current_red_note.alpha = 0.3;
            }
            else if(now - current_red_note.hittime > perfect_interval / 2){
                current_red_note.alpha = 0.6;
            }
        }

        if(left_down){
            if(!this.hit_blue_window.isclear)
                this.hit_blue_window.clear();
            let color = "rgba(44, 186, 216, 0.06)";
            this.hit_blue_window.draw_rectangle(0.5, 0.5, 1.0, 1.0, color);
            this.times = 0;
        }
        while(left_down && current_blue_note){
            let offset = Math.abs(now - current_blue_note.hittime);
            if(offset < perfect_interval){
                this.info.p();
                this.blue_particles.push(new particle(false));
                this.bnotes.shift();
                result[1] = 0;
                left_down--;
            }
            else if(offset < great_interval){
                this.info.g();
                this.blue_particles.push(new particle(false));
                this.bnotes.shift();
                result[1] += 1; 
                left_down--;
            }
            else{
                break;
            }
        }
        if(current_blue_note){
            if(now - current_blue_note.hittime > great_interval){
                this.info.m();
                this.bnotes.shift();
                result[1] += 2;
            }
            else if(now - current_blue_note.hittime > perfect_interval){
                current_blue_note.alpha = 0.3;
            }
            else if(now - current_blue_note.hittime > perfect_interval / 2){
                current_blue_note.alpha = 0.6;
            }
        }
        return result;
    }
    clear(){
        this.window1.clear();
        this.hit_blue_window.clear();
        this.hit_red_window.clear();
        this.note_window.clear();
        this.pr_window.clear();
        this.pb_window.clear();
    }
}

var acc = null;
var end = null;

function FSM(nreader, blb, glb){
    if(bplayer.now_time() > Bvideo.time2second("3:19")){
        bquit();
        return;
    }
    if(end !== null){
        if(end == 1 && bplayer.now_time() >= Bvideo.time2second("2:50"))
            bplayer.jump_at(Bvideo.time2second("3:10"));
        else if(end == 1 && bplayer.now_time() >= Bvideo.time2second("2:55"))
            bplayer.jump_at(Bvideo.time2second("3:10"));
        else if(end == 2 && bplayer.now_time() >= Bvideo.time2second("3:00"))
            bplayer.jump_at(Bvideo.time2second("3:10"));
        else if(end == 0xdddddddd && bplayer.now_time() >= Bvideo.time2second("3:10"))
            bquit();
        return;
    }
    if(bplayer.now_time() >= Bvideo.time2second("2:43")){
        console.log("???");
        if(end === null){
            if(nreader.info.miss == nreader.info.all){
                bplayer.jump_at(Bvideo.time2second("3:00"));
                end = 0xdddddddd;
            }
            else if(acc < 90){
                bplayer.jump_at(Bvideo.time2second("2:45"));
                end = 1;
            }
            else if(acc < 100){
                bplayer.jump_at(Bvideo.time2second("2:50"));
                end = 2;
            }
            else if(nreader.info.perfect = nreader.info.all){
                bplayer.jump_at(Bvideo.time2second("2:55"));
                end = 3;
            }
        }
        return;
    }
    if(bplayer.now_time() >= Bvideo.time2second("2:36")){
        if(acc === null){
            bplayer.jump_at(Bvideo.time2second("2:40"));
            nreader.clear();
            blb.clear();
            glb.clear();
            acc = nreader.info.accuracy();
        }
        return;
    }
    nreader.read();
    var result = nreader.opt();
    nreader.draw2();
    var r_delta = 1 / (2 * nreader.info.rall);
    blb.health -= r_delta * result[0];
    var b_delta = 1 / (2 * nreader.info.ball);
    glb.health -= b_delta * result[1];
    blb.draw2();
    glb.draw2();
    frame_clear();
}

function main()
{
    //prepare
    let n = new Note();
    let p = new particle();
    var blb = new boss_lovebar();
    blb.draw1();
    blb.draw2();
    var glb = new gamer_lovebar();
    glb.draw1();
    glb.draw2();
    var nreader = new reader();
    nreader.draw1();

    //update
    bupdate(() => FSM(nreader, blb, glb));
    start_key_listener();

    //start
    if(bplayer.is_pause())
        bplayer.pause();
}

attach_game(main);