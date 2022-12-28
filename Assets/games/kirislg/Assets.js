const buttons_json = {
    frames:{
        eat:{
            frame: {x: 0, y: 0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        store:{
            frame: {x: 256, y: 0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        play:{
            frame: {x:256, y:256, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        work:{
            frame: {x:0, y: 256, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
    },
    meta:{
        image: './img/buttons.png',
        format: 'RGBA8888',
        size:{w: 512, h:512},
        scale: 1
    }
}

const faces_json = {
    frames:{
        mu:{
            frame: {x: 0, y: 0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        normal:{
            frame: {x: 256, y: 0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        angry:{
            frame: {x: 512, y: 0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        he:{
            frame: {x: 768, y: 0, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        siro:{
            frame: {x: 0, y: 256, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        },
        eihe:{
            frame: {x: 256, y: 256, w: 256, h: 256},
            sourceSize: {w:256, h:256},
            spriteSourceSize:{x: 0, y: 0, w: 256, h: 256}
        }
    },
    meta:{
        image: './img/faces.png',
        format: 'RGBA8888',
        size:{w: 1024, h:512},
        scale: 1
    }
}

const buttons = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(buttons_json.meta.image),
    buttons_json
).parse();

const faces = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(faces_json.meta.image),
    faces_json
).parse();

// bgm init
function BGMInit(url){
    let bgm = new Audio("./audio/bgm/" + url);
    bgm.loop = true;
    bgm.volume = 0.4;
    return bgm;
}
const lazy = BGMInit("lazy.mp3");
const store = BGMInit("store.mp3");

// se init
function SEinit(url, volume=0.2){
    let se = new Audio("./audio/se/" + url);
    se.volume = volume;
    return se;
}
const click = SEinit("click.wav", 1.0);
const xconfirm = SEinit("confirm.mp3");

// voice init
function VOICEInit(url, volume=0.8){
    let voice = new Audio("./audio/voice/" + url);
    voice.volume = volume;
    return voice;
}
const angry1 = VOICEInit("angry1.mp3");
const angry2 = VOICEInit("angry2.mp3");
const angry3 = VOICEInit("angry3.mp3");
const doya = VOICEInit("doya.mp3");
const hai = VOICEInit("hai.mp3");
const naruhodo = VOICEInit("naruhodo.mp3");
const sigoto = VOICEInit("sigoto.mp3");
const words = fetch("./speak.json").then((res)=>res.json());

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