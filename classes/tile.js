class Tile {
    constructor (game, x, y, name) {
        this.game = game;
        this.x = x*game.tileSize; 
        this.y = y*game.tileSize; 
        this.name = name;
        this.w = game.tileSize; 
        this.h = game.tileSize; 
        for (let i = 0; i < game.tilesInfo.length; i++) {
            let info = game.tilesInfo[i];
            if (info.name === name) {
                this.color = info.color;
                this.type = info.type;
                this.durability = info.durability;
                break;
            }
        }   

        this.visible = false;
        this.remove = false;
    }
    draw (ctx) {
        let x = this.x - 0.5
        let y = this.y - 0.5;
        let w = this.w + 1.5;
        let h = this.h + 1.5;
        if (this.visible) {
            ctx.save();
            ctx.fillStyle = this.color; 
            ctx.fillRect(x, y, w, h);
            ctx.restore();
        } else if (Math.abs(dist(this.x, this.y, this.game.player.x, this.game.player.y)) < 150){
            let alpha = dist(this.x, this.y, this.game.player.x, this.game.player.y);
            alpha = map(Math.abs(alpha), 0, 150, 0, 1);

            ctx.save();
            ctx.fillStyle = 'black'; 
            ctx.fillRect(x, y, w, h);
            ctx.restore();
            ctx.save();
            ctx.fillStyle = this.color; 
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 1-alpha;
            ctx.fillRect(x, y, w, h);
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = 'black'; 
            ctx.strokeStyle = 'black';
            ctx.fillRect(x, y, w, h);
            ctx.restore();
        }
    }
    update (myX, myY, blocks) {
        if (!(this.type == 'visible' || this.type == 'liquid')) {
            function checkExistance(X, Y) {
                if (X >= 0 && Y >= 0 && X < blocks.length && Y < blocks[0].length) return blocks[X][Y];
                else return false;
            }
            function isAir (block) {
                if (block !== false) {
                    return ((block == '' || block.type === 'liquid') ? true : false);
                } else return false;
            }
            let toCheck = [
                isAir(checkExistance(myX, myY-1)),
                isAir(checkExistance(myX, myY+1)),
                isAir(checkExistance(myX-1, myY)),
                isAir(checkExistance(myX+1, myY))
            ]
            if (!(toCheck.every(e => e === false))) this.visible = true; else this.visible = false;
        } else {
            this.visible = true;
        }

        if (this.remove) {
            return false;
        }
        else return true;
    }
    checkHit (mousePos, player, x, y) {
        function checkMouseCollide(mouse, other) {
            if (mouse.x > other.x && mouse.x < other.x + other.w && mouse.y > other.y && mouse.y < other.y + other.h) return true; else return false;
        };
        if (checkMouseCollide(mousePos, this)) {
            this.game.particles.forEach(p => p.start({x: this.x, y: this.y}, this.color, 10/this.durability));
            this.durability -= player.break;
            if (this.durability <= 0) {
                if (player.inventory.length < player.invMax) player.inventory.push(this.name);
                this.remove = true;
            }
        }
    }
}