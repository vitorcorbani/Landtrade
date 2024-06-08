function renderProgram(game, canvas, ctx) {
    if (game.start) {
        game.translateX = -game.player.x + canvas.width/2;
        game.translateY = -game.player.y + canvas.height/2;

        ctx.save();
        ctx.translate(game.translateX, game.translateY);
        //gradient
        ctx.save();
        const gradient = ctx.createLinearGradient(canvas.width/2, 0, canvas.width/2, canvas.height);
        gradient.addColorStop(0, `rgb(${game.gradient[0]}, ${game.gradient[1]}, ${game.gradient[2]})`);
        gradient.addColorStop(0.2, `rgb(${game.gradient[3]}, ${game.gradient[4]}, ${game.gradient[5]})`);
        gradient.addColorStop(0.5, `rgb(${game.gradient[6]}, ${game.gradient[7]}, ${game.gradient[8]})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(-game.translateX, -game.translateY - 100, canvas.width, canvas.height*1.5 + 100);
        ctx.restore();
        //
        if (game.player.x < game.blocks[0][game.blocks[0].length-1].x || game.player.x > game.blocks[game.blocks.length-1][game.blocks[game.blocks.length-1].length-1].x) {
            if (game.world !== 'overworld') {
                for (let i = 0; i < game.gradient.length; i++) {
                    game.gradient[i] = game.setupGradient[i];
                }
                game.world = 'overworld';
            }
            if (game.world === 'overworld') game.generateChunks(game);
        }
        game.portals = [];
        for (let x = 0; x <= game.blocks.length-1; x++) {
            for (let y = 0; y <= game.blocks[x].length-1; y++) {
                let block = game.blocks[x][y];
                if (block !== '') {
                    if (block.name === 'portal') game.portals.push({x: block.x, y: block.y});
                    if (block.name === 'hell') game.hells.push({x: block.x, y: block.y});
                    if (block.x+game.translateX > -game.tileSize && block.x+game.translateX < canvas.width &&
                    block.y+game.translateY > -game.tileSize && block.y+game.translateY < canvas.height) {
                        block.onScreen = true;
                        if (block.update(x, y, game.blocks)) { 
                            block.draw(ctx);
                            if (block.type === 'liquid' && game.spriteUpdate) {
                                function existe(X, Y) {
                                    if (X >= 0 && Y >= 0 && X < game.blocks.length && Y < game.blocks[X].length) return true;
                                    else return false;
                                }
                                function spread (X, Y) {
                                    if (existe(X, Y)) {
                                        if (game.blocks[X][Y] === '') game.blocks[X][Y] = 
                                        new Tile(game, game.blocks[x][y].x/game.tileSize + (X-x), game.blocks[x][y].y/game.tileSize + (Y-y), game.blocks[x][y].name)
                                    }
                                }
                                spread(x+1, y);
                                spread(x-1, y);
                                spread(x, y+1);
                            }
                        }
                        else { game.blocks[x][y] = ''; }
                    } else block.onScreen = false;
                }
            }  
        }
        game.entities.forEach((e, index) => {
            if (e.x+game.translateX > -e.w && e.x+game.translateX < canvas.width &&
            e.y+game.translateY > -e.h && e.y+game.translateY < canvas.height) {
                e.update(game.player);
                e.draw(ctx);         
                if (e.lives <= 0) {
                    if (e.drop) {
                        if (game.player.inventory.length < game.player.invMax && Math.random() < e.dropChance) {
                            game.player.inventory.push(e.drop);
                        }
                    }
                    game.entities.splice(index, 1);
                }  
            }
        });
        game.player.update();
        game.player.draw(ctx, canvas);
        game.particles.forEach(p => {
            p.render(ctx);
        });
        ctx.restore();
    }
}

window.addEventListener('load', function () {
    console.log(localStorage);
    mobileConfigs();
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const game = getGame(canvas, ctx);
    // canvas.width = 1242;
    // canvas.height = 597;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', e => {
        //game.scaled = {w: window.innerWidth/canvas.width, h: window.innerHeight/canvas.height};
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    ctx.strokeStyle = 'rgb(255, 255, 255, 0)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'white';
    ctx.font = '20px Trebuchet MS';
    Ui();

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        spriteTiming(deltaTime);
        renderProgram(game, canvas, ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
    setInterval(function(){game.eachSecond(game)}, 1000);

    function Ui() {
        document.getElementById('startButton').addEventListener('click', () => {
            if (game.start) game.autoSave(game);
            game.reset(game);
        });
        document.getElementById('newButton').addEventListener('click', () => {
            localStorage.removeItem('savedBlocks');
            localStorage.removeItem('playerInventory');
            game.reset(game); 
        });
        function whenClick (mousePos) {
            function checkMouseCollide(mouse, other) {
                if (mouse.x > other.x && mouse.x < other.x + other.w && mouse.y > other.y && mouse.y < other.y + other.h) return true; else return false;
            };
            for (let i = 0; i < game.entities.length; i++) {
                let e = game.entities[i];
                if (checkMouseCollide(mousePos, e) && dist(e.x+e.w/2, e.y+e.h/2, game.player.x+game.player.w/2, game.player.y+game.player.h/2) < 90+e.w/2) {
                    e.lives -= game.player.damage;
                    //e.x += (game.player.x < e.x ? 5 : -5);
                    game.particles.forEach(p => p.start({x: e.x+e.w/2, y: e.y+e.h/2}, 'red', 6));
                    return 0;
                }          
            }

            for (let x = 0; x <= game.blocks.length-1; x++) {
                for (let y = 0; y <= game.blocks[x].length-1; y++) {
                    let xPos = game.tileSize*((x - Math.floor(game.width / 2 / game.chunckSize)*1.5)+Math.floor(game.PcreationX / game.tileSize));
                    let yPos = y*game.tileSize;
                    let block = game.blocks[x][y];
                    if (dist(xPos+game.tileSize/2, yPos+game.tileSize/2, game.player.x+game.player.w/2, game.player.y+game.player.w/2) < 90+game.tileSize/2) {
                        if (block === '' && checkMouseCollide(mousePos, {x: xPos, y: yPos, w: game.tileSize, h: game.tileSize})) {
                            if (game.player.placeBlock && game.player.inventory.length > 0 && typeof game.player.inventory[game.player.invSelected] === 'string') { //place
                                function checkExistance(X, Y) {
                                    if (X >= 0 && Y >= 0 && X < game.blocks.length && Y < game.blocks[X].length) return game.blocks[X][Y];
                                    else return false;
                                }
                                function placeable (block) {
                                    if (block !== false && block instanceof Tile) {
                                        return (block.type !== 'liquid' ? true : false);
                                    } else return false;
                                }
                                let toCheck = [
                                    placeable(checkExistance(x, y-1)),
                                    placeable(checkExistance(x, y+1)),
                                    placeable(checkExistance(x-1, y)),
                                    placeable(checkExistance(x+1, y))
                                ]
                                if (!(toCheck.every(e => e === false))) {
                                    let inventoryBlock = new Tile(game, xPos/game.tileSize, yPos / game.tileSize, game.player.inventory[game.player.invSelected]);
                                    game.player.inventory.splice(game.player.invSelected, 1);
                                    game.blocks[x][y] = inventoryBlock;
                                    if (game.world === 'overworld') game.saveBlocks.push({x: inventoryBlock.x, y: inventoryBlock.y, name: inventoryBlock.name});
                                    return 0;
                                }
                            }
                        } else if (block.onScreen && !block.remove && block.visible && block.type !== 'liquid') {
                            if (checkMouseCollide(mousePos, block)) block.checkHit(mousePos, game.player, x, y);
                            if (block.remove) {
                                if (game.world === 'overworld') game.saveBlocks.push({x: block.x, y: block.y, name: false});
                                return 0;
                            }
                        }
                    }
                }  
            }
        }
        canvas.addEventListener('click', e => {
            if (game.start && !game.spriteUpdate) {
                const mousePos = { x: e.offsetX, y: e.offsetY };
                mousePos.x -= game.translateX;
                mousePos.y -= game.translateY;
                // mousePos.x /= game.scaled.w;
                // mousePos.y /= game.scaled.h;
                whenClick(mousePos);
                e.preventDefault();
            }
        });
        window.addEventListener('touchstart', e => {
            if (game.start) {
                const mousePos = { x: e.offsetX, y: e.offsetY };
                mousePos.x -= game.translateX;
                mousePos.y -= game.translateY;
                whenClick(mousePos);
            }
        });
    }
    function mobileConfigs () {
        window.mobileCheck = function() {
            let check = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
            return check;
        };
        function id (id) {
            return document.getElementById(id);
        }
        if (!window.mobileCheck()) {
            id('leftButton').style.display = 'none';
            id('rigthButton').style.display = 'none';
            id('jumpButton').style.display = 'none';
        } else {
            id('leftButton').style.display = 'visible';
            id('rigthButton').style.display = 'visible';
            id('jumpButton').style.display = 'visible';
        }
    }
    function spriteTiming(deltaTime) {
        // sprite timing
        if (game.spriteTimer > game.spriteInterval) {
            game.spriteUpdate = true;
            game.spriteTimer = 0;
        }
        else {
            game.spriteUpdate = false;
            game.spriteTimer += deltaTime;
        }
    }
});
