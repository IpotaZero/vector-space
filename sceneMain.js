const sceneMain = new (class {
    constructor() {
        this.command = new Icommand(
            ctxSub,
            "Klee One",
            48,
            "#111",
            410,
            400,
            new RegExDict({
                "": ["ゲームを続ける", "やり直す", "ステージ選択に戻る"],
            }),
        )

        this.endCommand = new Icommand(
            ctxSub,
            "Klee One",
            48,
            "#111",
            410,
            430,
            new RegExDict({
                "": ["ステージ選択に戻る", "やり直す"],
            }),
        )
    }

    async start() {
        updateStageData()
        this.stage = stageDatas[stageId]

        this.middle = this.stage.start

        this.mode = "main"

        this.frame = 0

        this.restart()

        if (BGM != bgm_extra && stageId >= 3) {
            await Promise.all([bgm_extra.fetch(), BGM.fade(0.01, 2)])
            BGM = bgm_extra
            BGM.setVolume(0.5)
            BGM.reset()
            BGM.play()
        } else if (BGM == bgm_ame && stageId > 0) {
            await Promise.all([bgm_test.fetch(), BGM.fade(0.01, 2)])
            BGM = bgm_test
            BGM.setVolume(0.5)
            BGM.reset()
            BGM.play()
        }
    }

    restart() {
        this.frame = 0

        player.p = this.middle
        player.v = vec(0, 0)
        player.g = vec(0, 0.4)

        camera.p = player.p
        camera.v = vec(0, 0)
        camera.g = vec(0, 0.4)
        camera.scale = 4
        camera.scaleTarget = this.stage.firstScale ?? 1
        camera.scaleSpeed = 1 / 24

        bullets = []

        this.timeDirection = 0

        if (BGM.isReversed) BGM.reversePlayback()

        document.body.style.filter = "invert(0)"

        this.timeDirection = true

        this.objects =
            this.stage.objects != null
                ? this.stage.objects.map((o) => {
                      o.reset()
                      return o
                  })
                : []

        this.ending = 0
    }

    modeMain() {
        this.frame++

        if (keyboard.pushed.has("KeyR")) {
            this.restart()
        }

        // updateStageData()
        // this.stage = stageDatas[stageId]

        ctxMain.clearRect(0, 0, width, height)
        ctxSub.clearRect(0, 0, width, height)

        Irect(ctxMain, "#fcfcfc", 0, 0, width, height, { line_width: 0 })

        ctxMain.save()

        ctxMain.translate(width / 2, height / 2)
        ctxMain.rotate(-camera.g.normal().arg())
        ctxMain.translate(-width / 2, -height / 2)

        ctxMain.scale(camera.scale, camera.scale)
        ctxMain.translate(width / 2 / camera.scale, height / 2 / camera.scale)
        ctxMain.translate(-camera.p.x, -camera.p.y)

        // ctxMain.shadowBlur = 10
        // ctxMain.shadowColor = "grey"

        this.stage.texts.forEach((text) => {
            Itext(ctxMain, "#111", "Klee One", 48, text[0], text[1], text[2], { theta: text[3] ?? 0 })
        })

        this.stage.items.forEach((item) => {
            ctxMain.lineWidth = 2
            ctxMain.beginPath()
            ctxMain.arc(item[1].x, item[1].y, 100, 0, Math.PI * 2)
            ctxMain.stroke()

            if (item[1].sub(player.p).length() < 100) {
                if (item[0] == "gravity") {
                    if (player.g.sub(item[2]).length() > 0 && this.frame > 60) se_gravity.play()

                    player.g = item[2]
                } else if (item[0] == "goal") {
                    this.mode = "end"
                    se_goal.play()
                    // BGM.pause()
                } else if (item[0] == "middle") {
                    this.middle = item[1]
                } else if (item[0] == "reverse") {
                    if (this.timeDirection) invertWorld(true)
                } else if (item[0] == "order") {
                    if (!this.timeDirection) invertWorld(!true)
                } else if (item[0] == "end") {
                    this.ending++

                    if (this.ending > 240) {
                        camera.scaleSpeed = 1 / 24 ** 2
                        camera.scaleTarget = 16
                    }

                    if (this.ending > 720) {
                        changeScene(sceneEnding)
                    }
                }
            }
        })

        bullets.forEach((b) => {
            b.p = b.p.add(b.v)
            if (player.p.sub(b.p).length() > 1200) b.life = 0
            Iarc(ctxMain, "#111", b.p.x, b.p.y, 8, { line_width: 2 })

            this.objects.forEach((o) => {
                if (o.type == "block") {
                    if (o.p.x < b.p.x && b.p.x < o.p.x + o.size.x && o.p.y < b.p.y && b.p.y < o.p.y + o.size.y) {
                        o.shot(this.timeDirection, b)
                    }
                }
            })
        })

        bullets = bullets.filter((b) => b.life > 0)

        // this.objects = this.objects.filter((o) => o.life > 0)

        // Itext(
        //     ctxSub,
        //     "#111",
        //     "Poiret One",
        //     48,
        //     20,
        //     20,
        //     `
        //       x: ${Math.floor(player.p.x)};
        //       y: ${Math.floor(player.p.y)};
        //       vx: ${Math.floor(player.v.x)};
        //       vy: ${Math.floor(player.v.y)};
        //       ||v||: ${Math.floor(player.v.length())};
        //       gx: ${player.g.x};
        //       gy: ${player.g.y};
        //     `.replaceAll(" ", ""),
        // )

        player.run()

        this.objects.forEach((o) => {
            o.draw(ctxMain, this.timeDirection)

            if (o.type == "block" && o.life > 0) {
                o.getArrows().forEach((f) => {
                    player.touchWith(f)
                })
            }
        })

        this.stage.vecs.forEach((f) => {
            f.draw(ctxMain)
            player.touchWith(f)
        })

        player.move()

        camera.run(player.p, player.g)

        // 範囲外に出たらリスタート
        if (
            player.p.x < this.stage.area[0].x ||
            this.stage.area[1].x < player.p.x ||
            player.p.y < this.stage.area[0].y ||
            this.stage.area[1].y < player.p.y
        )
            this.restart()

        player.draw(ctxMain)

        ctxMain.restore()
    }

    modePause() {
        Irect(ctxSub, "#fcfcfc", 200, 200, 880, 560, { line_width: 0 })
        Irect(ctxSub, "#111", 200, 200, 880, 560, { line_width: 1 })

        Itext(ctxSub, "#111", "Poiret One", 72, width / 2, 280, "Pause", { text_align: "center" })

        this.command.run(this.frame)

        if (this.command.is_match("0")) {
            this.mode = "main"

            this.command.reset()
        } else if (this.command.is_match("1")) {
            this.middle = this.stage.start
            this.restart()
            this.mode = "main"

            this.command.reset()
        } else if (this.command.is_match("2")) {
            changeScene(sceneStageSelect)

            this.command.reset()
        }

        this.frame++
    }

    modeEnd() {
        Irect(ctxSub, "#fcfcfc", 300, 300, width - 600, height - 600, { line_width: 0 })
        Irect(ctxSub, "#111", 300, 300, width - 600, height - 600, { line_width: 1 })
        Itext(ctxSub, "#111", "Poiret One", 120, width / 2, height / 2 - 100, "Goal", {
            text_align: "center",
            baseline: "middle",
        })

        this.endCommand.run(this.frame)

        if (this.endCommand.is_match("0")) {
            changeScene(sceneStageSelect)
            this.mode = "main"

            this.endCommand.reset()
        } else if (this.endCommand.is_match("1")) {
            this.middle = this.stage.start
            this.restart()
            this.mode = "main"

            // BGM.play()

            this.endCommand.reset()
        }

        this.frame++
    }

    loop() {
        if (this.mode == "main") {
            this.modeMain()

            if (keyboard.pushed.has("Escape")) this.mode = "pause"
        } else if (this.mode == "pause") {
            this.modePause()

            if (keyboard.pushed.has("Escape")) this.mode = "main"
        } else if (this.mode == "end") {
            this.modeEnd()
        }
    }
})()

