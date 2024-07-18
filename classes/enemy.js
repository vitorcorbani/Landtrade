class Enemy {
    constructor(game, x, y, idImg) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vel = {x: 0, y: 0};
        this.image = document.getElementById(idImg);
        this.w = this.image.width;
        this.h = this.image.height;
        this.scale = 1;
        this.lives = 6;
        this.damage = 1;
        this.frameY = 0;
        this.dropChance = 0.1;
        this.drop = 'hell';
    }
    draw(ctx) {
        ctx.save();
        let SCALEw = (this.scale < 0 ? this.w : 0);
        ctx.translate(this.x+SCALEw, this.y);
        ctx.scale(this.scale, 1);
        ctx.drawImage(this.image, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
        //ctx.fillRect(0, 0, this.w, this.h);
        for (let i = this.lives; i > 0; i--) {
            ctx.fillStyle = 'red';
            ctx.fillRect(-this.lives*3+i*6+2, -25, 4, 4);
        }
        ctx.restore();
    }
    update(player) {
        this.x += this.vel.x;
        const VX = 1;
        if (this.y >= player.y + player.h) this.checkJump(); 
        if (this.x+this.w/2 <= player.x+player.w/2) {
            this.scale = 1;
            this.vel.x = VX;
            this.frameY = 1;
        }
        else {
            this.scale = -1;
            this.vel.x = -VX;
            this.frameY = 2;
        }

        this.blockHorizontalCollision(this.game.blocks);
        this.applyGravity();
        this.blockVerticalCollision(this.game.blocks);
        this.playerCollision(player);
    }
    applyGravity () {
        this.vel.y += this.game.gravity;
        this.y += this.vel.y;
    }
    blockVerticalCollision (blocks) {
        for (let x = 0; x <= blocks.length-1; x++) {
            for (let y = 0; y <= blocks[x].length-1; y++) {
                let block = blocks[x][y];
                if (block instanceof Tile && collide(this, block) && block.type !== 'air') {
                    if (block.type !== 'liquid') {
                        if (this.vel.y > 0 && this.y <= block.y) {
                            if (this.vel.y > 9) this.lives -= this.vel.y**2/20;
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
                if (block instanceof Tile && collide(this, block) && block.type !== 'air') {
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
    playerCollision (player) {
        if (collide(this, player)) {
            player.lives -= this.damage/player.armor;
        }
    }
    checkJump () {
        if (this.vel.y === 0 && Math.random()*6 < 0.15 && !this.inWater) this.vel.y = -5;
    }
}
