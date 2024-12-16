const player = new (class {
    constructor() {
        // position
        this.p = vec(150, 0)
        // velocity
        this.v = vec(0, 0)
        // gravity acceleration
        this.g = vec(0, 0.4)

        // 床に触れているか?
        this.onFloor = []

        // 描画用
        this.rotation = 0

        // 右
        this.direction = 1
    }

    // メインループ
    run() {
        // 入力猶予6フレーム
        this.onFloor = this.onFloor.slice(-6)

        this.v = this.v.add(this.g)
        this.p = this.p.add(this.v)


        // 空気抵抗
        this.v = this.v.mlt(0.99)

        this.rotation += this.v.dot(this.g.normal())

        this.onFloor.push(false)
    }

    // 入力
    move() {
        if (keyboard.pressed.has("ArrowRight")) {
            this.direction = 1
            this.v = this.v.add(this.g.normal().mlt(0.3))
        }

        if (keyboard.pressed.has("ArrowLeft")) {
            this.direction = -1
            this.v = this.v.add(this.g.normal().mlt(-0.3))
        }

        if (keyboard.pressed.has("ShiftLeft") && this.onFloor.includes(true)) {
            // console.log("jump")
            this.v = this.v.add(this.g.nor().mlt(-48 * 0.4))
            this.onFloor = []
            // se_jump.play()
        }

        if (keyboard.pushed.has("KeyZ") && bullets.length < 3) {
            bullets.push({
                p: this.p,
                v: this.g.normal().mlt(this.direction * 24),
                life: 1,
            })
        }
    }

    // 床との衝突判定
    touchWith(arrow) {
        const f = this.getArrow()
        // f.draw(ctxMain)

        const p = arrow.getIntersectionPoint(f)

        if (!p) return

        // 床がどれだけ垂直か
        const verticality = arrow.vec().nor().cross(this.g.nor())

        // console.log(verticality)

        if (verticality >= 0.1 && arrow.jumpable) {
            this.onFloor.push(true)
            // this.v = this.v.mlt(0.99)
        }

        // 垂直抗力
        const normal = arrow.vec().normal()

        // console.log(normal.length())

        this.v = this.v.sub(normal.mlt(this.v.dot(normal)-1 ))

        this.p = p
    }

    getArrow() {
        const start = this.p.add(this.v.mlt(-1))
        const end = this.p.add(this.v)
        return arrow(start.x, start.y, end.x, end.y)
    }

    draw(ctx) {
        ctx.setLineDash([5, 0])
        ctx.strokeStyle = "#111"

        
        ctx.beginPath()
        ctx.arc(this.p.x, this.p.y, 20, 0, Math.PI * 2)
        ctx.stroke()

        Ipolygon(ctx, 8, 2, this.p.x, this.p.y, 60, "gray", {line_width:2, theta: this.rotation / 108 })
        Itext(ctx, "#111", "Klee One", 1, this.p.x, this.p.y, "罪", { text_align: "center", baseline: "middle" })
    }
})()
