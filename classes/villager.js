class Villager {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.spawn = {x: x, y: y};
        this.vel = {x: 0, y: 0};
        this.image = document.getElementById('villagerImg');
        this.w = this.image.width;
        this.h = this.image.height;
        this.lives = 4;
        this.scale = 1;
        this.drawUi = false;
    }
    draw(ctx) {
        ctx.save();
        let SCALEw = (this.scale < 0 ? this.w : 0);
        ctx.translate(this.x+SCALEw, this.y);
        ctx.scale(this.scale, 1);
        ctx.fillStyle = 'orange';
        ctx.drawImage(this.image, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
        //ctx.fillRect(0, 0, this.w, this.h);
        for (let i = this.lives; i > 0; i--) {
            ctx.fillStyle = 'red';
            ctx.fillRect(-this.lives*3+i*6+2, -25, 4, 4);
        }
        
        if (this.drawUi) {
            ctx.save();
            let uiX = -this.w*2;
            let uiY = -200;
            ctx.fillStyle = 'gray';
            ctx.fillRect(uiX, uiY, this.w*8, 120);
            ctx.restore();

            ctx.save();
            ctx.font = '10px Trebuchet MS';
            let trades = [];
            this.game.productsInfo.forEach((item, index) => {
                trades.push((index+1) + ' - ' + item.name + ' - ' + item.price + ' coins');
            });
            for (let i = 1; i <= trades.length; i++) {
                ctx.fillStyle = 'orange';
                ctx.fillText(trades[i-1], uiX+3, uiY+11*i);
                if (i === this.game.player.tradeSelected) {
                    ctx.strokeStyle = 'red';
                    ctx.strokeRect(uiX+1, uiY+11*(i-1)+3, this.w*8 - 5, 120/11);
                }
            }
            ctx.restore();
        }
        ctx.restore();
    }
    update(player) {
        this.x += this.vel.x;
        this.collidePlayer(player);
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
                if (block !== '' && collide(this, block) && block.type !== 'air') {
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
                if (block !== '' && collide(this, block)) {
                    if (block.type !== 'liquid' && block.type !== 'air') {
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
    collidePlayer (player) {
        if (collide(this, player)) {
            this.vel.x = 0;
            this.drawUi = true;
            if (player.use) player.trade = true;
            if (player.trade) {
                function value (item, game) {
                    for (let i = 0; i < game.tilesInfo.length; i++) {
                        if (game.tilesInfo[i].name === item) {
                            return game.tilesInfo[i].value;
                        }
                    }
                    for (let i = 0; i < game.itensInfo.length; i++) {
                        if (game.itensInfo[i].name === item) {
                            return game.itensInfo[i].value;
                        }
                    }
                }
                let item = player.inventory[player.invSelected];
                if (typeof item === 'string') {
                    if (value(item, this.game) > 0) {
                        player.inventory.splice(player.invSelected, 1);
                        for (let i = 0; i < value(item, this.game); i++) {
                            if (player.inventory.length < player.invMax) {
                                player.inventory.push(new Item(this.game, 'coin'));
                            }
                        }
                    } 
                } else if (item instanceof Item) {
                    if (item.name === 'coin') {
                        let money = player.inventory.filter(i => i.name === 'coin').length;
                        let product = this.game.productsInfo[player.tradeSelected-1];
                        let toBuy = 'not a item';
                        for (let i = 0; i < this.game.itensInfo.length; i++) { //check if is it a item, if it's make it a item
                            if (this.game.itensInfo[i].name === product.name) {
                                toBuy = new Item(this.game, this.game.itensInfo[i].name);
                                break;
                            }
                        }
                        if (toBuy === 'not a item') { //it's not a item, so make it a tile
                            for (let i = 0; i < this.game.tilesInfo.length; i++) { 
                                if (this.game.tilesInfo[i].name === product.name) {
                                    toBuy = this.game.tilesInfo[i].name;
                                    break;
                                }
                            }
                        }
                        if (money >= product.price) {
                            player.inventory = player.inventory.filter(i => i.name !== 'coin');
                            player.inventory.push(toBuy);
                        }
                    }
                }
                player.use = false;
                player.trade = false;
            }
        } else { //move
            if (this.game.spriteUpdate && Math.random() > 0.75) {
                this.vel.x = (Math.random() > 0.5 ? 1 : -1)*1;
                if (this.y-1 > this.spawn.y) this.checkJump();
            }
            this.drawUi = false;
        }
    }
    checkJump () {
        if (this.vel.y === 0 && !this.inWater) this.vel.y = -5;
    }
}
