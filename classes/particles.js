class Particle {
    constructor () {
        this.pos = {x: 0, y: 0};
        this.vel = {x: 0, y:0};
        this.angle = 0;
        this.va = Math.random() * 0.2 - 0.1;
        this.show = false;
    }
    start (Pos, color, radius) {
        this.show = true;
        this.angle = Math.atan2(Pos.y, Pos.x);
        this.pos = {x: Pos.x, y: Pos.y};
        this.color = color;
        this.radius = radius;
        this.vel.x = Math.random() * 15 - Math.random() * 15;
        this.vel.y = Math.random() * 15 - Math.random() * 15;
    }
    render (ctx) {
        if (this.show) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            this.vel.x *= 0.97;
            this.vel.y *= 0.97;
            this.angle += this.va;
            this.pos.x += Math.sin(this.angle) * this.vel.x;
            this.pos.y += Math.sin(this.angle) * this.vel.y;

            if (this.radius > 2) this.radius -= 0.15;
            else this.show = false;
        }
    }
}