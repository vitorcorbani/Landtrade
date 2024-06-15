class Player {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.vel = {x: 0, y: 0};
        this.image = document.getElementById('playerImg');
        this.w = document.getElementById('playerImg').width;
        this.h = document.getElementById('playerImg').height / 2;
        this.lives = 200;
        this.armor = 1;
        this.frameY = 0;
        this.inventory = [];
        this.invMax = 40+1;
        this.invSelected = 0;
        this.tradeSelected = 1;
        this.coins = 0;
        this.viewInventory = true;
        this.placeBlock = false;
        this.use = false;
        this.trade = false;
        this.scale = 1;
        this.damage = 1;
        this.break = 1;

        this.keys = [];
        //computer
        window.addEventListener("keydown", e => {
            this.keys[e.which] = true;
            // if (e.key === 'f' && this.inventory.length > 0) this.placeBlock = !this.placeBlock;
            if (e.key === 'e') {
                this.viewInventory = !this.viewInventory;
            }
            if (e.key === 'q') {
                if (this.invSelected < this.inventory.length-1) this.invSelected++;
                else this.invSelected = 0;
            }
            if (Number(e.key) > 0) {
                this.tradeSelected = Number(e.key);
            }
            if (this.keys[81] && (Number(e.key) > 0 || e.key === '0')) {
                if (Number(e.key) < this.inventory.length) this.invSelected = Number(e.key);
            }
            if (e.key === 'c') { //67
                this.use = true;
            }
            if (e.key === 't') { //67
                this.inventory.splice(this.invSelected, 1);
            }
            // if (e.key === 'p') { 

            //     this.game.entities.push(new Enemy(this.game, this.x, this.y - 100, 'enemyImg1')); 
            // }
            if (e.key === 'p') { 
                let toPush = this.inventory[this.invSelected];
                this.inventory.splice(this.invSelected, 1);
                this.inventory.push(toPush);
            }
        });
        window.addEventListener("keyup", e => {
            this.keys[e.which] = false;
            switch (e.which) {
                case 65:
                    this.vel.x = 0;
                    break;
                case 68:
                    this.vel.x = 0;
                    break;
                case 67:
                    this.use = false;
                    break;
            }
        });
        //mobile
        this.touchY;
        this.touchX;
        //keys index -> 65 left , 68 right , 87 up
        window.addEventListener('click', e => {
            // this.touchY = e.changedTouches[0].pageY;
            // this.touchX = e.changedTouches[0].pageX;
        });
        window.addEventListener('touchmove', e => {
            // const minimumDist = 50;
            // const DISTY = e.changedTouches[0].pageY - this.touchY;
            // if (DISTY < -minimumDist && !this.keys[87]) this.keys[87] = true;
            // const DISTX = e.changedTouches[0].pageX - this.touchX;
            // if (DISTX < -minimumDist && !this.keys[65]) this.keys[65] = true;
            // if (DISTX > minimumDist && !this.keys[68]) this.keys[68] = true;
        });
        window.addEventListener('touchend', e => {
            // const minimumDist = 50;
            // const DISTY = e.changedTouches[0].pageY - this.touchY;
            // if (DISTY < -minimumDist && !this.keys[87]) this.keys[87] = false;
            // const DISTX = e.changedTouches[0].pageX - this.touchX;
            // if (DISTX < -minimumDist && !this.keys[65]) this.keys[65] = false;
            // if (DISTX > minimumDist && !this.keys[68]) this.keys[68] = false;
            // this.keys[67] = false;
            // this.keys[86] = false;
        });
        document.getElementById('trashButton').addEventListener('touchend', () => {
            this.inventory.splice(this.invSelected, 1);
        });
        document.getElementById('jumpButton').addEventListener('click', () => {
            this.keys[87] = true;
        });
        document.getElementById('jumpButton').addEventListener('touchend', () => {
            this.keys[87] = false;
        });
        
        document.getElementById('rigthButton').addEventListener('click', () => {
            this.keys[68] = true;
        });
        document.getElementById('rigthButton').addEventListener('touchend', () => {
            this.keys[68] = false;
            this.keys[65] = false;
            this.vel.x = 0;
        });

        document.getElementById('leftButton').addEventListener('click', () => {
            this.keys[65] = true;
        });
        document.getElementById('leftButton').addEventListener('touchend', () => {
            this.keys[68] = false;
            this.keys[65] = false;
            this.vel.x = 0;
        });

        document.getElementById('useButton').addEventListener('click', () => {
            this.use = true;
        });
        document.getElementById('changeButton').addEventListener('click', () => {
            if (this.invSelected < this.inventory.length-1) this.invSelected++;
            else this.invSelected = 0;
        });
        document.getElementById('uiButton').addEventListener('click', () => {
            if (this.tradeSelected < game.productsInfo.length) this.tradeSelected++;
            else this.tradeSelected = 1;
        });
    }
    draw(ctx, canvas) {
        ctx.save();
        if (this.vel.y === 0 && this.vel.x !== 0 && this.game.spriteUpdate);
        let SCALEw = (this.scale < 0 ? this.w : 0);
        ctx.translate(this.x+SCALEw, this.y);
        ctx.scale(this.scale, 1);
        let INV = this.inventory[this.invSelected];
        if (INV instanceof Item) {
            INV.draw(ctx, this.w-8, this.h/2);
            if (this.use) {
                if (INV.heal && Number(INV.heal) > 0) {
                    if (this.lives + Number(INV.heal) <= 200) {
                        this.lives += Number(INV.heal);
                    }
                    else {
                        this.lives = 200;
                    }
                    this.inventory.splice(this.invSelected, 1);
                    this.use = false;
                }
            }
        }
        ctx.fillStyle = 'white';
        //ctx.fillRect(0, 0, this.w, this.h);
        ctx.drawImage(this.image, 0, this.frameY * this.h, this.w, this.h, 0, 0, this.w, this.h);
        let stopLoop = false;
        this.inventory.forEach(item => {
            if (item instanceof Item && !stopLoop) {
                if (item.protection > 0) {
                    const w = document.getElementById('playerImg').width;
                    const h = document.getElementById('playerImg').height / 2;
                    item.draw(ctx, 0, 0, w, h);
                    stopLoop = true;
                }
            }
        });
        ctx.restore();
        ctx.save();
        ctx.translate(this.x, this.y);
        for (let i = 200/10; i >= 0; i--) {
            if (i*10 <= this.lives) ctx.fillStyle = 'red'; else ctx.fillStyle = 'rgb(0, 0, 0, 0.7)';
            ctx.fillRect(-(Math.floor(200/10)*3)+i*6 + 2, -25, 4, 4);
        }
        ctx.restore();

        if (this.viewInventory) {
            ctx.save();
            ctx.translate(-this.game.translateX, -this.game.translateY);
            ctx.fillStyle = 'gray';
            let invX = 5;
            let invY = 90-this.invSelected*15;
            let invH = 15*this.invMax + 5;
            let scale = 1.5*canvas.height/this.game.height;
            ctx.scale(scale, scale);
            ctx.fillRect(invX, invY, 85, invH);
            let rows = invH / 10;
            let inventory = [];
            for (let i = 0; i < rows; i++) {
                inventory.push([])
            }
            for (let i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i] instanceof Item) inventory[i].push(this.inventory[i].name);
                else inventory[i].push(this.inventory[i]);
            }
            ctx.font = '14px Trebuchet MS';
            ctx.fillStyle = 'white';
            for (let i = 0; i < this.inventory.length; i++) {
                ctx.fillText(i + '- ' + inventory[i], invX+4, invY+15*i + 10);
                if (i === this.invSelected) {
                    ctx.lineWidth = 2;
                    ctx.save();
                    ctx.strokeStyle = 'rgb(255, 0, 0)';
                    ctx.strokeRect(invX-1, invY+15*i-1.5, 70, 14);
                    ctx.restore();
                }
            }   
            ctx.restore();
        }
    }
    update() {
        this.x += this.vel.x;
        if (this.inventory.length <= 0) this.placeBlock = false; else this.placeBlock = true;
        if (this.invSelected >= this.inventory.length) {
            if (this.invSelected !== 0) this.invSelected --;
        }
        if (this.lives <= 0) {
            this.lives = 200;
            localStorage.setItem('playerPosition', String([0, 0]));
            localStorage.setItem('playerInventory', []);
            this.game.reset(this.game);
        }
        if (this.y > this.game.height*5) {
            this.lives = 0;
        }
        let hand = this.inventory[this.invSelected];
        if (hand instanceof Item) {
            this.damage = hand.damage;
            this.break = hand.break;
            this.image = document.getElementById('playerHandImg');
            this.w = document.getElementById('playerHandImg').width;
            this.h = document.getElementById('playerHandImg').height;
        } else {
            this.damage = 1;
            this.break = 1;
            this.image = document.getElementById('playerImg');
            this.w = document.getElementById('playerImg').width;
            this.h = document.getElementById('playerImg').height / 2;
        }
        this.armor = 1;
        let stopLoop = false;
        this.inventory.forEach(item => {
            if (item instanceof Item && Number(item.protection) > 0 && !stopLoop) {
                this.armor += Number(item.protection);
                stopLoop = true;
                return 0;
            }
        });

        const VX = 4;
        if (this.keys[87]) this.checkJump(); 
        if (this.keys[86]) { //fly
            // this.vel.y += this.vel.y > -3 ? -1 : 0;
            // this.vel.x = (this.keys[68] ? VX*3 : 0) + (this.keys[65] ? -VX*3 : 0);
        } else {
            if (this.keys[65]) {
                this.vel.x = -VX;
                this.scale = -1; 
                this.frameY = 0;
            }
            if (this.keys[68]) {
                this.vel.x = VX;
                this.scale = 1; 
                this.frameY = 0;
            } 
        }

        this.inWater = false;
        this.blockHorizontalCollision(this.game.blocks);
        this.applyGravity();
        this.blockVerticalCollision(this.game.blocks);
        this.game.hells.forEach((hell, index) => {
            if (collide(this, {x: hell.x, y: hell.y, w: this.game.tileSize, h: this.game.tileSize})) {
                this.game.generateHellChunks(this.game);
                this.game.blocks.forEach((block, indexBlock) => {
                    if (block.x == hell.x && block.y == hell.y) {
                        this.game.blocks.splice(indexBlock, 1);
                        this.game.saveBlocks.push({x: block.x, y: block.y, name: false});
                    }
                });
                this.game.hells.splice(index, 1);
            }
        });
        this.game.portals.forEach((p, index) => {
            if (collide(this, {x: p.x, y: p.y, w: this.game.tileSize, h: this.game.tileSize})) {
                let i = index;
                if (this.game.portals.length > 1) {
                    if (index > 0 && index < this.game.portals.length-1) i = index + (Math.random() > 0.5 ? 1 : -1)
                    else if (index > 0) i = index - 1;
                    else i = index + 1; 
                }
                let tpTo = this.game.portals[i];
                this.x = tpTo.x+this.game.tileSize/2-this.w/2;
                this.y = tpTo.y - this.game.tileSize*2;
                this.vel.y = -4;
            }
        });
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
                    if (block.onScreen && block.name !== 'portal' && block.name !== 'hell' && block.type !== 'air') {
                        if (block.type !== 'liquid') {
                            if (this.vel.y > 0 && this.y <= block.y) {
                                if (this.vel.y > 9) this.lives -= this.vel.y**2/2 / this.armor;
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
                            if (this.vel.y > -1 && this.keys[87]) this.vel.y -= this.game.gravity*1.5;
                            else if (this.vel.y > 0.5) this.vel.y = 0.5;
                            if (block.name === 'lava') this.lives --;
                        }
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
                    if (block.onScreen && block.name !== 'portal' && block.name !== 'hell' && block.type !== 'air') {
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
    checkJump () {
        if (this.vel.y === 0 && !this.inWater) this.vel.y = -5;
    }
}
