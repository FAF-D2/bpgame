const setting = {
    resolution: 2,
}


const GAL_TEXT_STYLE = {
    fontFamily: 'Microsoft YaHei',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: 'normal',
    lineHeight: 0,
    fill: ['#feffeb'],
    stroke: '#feffeb',
    letterSpacing: 2,
    strokeThickness: 0,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowAlpha: 0.4,
    dropShadowBlur: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 2,
    wordWrap: true,
    wordWrapWidth: 400,
    breakWords: true,
};
Object.freeze(GAL_TEXT_STYLE);

function GetTextStyle(){
    return JSON.parse(JSON.stringify(GAL_TEXT_STYLE));
}


//-----------------------------
// classes

/**
 * @typedef {PIXI.Texture} BTexture
 * @typedef {PIXI.Text} BText
 * @typedef {PIXI.Sprite} Sprite
 */

function _CREATE_CONTAINER(x, y){
    let container = new PIXI.Container();
    if(!isNaN(x) && !isNaN(y)){
        container.x = x;
        container.y = y;
    }
    else{
        console.log("x or y should be number");
    }
    return container;
}

class BPButton{
    #_onmousedown;
    #_onmouseup;
    #_onenter;
    #_onleave;
    #_hover;
    #_holding;
    /**
     * 简单的按钮类
     * @param {BTexture} background 按钮背景纹理
     * @param {BText} text 按钮文本，为PIXI.Text，可设为null
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    constructor(background, text, x, y, width, height){
        this.back = new PIXI.Sprite(background);
        this.text = text;
        this.button = _CREATE_CONTAINER(x, y);
        this.back.anchor.set(0.5);
        this.back.width = width;
        this.back.height = height;
        this.back.interactive = true;
        if(this.text){
            this.text.anchor.set(0.5);
            this.button.addChild(this.back, this.text);
        }
        else{
            this.button.addChild(this.back);
        }

        // utils func
        this.#_onmousedown = null;
        this.#_onmouseup = null;
        this.#_onenter = null;
        this.#_onleave = null;
        this.#_hover = false;
        this.back.on("mouseenter", ()=>{this.#_hover = true});
        this.back.on("mouseleave", ()=>{this.#_hover = false});
        this.back.on("mousedown", ()=>{this.#_holding = true});
        this.back.on("mouseup", ()=>{this.#_holding = false});
    }
    get disabled(){
        return this.back.interactive;
    }
    set disabled(cmd){
        this.back.interactive = (cmd === true) ? false : true;
    }
    get hover(){
        return this.#_hover;
    }
    get holding(){
        return this.#_holding;
    }
    set onmouseup(func){
        this.#listener("mouseup", func, this.#_onmouseup);
        this.#_onmouseup = typeof(func) == "function" ? func : null;
    }
    set onmousedown(func){
        this.#listener("mousedown", func, this.#_onmousedown);
        this.#_onmousedown = typeof(func) == "function" ? func : null;
    }
    set onclick(func){
        this.#listener("mousedown", func, this.#_onmousedown);
        this.#_onmousedown = typeof(func) == "function" ? func : null;
    }
    set onenter(func){
        this.#listener("mouseenter", func, this.#_onenter);
        this.#_onenter = typeof(func) == "function" ? func : null;
    }
    set onleave(func){
        this.#listener("mouseleave", func, this.#_onleave);
        this.#_onleave = typeof(func) == "function" ? func : null;
    }
    #listener(name, func, old_func){
        if(old_func){
            this.back.off(name, old_func);
        }
        if(typeof(func) == "function"){
            this.back.on(name, func);
        }
    }
    destroy(opt={children: true, texture: true, baseTexture: false}){
        this.button.destroy(opt);
    }
}

class BPTextPlayer{
    #mask;
    #line;
    #mask_width;
    #style;
    #total_lines;
    #lineHeight;
    /**
     * 用于播放文本
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} lineHeight
     * @param {Dictionary} textStyle 
     */
    constructor(x, y, width, height, lineHeight, textStyle=GetTextStyle()){
        this.layer = _CREATE_CONTAINER(x - width / 2, y - height / 2);
        this.width = width;
        this.height = height;
        textStyle.wordWrapWidth = this.width;
        this.#style = new PIXI.TextStyle(textStyle);
        this.#lineHeight = lineHeight;
        this.#total_lines = Math.floor(this.height / this.#lineHeight);

        // mask component playing text
        this.#mask = new PIXI.Graphics();
        this.#mask.lineStyle(0);
        this.#mask_width = 0;
        this.#line = 0;
        this.layer.mask = this.#mask;
        this.layer.addChild(this.#mask);
        this.isFinish = false;
        this.text = null;

        this.speed = 1.0;
    }
    set style(textStyle){
        textStyle.wordWrapWidth = this.width;
        this.#style = new PIXI.TextStyle(textStyle);
    }
    set lineHeight(height){
        this.#lineHeight = height;
        this.#total_lines = Math.floor(this.height / this.#lineHeight);
    }
    get lineHeight(){
        return this.#lineHeight;
    }
    display(text, filter_func=null){
        if(this.layer.children.length == 2){
            this.layer.removeChildAt(1).destroy();
        }
        this.text = text;
        let t = new PIXI.Text(text, this.#style);
        if(filter_func){
            t.filters = filter_func(t.texture);
        }
        this.layer.addChild(t);
        this.#mask_width = 0;
        this.#line = 0;
        this.isFinish = false;
    }
    finish(){
        this.#mask.clear();
        this.#mask.beginFill(0x000000, 1.0);
        this.#mask.lineTo(this.width, 0);
        this.#mask.lineTo(this.width, this.height);
        this.#mask.lineTo(0, this.height);
        this.#mask.lineTo(0, 0);
        this.isFinish = true;
    }
    update(delta){
        if(this.#line > this.#total_lines){
            this.isFinish = true;
            return true;
        }
        if(this.#mask_width >= this.width){
            this.#mask_width = 0;
            this.#line += 1;
        }
        this.#mask_width += this.speed * delta * this.lineHeight * 50;
        this.#mask.clear();
        this.#mask.beginFill(0x000000, 1.0);
        if(this.#line == 0){
            this.#mask.lineTo(this.#mask_width, 0);
            this.#mask.lineTo(this.#mask_width, this.lineHeight);
            this.#mask.lineTo(0, this.lineHeight);
            this.#mask.lineTo(0, 0);
        }
        else{
            this.#mask.lineTo(this.width, 0);
            let h = this.lineHeight * this.#line;
            this.#mask.lineTo(this.width, h);
            this.#mask.lineTo(this.#mask_width, h);
            this.#mask.lineTo(this.#mask_width, h + this.lineHeight);
            this.#mask.lineTo(0, h + this.lineHeight);
            this.#mask.lineTo(0, 0);
        }
        return false;
    }
    destroy(){
        this.layer.destroy({children: true});
    }
}

class BPDialog{
    /**
     * 对话框类
     * @param {BTexture} background 对话框背景纹理
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} lineHeight 
     * @param {Dictionary} textStyle 
     */
    constructor(background, x, y, width, height, lineHeight, textStyle=GetTextStyle()){
        this.back = new PIXI.Sprite(background);
        this.player = new BPTextPlayer(0, 0, width * 0.95, height * 0.95, lineHeight, textStyle);
        this.dialog = _CREATE_CONTAINER(x, y);
        this.back.anchor.set(0.5);
        this.back.width = width;
        this.back.height = height;

        this.dialog.addChild(this.back, this.player.layer);
    }
    display(text, filter_func=null){
        this.player.display(text, filter_func);
    }
    finish(){
        this.player.finish();
    }
    update(delta){
        return this.player.update(delta);
    }
    destroy(opt={children: true, texture: true, baseTexture: false}){
        this.dialog.destroy(opt);
    }
}

class BPBar{
    #value;
    #mask;
    #min;
    #max;
    #change_mask(){
        let scale = (this.#value - this.#min) / (this.#max - this.#min);
        this.#mask.clear();
        this.#mask.beginFill(0x000000, 1.0);
        this.#mask.drawRect(0, 0, this.back.width * scale, this.back.height);
    }
    /**
     * 条：进度条、血量条等
     * @param {BTexture} background 背景（框）纹理
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} min 
     * @param {Number} max 
     */
    constructor(background, x, y, width, height, min=0, max=100){
        this.back = new PIXI.Sprite(background);
        this.back.anchor.set(0.5);
        this.back.width = width;
        this.back.height = height;
        this.bar = _CREATE_CONTAINER(x, y);
        this.#mask = new PIXI.Graphics();
        this.#mask.x = -width / 2;
        this.#mask.y = -height / 2;

        this.#min = min;
        this.#max = max;
        this.#value = min;

        // mask componet to show progress
        this.bar.mask = this.#mask;
        this.bar.addChild(this.back, this.#mask);
        this.#change_mask();
    }
    get value(){
        return this.#value;
    }
    set value(v){
        v = v > this.#min ? v : this.#min;
        v = v < this.#max ? v : this.#max;
        this.#value = v;
        this.#change_mask();
    }
    get max(){
        return this.#max;
    }
    set max(v){
        let new_max = v < this.#min ? this.#min + 1: v;
        let scale = (new_max - this.#min) / (this.#max - this.#min);
        this.#value = this.#min + scale * (this.#value - this.#min);
        this.#max = new_max;
    }
    get min(){
        return this.#min;
    }
    set min(v){
        let new_min = v > this.#max ? this.#max - 1: v;
        let scale = (this.#max - new_min) / (this.#max - this.#min);
        this.#value = new_min + scale * (this.#value - this.#min);
        this.#min = new_min;
    }
    get width(){
        return this.back.width;
    }
    set width(v){
        this.back.width = v;
        this.#change_mask();
    }
    get height(){
        return this.back.height;
    }
    set height(v){
        this.back.height = v;
    }
    destroy(opt={children: true, texture: true, baseTexture: false}){
        this.bar.destroy(opt);
    }
}

// pre-built shader
function _CLAMP(v, min, max){
    v = v < min ? min : v;
    v = v > max ? max : v;
    return v;
}

class lightShader{
    static #vertex = null;
    static #fragment = `
        precision mediump float;

        uniform float xradius;
        uniform float yradius;
        uniform float brightness;

        uniform sampler2D uSampler;
        varying vec2 vTextureCoord;

        void main(){
            vec2 uv = vTextureCoord.xy;
            vec4 color = vec4(0.0);
            for(int i=1; i <= 8; i++){
                color += texture2D(uSampler, uv + vec2(0, yradius)*float(i));
                color += texture2D(uSampler, uv + vec2(0, -yradius)*float(i));
                color += texture2D(uSampler, uv + vec2(xradius, 0)*float(i));
                color += texture2D(uSampler, uv + vec2(-xradius, 0)*float(i));
                color += texture2D(uSampler, uv + vec2(xradius, yradius)*float(i));
                color += texture2D(uSampler, uv + vec2(-xradius, yradius)*float(i));
                color += texture2D(uSampler, uv + vec2(xradius, -yradius)*float(i));
                color += texture2D(uSampler, uv + vec2(-xradius, -yradius)*float(i));
            }
            gl_FragColor = (color / 64.0) * brightness + texture2D(uSampler, uv);
        }
    `;
    /**
     * 泛光效果shader
     * @param {BTexture} texture 
     * @param {Number} brightness float [0, 1.0] 
     * @param {Number} radius float [0, 1.0]
     * @returns PIXI.Filter
     */
    static get_filter(texture, brightness=0.5, xradius=0.001, yradius=0.001){
        brightness = _CLAMP(brightness, 0, 1.0);
        xradius = _CLAMP(xradius, 0, 1.0);
        yradius = _CLAMP(yradius, 0, 1.0);
        let uniforms = {
            xradius: xradius,
            yradius: yradius,
            brightness: brightness,
            uSampler: texture
        };
        return new PIXI.Filter(lightShader.#vertex, lightShader.#fragment, uniforms);
    }
}

class gradientShader{
    static #vertex = null;
    static #fragment = `
        precision mediump float;

        uniform vec2 offset;
        uniform vec2 lim;
        uniform vec3 color;
        varying vec2 vTextureCoord;

        void main()
        {
            float alpha = clamp(lim.x * 
                ((-vTextureCoord.x + 1.0 - offset.x) * (vTextureCoord.x - 1.0 + offset.x) + 1.0),
            0.0, 1.0);
            alpha += clamp(lim.y * 
                (4.0 * (-vTextureCoord.y + 0.5 - offset.y) * (vTextureCoord.y - 0.5 + offset.y) + 1.0),
            0.0, 1.0);

            gl_FragColor = vec4(color, alpha);
        }
    `;
    /**
     * 梯度渐变shader，
     * 左到右方向渐变alpha [0, xlim]（二次函数），下到上方向alpha [0, ylim], [ylim, 0]（二次函数）
     * @param {Number} r    [0, 1.0]
     * @param {Number} g    [0, 1.0]
     * @param {Number} b    [0, 1.0]
     * @param {Number} xlim x方向极值 [0, 1.0]
     * @param {Number} ylim y方向极值 [0, 1.0]
     * @param {Number} xoffset x方向二次函数平移 [-1.0, 2.0]
     * @param {Number} yoffset y方向二次函数平移 [-1.0, 1.0]
     */
    static get_filter(r, g, b, xlim=0.6, ylim=0.4, xoffset=0, yoffset=0){
        r = _CLAMP(r, 0, 1.0);
        g = _CLAMP(g, 0, 1.0);
        b = _CLAMP(b, 0, 1.0);
        xlim = _CLAMP(xlim, 0, 1.0);
        ylim = _CLAMP(ylim, 0, 1.0);
        xoffset = _CLAMP(xoffset, -1.0, 2.0);
        yoffset = _CLAMP(yoffset, -1.0, 1.0);
        let uniforms = {
            offset: [xoffset, yoffset],
            lim: [xlim, ylim],
            color: [r, g, b],
        }
        return new PIXI.Filter(gradientShader.#vertex, gradientShader.#fragment, uniforms);
    }
}