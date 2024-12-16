const arrow = (x0, y0, x1, y1, option) => {
    return new F(x0, y0, x1, y1, option)
}

const F = class {
    constructor(x0, y0, x1, y1, { jumpable = true } = {}) {
        this.start = vec(x0, y0)
        this.end = vec(x1, y1)
        this.jumpable = jumpable
    }

    draw(ctx) {
        ctx.strokeStyle = "#111"
        ctx.lineWidth = 2

        if (this.jumpable) ctx.setLineDash([5, 0])
        else ctx.setLineDash([5, 5])

        ctx.beginPath()
        ctx.moveTo(this.start.x, this.start.y)
        ctx.lineTo(this.end.x, this.end.y)
        ctx.stroke()

        const end0 = this.end.add(
            this.end
                .sub(this.start)
                .nor()
                .rot(Math.PI * (4 / 5))
                .mlt(24),
        )
        const end1 = this.end.add(
            this.end
                .sub(this.start)
                .nor()
                .rot(-Math.PI * (4 / 5))
                .mlt(24),
        )

        ctx.beginPath()
        ctx.moveTo(this.end.x, this.end.y)
        ctx.lineTo(end0.x, end0.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(this.end.x, this.end.y)
        ctx.lineTo(end1.x, end1.y)
        ctx.stroke()
    }

    getIntersectionPoint(floor) {
        const x0 = this.start.x
        const y0 = this.start.y
        let x1 = this.end.x
        const y1 = this.end.y

        const x2 = floor.start.x
        const y2 = floor.start.y
        let x3 = floor.end.x
        const y3 = floor.end.y

        //
        if (Math.abs(x1 - x0) < 0.01) x1 = x0 + 0.01
        if (Math.abs(x3 - x2) < 0.01) x3 = x2 + 0.01

        const t0 = (y1 - y0) / (x1 - x0)
        const t1 = (y3 - y2) / (x3 - x2)

        // 平行ならば
        if (t0 == t1) return

        const x = (y2 - y0 + t0 * x0 - t1 * x2) / (t0 - t1)
        const y = t0 * (x - x0) + y0

        // 線分として当たっているか?
        const ratio0 = (x - x0) / (x1 - x0)
        const ratio1 = (x - x2) / (x3 - x2)
        const isHit = 0 < ratio0 && ratio0 < 1 && 0 < ratio1 && ratio1 < 1

        if (!isHit) return

        return vec(x, y)
    }

    vec() {
        return this.end.sub(this.start)
    }
}
