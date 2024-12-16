const sceneStageSelect = new (class {
    constructor() {
        this.command = new Icommand(
            ctxMain,
            "Poiret One",
            96,
            "#111",
            410,
            120,
            new RegExDict({
                "": [
                    "Stage0",
                    "Stage1",
                    "Stage2",
                    "Stage3",
                    "EXTRA",
                    //
                ],
            }),
        )

        this.frame = 0
    }

    loop() {
        ctxMain.clearRect(0, 0, width, height)
        ctxSub.clearRect(0, 0, width, height)

        Irect(ctxMain, "#fcfcfc", 0, 0, width, height, {
            line_width: 0,
        })

        BGM.drawFrequency(ctxMain, "#11111110", width / 2, height / 2, 200, 800)

        this.command.run(this.frame)

        if (this.command.is_match(".")) {
            stageId = this.command.get_selected_num(0)

            changeScene(sceneMain)

            this.command.cancel(1)
        }

        const isClicked = Ibutton(ctxMain, "#111", "Poiret One", 60, 40, 40, 150, 60, "Back", {
            text_align: "center",
            baseline: "top",
        })

        if (keyboard.pushed.has("cancel") || isClicked) {
            changeScene(sceneTitle)
        }

        this.frame++
    }
})()
