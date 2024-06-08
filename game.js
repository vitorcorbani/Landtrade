function getGame(canvas, ctx) {
    return {
        start: false,
        height: 597,
        width: 1242,
        scaled: 0,
        gravity: 0.2,
        tileSize: 26,
        chunckSize: 16,
        timer: 0,
        spriteUpdate: false,
        spriteTimer: 0,
        spriteInterval: 350,
        world: 'overworld',

        define: function (game) {
            this.timer = 0;
            this.spriteUpdate = false;
            this.spriteTimer = 0;
            this.setupGradient = [
                225, 223, 208,
                105, 224, 248,
                32, 36, 102,
            ]
            this.gradientTime = 0;
            this.gradient = [
                (this.setupGradient[0]), (this.setupGradient[1]), (this.setupGradient[2]),
                (this.setupGradient[3]), (this.setupGradient[4]), (this.setupGradient[5]),
                (this.setupGradient[6]), (this.setupGradient[7]), (this.setupGradient[8])
            ]
            this.tilesInfo = [
                {name: 'dirt', color: 'rgb(90, 72, 22)', type: 'block', durability: '1', value: '0'},
                {name: 'grass', color: 'green', type: 'block', durability: '1', value: '0'},
                {name: 'wood', color: 'rgb(70, 52, 2)', type: 'block', durability: '2', value: '0'},
                {name: 'plank', color: 'rgb(183, 116, 3)', type: 'block', durability: '2', value: '0'},
                {name: 'leaf', color: 'DarkGreen', type: 'visible', durability: '1', value: '0'},
                {name: 'iron', color: 'white', type: 'block', durability: '4', value: '4'},
                {name: 'calcarium', color: 'rgb(25, 25, 25)', type: 'block', durability: '3', value: '1'},
                {name: 'stone', color: 'gray', type: 'block', durability: '3', value: '0'},
                {name: 'esmerald', color: 'rgb(10, 200, 30)', type: 'block', durability: '7', value: '8'},
                {name: 'water', color: 'blue', type: 'liquid', durability: '1', value: '0'},
                {name: 'lava', color: 'rgb(255, 120, 0)', type: 'liquid', durability: '1', value: '0'},
                {name: 'sand', color: 'yellow', type: 'block', durability: '1', value: '1'},
                {name: 'clay', color: 'rgb(180, 180, 235)', type: 'block', durability: '1', value: '1'},
                {name: 'glass', color: 'rgb(255, 255, 255, 0.35)', type: 'block', durability: '1', value: '0'},
                {name: 'portal', color: 'purple', type: 'block', durability: '10', value: '0'},
                {name: '?', color: 'rgb(255, 50, 0, 0.2)', type: 'block', durability: '1', value: '0'},

                {name: 'hell', color: 'red', type: 'block', durability: '10', value: '0'},
                {name: 'litter', color: 'rgb(80, 20, 10)', type: 'block', durability: '2', value: '0'},
                {name: 'flare', color: 'orange', type: 'air', durability: '1', value: '0'},

                {name: 'tree', color: 'rgb(70, 52, 2)', type: 'tree', durability: '1', value: '0'},
                {name: 'river', color: 'blue', type: 'river', durability: '1', value: '0'},
                {name: 'village', color: 'rgb(183, 116, 3)', type: 'village', durability: '1', value: '0'},
                {name: 'cave', color: 'black', type: 'cave', durability: '1', value: '0'},
            ];
            this.itensInfo = [
                {name: 'sword', img: 'swordImg', value: '16', damage: '2', break: '1', protection: '0', heal: '0'},
                {name: 'pickaxe', img: 'pickaxeImg', value: '9', damage: '1', break: '3', protection: '0', heal: '0'},
                {name: 'cuirass', img: 'cuirassImg', value: '20', damage: '1', break: '1', protection: '3', heal: '0'},
                {name: 'armor', img: 'armorImg', value: '33', damage: '1', break: '1', protection: '10', heal: '0'},
                {name: 'beef', img: 'beefImg', value: '6', damage: '1', break: '1', protection: '0', heal: '40'},
                {name: 'coin', img: 'coinImg', value: '1', damage: '1', break: '1', protection: '0', heal: '0'},
            ];
            this.productsInfo = [
                {name: 'sword', price: '16',},
                {name: 'pickaxe', price: '9'},
                {name: 'cuirass', price: '20'},
                {name: 'armor', price: '33'},
                {name: 'beef', price: '6'},
                {name: 'plank', price: '1'},
                {name: 'glass', price: '1'},
            ];

            this.particles = [];
            for (let i = 0; i < 15; i++) {
                this.particles.push(new Particle());
            }
            this.player = new Player(this);
            if (localStorage.getItem('playerInventory')) {
                let arrInfo = localStorage.getItem('playerInventory').split(',');
                for (let i = 0; i < arrInfo.length; i+=2) {
                    let item = arrInfo[i+1];
                    if (arrInfo[i] === 'object') item = new Item(this, arrInfo[i+1]);
                    this.player.inventory.push(item);
                }
            }
            this.entities = [];
            this.translateX = -this.player.x + canvas.width / 2;
            this.translateY = -this.player.y + canvas.height / 2;
            this.blocks = [];
            this.saveBlocks = [];
            if (localStorage.getItem('savedBlocks')) {
                let arrInfo = localStorage.getItem('savedBlocks').split(',');
                for (let i = 0; i < arrInfo.length; i+=3) {
                    let obj = {
                        x: Number(arrInfo[i]),
                        y: Number(arrInfo[i+1]),
                        name: ((arrInfo[i+2] !== 'false') ? arrInfo[i+2] : false)
                    }
                    this.saveBlocks.push(obj);
                }
            }
            this.PcreationX = this.player.x;
            this.generateChunks(this);
            this.portals = [];
            this.hells = [];
            setInterval(function() {if (game.start) game.autoSave(game)}, 10000);
        },
        autoSave: function (game) {
            let inventorySave = [];
            game.player.inventory.forEach(item => {
                if (item instanceof Item) {
                    inventorySave.push('object');
                    inventorySave.push(item.name);
                } else {
                    inventorySave.push('');
                    inventorySave.push(item);
                }
            });
            localStorage.setItem('playerInventory', inventorySave);
            let blocksInfoSave = [];
            game.saveBlocks.forEach(save => {
                blocksInfoSave.push(Number(save.x));
                blocksInfoSave.push(Number(save.y));
                blocksInfoSave.push(save.name);
            });
            localStorage.setItem('savedBlocks', blocksInfoSave);
        },
        generateChunks: function (game) {
            game.world = 'overworld';
            game.start = false;
            game.blocks = [];
            game.entities = [];
            for (let x = -Math.floor(game.width / 2 / game.chunckSize)*1.5; x <= Math.floor(game.width / 2 / game.chunckSize)*1.5; x++) {
                game.blocks.push([]);
            }
            for (let x = -Math.floor(game.width / 2 / game.chunckSize)*1.5; x <= Math.floor(game.width / 2 / game.chunckSize)*1.5; x++) {
                for (let y = 0; y <= game.chunckSize * 3; y++) {
                    let tileIndex = x + Math.floor(game.width / 2 / game.chunckSize)*1.5;
                    const H = PerlinNoise.noise(x + Math.floor(game.PcreationX / game.tileSize), 1, .2) * 6;
                    let name;
                    if (y * game.tileSize > game.height / 2 - 2 * Math.floor(H) * game.tileSize) {
                        const R = PerlinNoise.noise(x + Math.floor(game.PcreationX / game.tileSize), y, .23);
                        const R2 = PerlinNoise.noise(x + Math.floor(game.PcreationX / game.tileSize), y, .6);
                        const R3 = PerlinNoise.noise(y, x + Math.floor(game.PcreationX / game.tileSize), .3);
                        if (y * game.tileSize < game.height / 2 + 100) {
                            if (y * game.tileSize < (game.height / 2 - 2 * Math.floor(H) * game.tileSize) + game.tileSize - 1) {
                                if (R > 0.635) { 
                                    name = 'tree';
                                } else if (R < 0.4 && R2 < 0.3 && R3 < 0.4 && H < 2.5) {
                                    name = 'village';
                                } else if (R > 0.5 && R2 > 0.6 && R3 > 0.5 && H < 2.4) {
                                    name = 'river';
                                } else {
                                    name = 'grass';
                                }
                            } else {
                                name = 'dirt';
                            }
                        } else { //underground
                            if (R > 0.61 && H > 3 && R3 < 0.5) {
                                name = 'iron';
                            }
                            else if (R > 0.58) {
                                if (R2 > 0.7 && R3 < 0.35 && H >= 3) {
                                    name = 'cave';
                                }
                                else {
                                    name = 'stone';
                                }
                            } else if (R > 0.56) {
                                name = 'calcarium';
                            } else if (R > 0.39) {
                                name = 'stone';
                            } else {
                                if (y * game.tileSize > game.tileSize * game.chunckSize * 2 && R2 < 0.3 && R3 < 0.4) {
                                    name = 'esmerald';
                                } else {
                                    name = 'stone';
                                }
                            }
                        }
                        game.PcreationX = Number(game.player.x);
                        let tile = new Tile(game, x + Math.floor(game.PcreationX / game.tileSize), y, name);
                        game.blocks[tileIndex].push(tile);
                    } else {
                        game.blocks[tileIndex].push('');
                    }
                }
            }

            let blocks = game.blocks;
            for (let x = 0; x <= blocks.length - 1; x++) {
                for (let y = 0; y <= blocks[x].length - 1; y++) {
                    let block = blocks[x][y];

                    function toBlock(blocks, X, Y, name) {
                        if (blocks[X][Y] === '') {
                            X = (X - Math.floor(game.width / 2 / game.chunckSize)*1.5) + Math.floor(game.PcreationX / game.tileSize);
                            return (new Tile(game, X, Y, name));
                        } else {
                            return (new Tile(game, blocks[X][Y].x / game.tileSize, blocks[X][Y].y / game.tileSize, name));
                        }
                    }
                    function existe(X, Y) {
                        if (X >= 0 && Y >= 0 && X < blocks.length && Y < blocks[X].length) return true;
                        else return false;
                    }
                    let spawnEntitie = Math.random()*3;
                    if (blocks[x][y].type === 'tree') {
                        blocks[x][y] = toBlock(blocks, x, y, 'wood');
                        //draw tree
                        for (let i = 1; i <= 6; i++) {
                            if (existe(x, y - i) && i <= 3) blocks[x][y - i] = toBlock(blocks, x, y - i, 'wood')
                            for (let j = -2; j <= 2; j++) {
                                if (existe(x + j, y - i) && i > 3) blocks[x + j][y - i] = toBlock(blocks, x + j, y - i, 'leaf')
                            }
                        }
                    } 
                    else if (game.blocks[x][y].type === 'cave') {
                        for (let i = -8; i <= 8; i++) {
                            for (let j = -6; j <= 6; j++) {
                                if (existe(x+i, y+j) && blocks[x+i][y+j-1].name !== 'dirt') {
                                    let limit = PerlinNoise.noise(x+i, y+j, .1)*18;
                                    if (Math.abs(i) < limit-(Math.random()*3) && Math.abs(j) < limit-(Math.random()*3)) {
                                        blocks[x+i][y+j] = '';
                                    }
                                }
                            }
                        }
                    } 
                    else if (blocks[x][y].type === 'village') {
                        blocks[x][y] = toBlock(blocks, x, y, 'plank');
                        //draw village
                        for (let i = -8; i <= 8; i++) { //ground
                            if (existe(x+i, y)) blocks[x+i][y] = toBlock(blocks, x+i, y, 'plank');
                            if (existe(x+i, y+1)) blocks[x+i][y+1] = toBlock(blocks, x+i, y+1, 'dirt');
                            if (existe(x+i, y+2)) blocks[x+i][y+2] = toBlock(blocks, x+i, y+2, 'dirt');
                            for (let j = -6; j < 0; j++) {
                                if (existe(x+i, y+j)) blocks[x+i][y+j] = '';
                            }
                        }
                        function house (x,y) {
                            for (let i = -4; i < 0; i++) { //walls
                                if (existe(x-3, y+i)) blocks[x-3][y+i] = toBlock(blocks, x-3, y+i, 'stone');
                                if (existe(x+3, y+i)) blocks[x+3][y+i] = toBlock(blocks, x+3, y+i, 'stone');
                            }
                            //top
                            for (let i = 0; i <= 6; i++) { 
                                if (existe(x+i - 3, y-5)) blocks[x+i - 3][y-5] = toBlock(blocks, x+i - 3, y-5, 'stone');
                            }
                            for (let u = 1; u <= 3; u++) { //cover increase
                                for (let j = 0; j <= 3; j++) { //cover
                                    let length = 7-j;
                                    for (let i = 0; i <= 7; i++) {
                                        if (i+j+2 < length) {
                                            if (existe(x+i+j-2, y-6-j)) blocks[x+i+j-2][y-6-j] = toBlock(blocks, x+i+j-2, y-6-j, 'plank');
                                        }
                                    }
                                }
                            }
                            //door
                            if (existe(x+3, y-1)) {
                                blocks[x+3][y-1] = '';
                            }
                            if (existe(x+3, y-2)) {
                                blocks[x+3][y-2] = '';
                            }
                            game.entities.push(new Villager(game, blocks[x+3][y-3].x - game.tileSize*1.5, blocks[x+3][y-3].y + game.tileSize));
                        }
                        house(x, y);
                    } 
                    else if (blocks[x][y].type === 'river') {
                        for (let i = -11; i < 11; i++) { 
                            for (let j = -3; j < 2; j++) { 
                                if (existe(x+i, y+j-1)) blocks[x+i][y+j-1] = '';
                            }
                        }
                        for (let i = -11; i < 11; i++) { 
                            for (let j = 1; j < 6; j++) { 
                                if (existe(x+i, y+j)) {
                                    if (i == -11 || i == 10) blocks[x+i][y+j] = toBlock(blocks, x+i, y+j, 'clay');
                                    else blocks[x+i][y+j] = toBlock(blocks, x+i, y+j, 'water');
                                }
                            }
                        }
                    }
                    else if (spawnEntitie < 0.2) {
                        if (game.timer > 25) {
                            if (blocks[x][y] !== '' && blocks[x][y-1] === '' && blocks[x][y-2] === '' && blocks[x][y-3] === '') {
                                if (spawnEntitie < 0.1) {
                                    game.entities.push(new Enemy(game, block.x, block.y - game.tileSize*2, 'enemyImg1'));
                                } else {
                                    game.entities.push(new Enemy(game, block.x, block.y - game.tileSize*2, 'enemyImg2'));
                                }
                            }
                        } else {
                            if (blocks[x][y] !== '' && blocks[x][y-1] === '' && blocks[x][y-2] === '' && blocks[x][y-3] === '') {
                                if (spawnEntitie < 0.05 && y * game.tileSize < game.height / 2 - 2 * game.tileSize) {
                                    game.entities.push(new Pig(game, block.x, block.y - game.tileSize*2));
                                }
                            }
                        }
                    }
                }
            }
            game.saveBlocks.forEach(save => {
                for (let x = 0; x <= game.blocks.length - 1; x++) {
                    for (let y = 0; y <= game.blocks[x].length - 1; y++) {
                        let xPos = game.tileSize*((x - Math.floor(game.width / 2 / game.chunckSize)*1.5)+Math.floor(game.PcreationX / game.tileSize));
                        let yPos = y*game.tileSize;
                        if (save.x == xPos && save.y == yPos) {
                            if (save.name !== false) {
                                game.blocks[x][y] = new Tile(game, xPos/game.tileSize, yPos/game.tileSize, save.name);
                            } else {
                                game.blocks[x][y] = '';
                            }
                        }
                    }
                }
            });
            game.start = true;
        },
        eachSecond: function (game) {
            if (game.start) {
                const speed = 0.4; 
                game.gradientTime -= speed;
                game.timer = -game.gradientTime;
                if (-game.gradientTime >= 45) {
                    for (let i = 0; i < this.gradient.length; i++) {
                        this.gradient[i] = this.setupGradient[i];
                    }
                    game.gradientTime = 0;
                } else {
                    for (let i = 0; i < this.gradient.length; i++) {
                        if (game.world === 'hell') {
                            this.gradient[i] = 0;
                        }
                        this.gradient[i] += game.gradientTime/4;
                    }
                }
            }
        },
        generateHellChunks: function (game) {
            game.world = 'hell';
            game.start = false;
            game.blocks = [];
            game.entities = [];
            for (let x = -Math.floor(game.width / 2 / game.chunckSize)*1.5; x <= Math.floor(game.width / 2 / game.chunckSize)*1.5; x++) {
                game.blocks.push([]);
            }
            for (let x = -Math.floor(game.width / 2 / game.chunckSize)*1.5; x <= Math.floor(game.width / 2 / game.chunckSize)*1.5; x++) {
                for (let y = 0; y <= game.chunckSize * 3; y++) {
                    let tileIndex = x + Math.floor(game.width / 2 / game.chunckSize)*1.5;
                    const H = PerlinNoise.noise(x + Math.floor(game.PcreationX / game.tileSize), 1, .2) * 6;
                    let name;
                    if (y * game.tileSize > game.height / 2 - 2 * Math.floor(H) * game.tileSize) {
                        const R = PerlinNoise.noise(x + Math.floor(game.PcreationX / game.tileSize), y, .23);
                        const R2 = PerlinNoise.noise(x + Math.floor(game.PcreationX / game.tileSize), y, .6);
                        const R3 = PerlinNoise.noise(y, x + Math.floor(game.PcreationX / game.tileSize), .3);
                        if (y * game.tileSize < game.height / 2 + 100) {
                            if (y * game.tileSize < (game.height / 2 - 2 * Math.floor(H) * game.tileSize) + game.tileSize - 1) {
                                if (R > 0.635) { 
                                    name = 'litter';
                                } else if (R > 0.5 && R2 > 0.6 && R3 > 0.5 && H < 2.4) {
                                    name = 'river';
                                } else {
                                    name = 'litter';
                                }
                            } else {
                                name = 'litter';
                            }
                        } else { //underground
                            if (R > 0.61 && H > 3 && R3 < 0.5) {
                                name = 'iron';
                            }
                            else if (R > 0.58) {
                                if (R2 > 0.7 && R3 < 0.35 && H >= 3) {
                                    name = 'cave';
                                }
                                else {
                                    name = 'litter';
                                }
                            } else if (R > 0.56) {
                                name = 'calcarium';
                            } else if (R > 0.39) {
                                name = 'litter';
                            } else {
                                if (y * game.tileSize > game.tileSize * game.chunckSize * 2 && R2 < 0.3 && R3 < 0.4) {
                                    name = 'iron';
                                } else {
                                    name = 'stone';
                                }
                            }
                        }
                        game.PcreationX = Number(game.player.x);
                        let tile = new Tile(game, x + Math.floor(game.PcreationX / game.tileSize), y, name);
                        game.blocks[tileIndex].push(tile);
                    } else {
                        game.blocks[tileIndex].push('');
                    }
                }
            }
            let blocks = game.blocks;
            game.entities.push(new Boss(game, game.PcreationX + 300, Number(game.player.y) - game.tileSize * 10));
            for (let x = 0; x <= blocks.length - 1; x++) {
                for (let y = 0; y <= blocks[x].length - 1; y++) {
                    let block = blocks[x][y];

                    function toBlock(blocks, X, Y, name) {
                        if (blocks[X][Y] === '') {
                            X = (X - Math.floor(game.width / 2 / game.chunckSize)*1.5) + Math.floor(game.PcreationX / game.tileSize);
                            return (new Tile(game, X, Y, name));
                        } else {
                            return (new Tile(game, blocks[X][Y].x / game.tileSize, blocks[X][Y].y / game.tileSize, name));
                        }
                    }
                    function existe(X, Y) {
                        if (X >= 0 && Y >= 0 && X < blocks.length && Y < blocks[X].length) return true;
                        else return false;
                    }
                    let spawnEntitie = Math.random()*3; 
                    if (game.blocks[x][y].type === 'cave') {
                        for (let i = -8; i <= 8; i++) {
                            for (let j = -6; j <= 6; j++) {
                                if (existe(x+i, y+j) && blocks[x+i][y+j-1].name !== 'stone') {
                                    let limit = PerlinNoise.noise(x+i, y+j, .1)*18;
                                    if (Math.abs(i) < limit-(Math.random()*3) && Math.abs(j) < limit-(Math.random()*3)) {
                                        blocks[x+i][y+j] = '';
                                    }
                                }
                            }
                        }
                    } 
                    else if (blocks[x][y].type === 'river') {
                        for (let i = -11; i < 11; i++) { 
                            for (let j = -3; j < 2; j++) { 
                                if (existe(x+i, y+j-1)) blocks[x+i][y+j-1] = '';
                            }
                        }
                        for (let i = -11; i < 11; i++) { 
                            for (let j = 1; j < 6; j++) { 
                                if (existe(x+i, y+j)) {
                                    if (i == -11 || i == 10) blocks[x+i][y+j] = toBlock(blocks, x+i, y+j, 'sand');
                                    else blocks[x+i][y+j] = toBlock(blocks, x+i, y+j, 'lava');
                                }
                            }
                        }
                    }
                    else if (spawnEntitie < 0.3) {
                        if (blocks[x][y] !== '' && blocks[x][y - 1] === '' && blocks[x][y - 2] === '' && blocks[x][y - 3] === '') {
                            if (spawnEntitie < 0.15) {
                                game.entities.push(new Enemy(game, block.x, block.y - game.tileSize * 2, 'enemyImg1'));
                            } else {
                                game.entities.push(new Enemy(game, block.x, block.y - game.tileSize * 2, 'enemyImg2'));
                            }
                        }
                    }
                }
            }
            game.start = true;
        },
        reset: function (game) {
            this.start = !this.start;
            if (this.start) {
                this.define(game);
            } else {
            }
        }
    }
}

function collide(obj1, obj2) {
    if (obj1.x + obj1.w > obj2.x && obj1.x < obj2.x + obj2.w && obj1.y + obj1.h > obj2.y && obj1.y < obj2.y + obj2.h) return true; else return false;
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function map(n, start1, stop1, start2, stop2, withinBounds) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return this.constrain(newval, start2, stop2);
    } else {
        return this.constrain(newval, stop2, start2);
    }
};

function colorMixer(rgbA, rgbB, amountToMix){
    var r = colorChannelMixer(rgbA[0],rgbB[0],amountToMix);
    var g = colorChannelMixer(rgbA[1],rgbB[1],amountToMix);
    var b = colorChannelMixer(rgbA[2],rgbB[2],amountToMix);
    return "rgb("+r+","+g+","+b+")";
}