let bullets = []

let stageDatas

const updateStageData = () => {
    stageDatas = [
        {
            vecs: [
                arrow(0, 400, 100, 800),
                arrow(100, 800, 1200, 800),
                arrow(1200, 800, 2400, 600),
                arrow(2400, 800, 3600, 800),
                arrow(2800, 600, 2800, 1000),
                arrow(3200, 1000, 3200, 600),
                arrow(3600, 1000, 4800, 1000),
                arrow(4200, 800, 4800, 800),
                arrow(4200, 600, 4800, 600),
                arrow(4200, 400, 6000, 400),
                arrow(6000, 400, 6200, 300),
                arrow(6200, 300, 6300, 100),
                arrow(6300, 100, 6300, -100),
                arrow(6300, -100, 6200, -300),
                arrow(6200, -300, 6000, -400),
                arrow(6000, -400, 4800, -400),
                arrow(4800, -400, 4800, 0),
            ],
            start: vec(80, 0),
            area: [vec(-1200, -1600), vec(7500, 2200)],
            texts: [
                [200, 400, "矢印キーで移動"],
                [2815, 500, "シフトでジャンプ"],
                [2700, 1050, "矢印は右側からは抜けられる"],
                // [900, 400, "Bの野郎が俺をこの地獄に落としやがった"],
                // [2600, 400, "復讐のためにまずはこの地獄から脱出する"],
                [4200, 670, "Shift押しっぱで連続ジャンプ"],
                [5300, 100, "時には視点を変えることも重要"],
                [5600, -500, "円いものには意味がある", Math.PI],
            ],
            items: [
                ["gravity", vec(6000, 400), vec(0.4, 0)],
                ["gravity", vec(6300, 0), vec(0, -0.4)],
                ["goal", vec(4800, -400)],
            ],
        },
        {
            vecs: [
                arrow(-200, 100, 0, 100),
                arrow(0, 400, 1000, 400),
                arrow(0, 100, 1000, 100, { jumpable: false }),

                arrow(0, -400, 1000, -400),
                arrow(1000, -400, 2000, 0, { jumpable: false }),
                arrow(2000, 0, 2200, 0, { jumpable: false }),

                arrow(500, -400, 500, -600),

                arrow(4500, -100, 2100, -100),

                arrow(3600, 100, 4800, 100),

                arrow(5000, 100, 5200, 100),
                arrow(5200, -200, 6000, -200, { jumpable: false }),
                arrow(5400, 400, 5400, -200),

                arrow(5200, 100, 5200, 1000),

                arrow(5400, 700, 5400, 1000),
                arrow(5600, 850, 5600, 1000),
                arrow(5800, 950, 5800, 1000),
                arrow(6000, 950, 6000, 2000),

                arrow(5200, 1800, 5200, 2800),

                arrow(5300, 2800, 5350, 2900),
                arrow(5350, 2900, 5550, 3300, { jumpable: false }),
                arrow(5550, 3300, 5600, 3400),

                arrow(5600, 3400, 5600, 4400),

                //
            ],
            start: vec(200, 300),
            area: [vec(-1200, -2000), vec(12000, 5000)],
            texts: [
                // [2800, -25, "体が重くて動かない日もある"],
                [5500, -400, "↑ゴール"],
                [6100, 2000, "↓あっち", Math.PI / 2],
                [5600, 4000, "ふわふわ", Math.PI / 2],
            ],
            items: [
                ["gravity", vec(800, 100), vec(0, 0.2)],
                ["gravity", vec(200, -400), vec(0, 0.8)],
                ["gravity", vec(2000, 0), vec(0, 0.08)],
                ["gravity", vec(4000, 0), vec(0, 0.4)],
                ["gravity", vec(5600, 4100), vec(0, -0.1)],
                ["gravity", vec(5300, 300), vec(-0.8, 0)],
                ["goal", vec(5600, -600)],
            ],
            firstScale: 1,
        },
        {
            vecs: [
                arrow(0, 100, 600, 100),
                arrow(600, 100, 1000, 0),
                arrow(1000, 0, 1200, 0),
                arrow(0, -600, 1200, -600),
                arrow(0, -700, 600, -700),
                arrow(1500, -1000, 2200, -1000),
                arrow(1500, -1450, 2200, -1450),

                arrow(2200, -2150, 1500, -2150),
                arrow(1500, -2150, 1000, -2000),
                arrow(1000, -2000, 500, -1600),
                arrow(500, -1600, 0, -1000),
                arrow(0, -1000, -1000, -1000),

                arrow(2200, -1000, 2200, -2150),

                arrow(-100, -700, -600, -700),
                arrow(-100, -400, -600, -400),

                arrow(500, -200, 0, -200),

                arrow(3500, -200, 2100, -200),

                arrow(3500, 200, 3000, 200),
                arrow(3000, 1000, 3000, 200),
                arrow(2100, -200, 2100, -1000),

                //
            ],
            start: vec(500, 0),
            area: [vec(-1200, -16000), vec(12000, 2200)],
            texts: [
                [0, 0, "あー銃、Zで銃"],
                [-300, -600, "←あっち", Math.PI],
                [900, -900, "あっち→", -Math.PI / 6],
                //
            ],
            items: [
                ["gravity", vec(1900, -1800), vec(0, -0.4)],
                ["reverse", vec(200, -600)],
                ["order", vec(500, 100)],
                ["goal", vec(3200, 600)],
            ],
            objects: [
                block(vec(1200, -400), vec(200, 100)),
                block(vec(1200, -300), vec(200, 100)),
                block(vec(1200, -100), vec(200, 100)),
                block(vec(1200, -200), vec(200, 100)),
                block(vec(1200, -500), vec(200, 100)),

                block(vec(1500, -400), vec(200, 100)),
                block(vec(1500, -300), vec(200, 100)),
                block(vec(1500, -100), vec(200, 100)),
                block(vec(1500, -200), vec(200, 100)),

                block(vec(1800, -300), vec(200, 100)),
                block(vec(1800, -100), vec(200, 100)),
                block(vec(1800, -200), vec(200, 100)),

                block(vec(500, -750), vec(400, 200)),

                block(vec(2000, -1100), vec(200, 100), 0),

                block(vec(3000, -200), vec(200, 100), 0, false),
            ],
            firstScale: 1,
        },
        {
            vecs: [
                arrow(0, 100, 1200, 100),
                arrow(1200, 100, 2400, 500),
                arrow(2400, 500, 3600, 500),
                arrow(3600, 500, 3600, -500),

                arrow(3500, 300, 3500, -500, { jumpable: false }),
                arrow(3400, 0, 3400, -500),
                arrow(3400, -500, 3200, -700),
                arrow(3200, -700, 3600, -1100),
                arrow(3600, -1100, 3200, -1500),
                arrow(3200, -1500, 3600, -1900),
                arrow(3600, -1900, 3200, -2300),

                arrow(3200, -2300, 2500, -2300),
                arrow(2500, -2100, 2500, -2500),
                arrow(2400, -2100, 2400, -2500),
                arrow(2400, -2300, 1600, -2300),

                arrow(0, -2300, -200, -2300),

                arrow(-200, -2300, -200, -600),
                arrow(200, -1400, 0, -1200),
                arrow(0, -1400, 200, -1200),

                arrow(800, -1300, 800, -600),

                arrow(-200, -600, 600, -600),

                arrow(800, -600, 1200, -600),
                arrow(1200, -1300, 800, -1300),

                //
            ],
            start: vec(100, 0),
            area: [vec(-1200, -2600), vec(12000, 2200)],
            texts: [
                // [500, -200, "あ"],
                [1000, -1075, "座禅を組む", Math.PI / 2],
                [100, -1000, "↑あっち", Math.PI / 2],
            ],
            items: [
                ["gravity", vec(3600, 500), vec(0.4, 0)],
                ["gravity", vec(3200, -2300), vec(0, -0.4)],
                ["reverse", vec(2000, -2300)],
                ["gravity", vec(-100, -2300), vec(-0.4, 0)],
                ["order", vec(-100, -2300)],
                ["end", vec(800, -950)],
                // ["gravity", vec(-200, -600), vec( 0,0.4)],

                //
            ],
            objects: [
                block(vec(2700, 400), vec(200, 100)),
                block(vec(2700, 300), vec(200, 100)),
                block(vec(2700, 200), vec(200, 100)),
                block(vec(2700, 100), vec(200, 100)),
                block(vec(2700, 0), vec(200, 100)),

                block(vec(3300, -200), vec(100, 200)),
                block(vec(3200, -200), vec(100, 200)),
                block(vec(3100, -200), vec(100, 200)),
                block(vec(3000, -200), vec(100, 200)),

                block(vec(1200, -2300), vec(200, 100), 0, true),
                block(vec(600, -2200), vec(200, 100), 0, true),
                block(vec(0, -2100), vec(200, 100), 0, true),
            ],
            firstScale: 1,
        },
        {
            vecs: [
                arrow(100, -400, 100, 200),
                arrow(-1200, 100, 1200, 100),
                arrow(1200, 100, 2400, 200),
                arrow(2400, 200, 2600, 200),
                arrow(2800, 200, 3000, 200),
                arrow(3200, 0, 3400, 0),
                arrow(3600, 0, 3700, 0),
                arrow(3900, 0, 4000, 0),
                arrow(4200, 200, 4400, 0),
                arrow(4600, 200, 4800, 0),
                arrow(5000, 100, 5100, 0),
                arrow(5300, 100, 5400, 0),
                arrow(5500, 0, 5700, 200),
                arrow(6000, 100, 7200, 100),
                arrow(7000, -200, 7200, 0),
                arrow(7000, -500, 7200, -300),
                arrow(7000, -800, 7200, -600),

                arrow(7400, 0, 7400, -800),

                arrow(7600, -600, 7800, -800),
                arrow(7600, 0, 7800, -200),

                arrow(7600, 100, 8000, 100),
                arrow(8100, 100, 8300, 100),
                arrow(8500, 300, 8700, 300),
                arrow(8900, 100, 10000, 100),

                //
            ],
            start: vec(700, 0),
            area: [vec(-1200, -2000), vec(12000, 2200)],
            texts: [
                [600, -300, "←ゴール"],
                [-400, -300, "目の前にあるのに;届かないもの"],
                [9500, -300, "つまり、戻れってことだ"],
                //
            ],
            items: [
                ["gravity", vec(9500, 0), vec(0, 0.4).rot(0.15)],
                ["middle", vec(9500, 0)],
                ["goal", vec(-200, 0)],
            ],
            firstScale: 1,
        },
        {
            vecs: [],
            start: vec(700, 0),
            area: [vec(-1200, -2000), vec(12000, 2200)],
            texts: [],
            items: [],
            firstScale: 1,
        },
    ]
}
let stageId = 0

const invertWorld = (b) => {
    BGM.reversePlayback()

    se_reverse.play()

    sceneMain.timeDirection = !b

    if (b) {
        document.body.style.filter = "invert(100%)"
    } else {
        document.body.style.filter = "invert(0)"
    }

    bullets.forEach((b) => {
        b.v = b.v.mlt(-1)
    })
}
