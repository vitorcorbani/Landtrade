class Pig {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vel = {x: 0, y: 0};
        this.image = document.getElementById('pigImg');
        this.w = this.image.width;
        this.h = this.image.height;
        this.lives = 4;
        this.scale = 1;
        this.dropChance = 0.8;
        this.drop = new Item(game, 'beef');
    }
    draw (ctx) {
        ctx.save();
        let SCALEw = (this.scale < 0 ? this.w : 0);
        ctx.translate(this.x+SCALEw, this.y);
        ctx.scale(this.scale, 1);
        ctx.drawImage(this.image, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
        for (let i = this.lives; i > 0; i--) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.w/2-this.lives*3+i*6, -25, 4, 4);
        }
        ctx.restore();
    }
    update () {
        this.x += this.vel.x;
        if (this.game.spriteUpdate && Math.random() > 0.95) {
            this.vel.x = (Math.random() > 0.5 ? 1 : -1)*1;
        }
        this.blockHorizontalCollision(this.game.blocks);
        this.applyGravity();
        this.blockVerticalCollision(this.game.blocks);
        if (this.vel.x >= 0) this.scale = 1; else this.scale = -1;
    }
    applyGravity () {
        this.vel.y += this.game.gravity;
        this.y += this.vel.y;
    }
    blockVerticalCollision (blocks) {
        for (let x = 0; x <= blocks.length-1; x++) {
            for (let y = 0; y <= blocks[x].length-1; y++) {
                let block = blocks[x][y];
                if (block !== '' && collide(this, block)) {
                    if (block.type !== 'liquid') {
                        if (this.vel.y > 0 && this.y <= block.y) {
                            this.vel.y = 0;
                            this.y = block.y - this.h - 0.01;
                            return 0;
                        }
                        if (this.vel.y < 0 && this.y + this.h >= block.y + block.h) {
                            this.vel.y = 0.01;
                            this.y = block.y + block.h + 0.01;
                            return 0;
                        }
                    } else {
                        this.inWater = true;
                        if (this.vel.y > 0.5) this.vel.y = 0.5;
                        if (block.name === 'lava') this.lives --;
                    }
                }
            }
        }
    }
    blockHorizontalCollision (blocks) {
        for (let x = 0; x <= blocks.length-1; x++) {
            for (let y = 0; y <= blocks[x].length-1; y++) {
                let block = blocks[x][y];
                if (block !== '' && collide(this, block)) {
                    if (block.type !== 'liquid') {
                        if (this.vel.x > 0 && this.x <= block.x) {
                            this.vel.x = 0;
                            this.x = block.x - this.w - 0.01;
                            return 0;
                        }
                        if (this.vel.x < 0 && this.x + this.w >= block.x + block.w) {
                            this.vel.x = 0;
                            this.x = block.x + block.w + 0.01;
                            return 0;
                        }
                    } else {
                        this.inWater = true;
                        if (block.name === 'lava') this.lives --;
                    }
                }
            }  
        }
    }
}
