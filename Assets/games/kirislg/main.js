
class GlobalHandler extends GameObject{
    constructor(){
        super();
        this.timer = 0;
        this.grid = new PIXI.Container();
        let w = app.screen.width;
        let h = app.screen.height;
        this.grid.x = w / 2;
        this.grid.y = h / 2;
        this.hit = new PIXI.Graphics();
        this.hit.beginFill(0x00000, 0.01);
        this.hit.drawRect(-w/2, -h/2, w, h);
        this.tap = false;
        this.grid.interactive = true;
        this.grid.on("click", ()=>{
            if(!this.tap){
                this.tap = true;
                lazy.play();
            }
        });
        this.grid.addChild(this.hit);
    }
    update(delta){
        this.timer += delta;
        if(this.timer >= 3980){
            this.timer = 0;
            bplayer.jump(0.0).then(()=>{
                this.timer = 0;
            })
        }
    }
    destroy(){
        super._destroy();
    }
}

let handler = null;
let opts = null;
let faceController = null;
addInitFunc((resolve, reject)=>{
    let promise = Promise.all([
        buttons.then((sheet)=>{
            opts = new Buttons(sheet);
            app.stage.addChild(opts.grid);
        }),
        faces.then((faces)=>{
            words.then((words)=>{
                faceController = new Faces(faces, words);
                app.stage.addChild(faceController.grid);
                app.stage.addChild(speak.grid);
            });
        }),
        bplayer.pause(),
        bplayer.jump(0.0).then(bplayer.play)
    ]);
    promise.then(()=>{
        handler = new GlobalHandler();
        app.stage.addChildAt(handler.grid, 0);
        resolve(null);
    })
});