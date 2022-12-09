const UIJSON = {
    frames:{
        save:{
            frame: {x: 0, y: 0, w: 64, h: 64},
            sourceSize: {w:64, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 64, h: 64}
        },
        load:{
            frame: {x: 64, y: 0, w: 64, h: 64},
            sourceSize: {w:64, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 64, h: 64}
        },
        exit:{
            frame: {x: 128, y: 0, w: 64, h: 64},
            sourceSize: {w:64, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 64, h: 64}
        },
        ctrl:{
            frame: {x: 192, y: 0, w: 64, h: 64},
            sourceSize: {w:64, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 64, h: 64}
        },
        config:{
            frame: {x: 0, y: 64, w: 64, h: 64},
            sourceSize: {w:64, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 64, h: 64}
        },
        auto:{
            frame: {x: 64, y: 64, w: 64, h: 64},
            sourceSize: {w:64, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 64, h: 64}
        },
    },
    meta:{
        image: './img/UISheet.png',
        format: 'RGBA8888',
        size:{w: 256, h:128},
        scale: 1
    }
}

const UIJSON2 = {
    frames:{
        border:{
            frame: {x:0, y:0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        button1:{
            frame: {x:257, y:0, w: 128, h: 64},
            sourceSize: {w:128, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 128, h: 64}
        },
        button2:{
            frame: {x:384, y:0, w: 128, h: 64},
            sourceSize: {w:128, h:64},
            spriteSourceSize:{x: 0, y: 0, w: 128, h: 64}
        }
    },
    meta:{
        image: './img/UIsheet2.png',
        format: 'RGBA8888',
        size:{w: 512, h: 512},
        scale: 1
    }
}
const UISheet = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(UIJSON.meta.image),
    UIJSON
)
const sheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(UIJSON.meta.image), UIJSON).parse()
const sheet2 = new PIXI.Spritesheet(PIXI.BaseTexture.from(UIJSON2.meta.image), UIJSON2).parse();
const letter = PIXI.Texture.from("./img/saving.png");
const script = fetch("./text/script.json").then((res)=>res.json());
const savings = fetch("./save/savings.json").then((res)=>res.json());

function clearAll(){
    sheet.destroy(true);
    sheet2.destroy(true);
    letter.destroy(true);
}

//se
function SEinit(url, volume=0.1){
    let se = new Audio("./audio/se/" + url);
    se.volume = volume;
    return se;
}
const select = SEinit("select.wav");
const select2 = SEinit("select2.wav");
const xconfirm = SEinit("confirm.wav");
const cancel = SEinit("cancel.wav");
const xswitch = SEinit("switch.wav", 0.2);
const button_click = SEinit("button_click.mp3");

// bgm
function BGMInit(url){
    let bgm = new Audio("./audio/bgm/" + url);
    bgm.loop = true;
    bgm.volume = 0.5;
    return bgm;
}
const lucky = BGMInit("lucky.mp3");
const sunset_mati = BGMInit("sunset_mati.mp3");
const normal = BGMInit("normal.mp3");
const mori = BGMInit("mori.mp3");
const grey = BGMInit("grey.mp3");
const ease = BGMInit("ease.mp3");
const ease2 = BGMInit("ease2.mp3");
const ease3 = BGMInit("ease3.mp3");

const app = new PIXI.Application({
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
    backgroundAlpha: 0,
    resolution: 2,
    antialias: true,
})

addOnloadFunc(()=>{
    document.body.style.cursor = "url(./img/cursor.ico),auto";
    document.body.appendChild(app.view);
});