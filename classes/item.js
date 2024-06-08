class Item {
    constructor (game, name) {
        this.game = game;
        this.name = name;
        this.image = false;
        for (let i = 0; i < game.itensInfo.length; i++) {
            let info = game.itensInfo[i];
            if (info.name === name) {
                if (info.img) this.image = document.getElementById(info.img);
                this.damage = info.damage;
                this.break = info.break;
                this.protection = info.protection;
                this.heal = info.heal;
                this.hand = (info.protection <= 0 ? true : false)
            }
        }
    }
    draw (ctx, x, y, pW, pH) {
        //ctx.fillRect(x, y, 10, 10);
        if (this.image !== false) {
            if (this.hand) {
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y-this.image.height/1.2, this.image.width, this.image.height);
            } else {
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y, pW, pH);
            }
        }       
    }
}
