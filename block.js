const block = (p, size, life, direction) => new B(p, size, life, direction)

const B = class {
    constructor(p, size, life = 1, direction = true) {
        this.p = p
        this.size = size
        this.firstLife = life
        this.life = life
        this.type = "block"
        this.firstTimeDirection = direction
    }

    getArrows() {
        return [
            arrow(this.p.x, this.p.y, this.p.x + this.size.x, this.p.y),
            arrow(this.p.x + this.size.x, this.p.y, this.p.x + this.size.x, this.p.y + this.size.y),
            arrow(this.p.x + this.size.x, this.p.y + this.size.y, this.p.x, this.p.y + this.size.y),
            arrow(this.p.x, this.p.y + this.size.y, this.p.x, this.p.y),
        ]
    }

    reset() {
        this.life = this.firstLife
        this.timeDirection = this.firstTimeDirection
    }

    shot(timeDirection, bullet) {
        if (this.life > 0) {
            this.timeDirection = timeDirection
            bullet.life = 0
            this.life = 0
            se_glass.play()
        }

        // 前に撃たれた時間方向と現在の時間方向
        if (timeDirection == this.timeDirection) return

        this.life = 1
        bullet.life = 0

        se_glass_reverse.play()
    }

    draw(ctx, timeDirection) {
        ctx.setLineDash([5, 0])

        if (this.life > 0) {
            ctx.strokeStyle = "#111"
            ctx.strokeRect(this.p.x, this.p.y, this.size.x, this.size.y)
        } else {
            ctx.strokeStyle = "#00000040"
            if (timeDirection == this.timeDirection) {
                // ctx.strokeRect(this.p.x, this.p.y, this.size.x, this.size.y)
            } else {
                ctx.setLineDash([5, 5])
                ctx.strokeRect(this.p.x, this.p.y, this.size.x, this.size.y)
            }
        }
    }
}
