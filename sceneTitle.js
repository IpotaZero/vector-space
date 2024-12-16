const sceneTitle = new (class {
    constructor() {
        this.command = new Icommand(
            ctxMain,
            "Klee One",
            60,
            "#111",
            330,
            600,
            new RegExDict({
                "": ["   ゲームを始める", "ベクトル空間の定義"],
                "1": `       自分で調べろ`,
            }),
        )

        this.frame = 0
    }

    start() {
        if (!BGM.isPlaying()) {
            BGM = bgm_ame
            BGM.reset()
            BGM.play()
        }
    }

    loop() {
        ctxSub.clearRect(0, 0, width, height)
        ctxMain.clearRect(0, 0, width, height)

        Irect(ctxMain, "#fcfcfc", 0, 0, width, height, {
            line_width: 0,
        })

        Itext(ctxMain, "#111", "Poiret One", 120, width / 2, height / 2 - 100, "Vector Space", {
            text_align: "center",
            baseline: "middle",
        })

        this.command.run(this.frame * 1.5)

        if (this.command.is_match("0")) {
            changeScene(sceneStageSelect)

            this.command.reset()
        } else if (this.command.is_match("1")) {
            const r = Math.random()
            const r2 = Math.random()
            const a = 2
            const isClicked = Ibutton(
                ctxMain,
                "#111",
                "Poiret One",
                60,
                600 + a * (r - 0.5),
                800 + a * (r2 - 0.5),
                150,
                60,
                "Back",
                {
                    text_align: "center",
                    baseline: "top",
                },
            )

            if (isClicked) {
                this.command.cancel(1)
            }
        }

        BGM.drawFrequency(ctxMain, "#11111110", width / 2, height / 2, 200, 800)

        this.frame++
    }
})()
