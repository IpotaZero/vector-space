const camera = new (class {
    constructor() {
        this.p = vec(0, 0)

        this.g = vec(0, 0.4)

        this.scale = 1.2
        this.scaleTarget = 1.2
        this.scaleSpeed = 1 / 24
    }

    run(p, g) {
        const v = p.sub(this.p).mlt(1 / 12)

        const vP = this.g.mlt(v.dot(this.g) / this.g.length() ** 2)

        this.p = this.p.add(v.add(vP.mlt(11 / 12)))

        const omega = (g.arg() - this.g.arg()) / 12
        const theta = this.g.arg() + omega
        this.g = vec.arg(theta)

        this.scale += (this.scaleTarget - this.scale) * this.scaleSpeed
    }
})()
