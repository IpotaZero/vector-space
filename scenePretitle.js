const scenePretitle = new (class {
    constructor() {}

    loop() {
        Itext(ctxMain, "#fcfcfc", "Klee One", 120, width / 2, height / 2, "a")

        Irect(ctxMain, "#111", 0, 0, width, height, { line_width: 0 })

        Itext(ctxMain, "#fcfcfc", 'Poiret One,"創英角ポップ体"', 120, width / 2, height / 2, "Presented by MCR", {
            text_align: "center",
            baseline: "middle",
        })

        if (!this.isClicked && (keyboard.pressed.size > 0 || mouse.clicked)) {
            se_open.play()

            changeScene(sceneTitle, 2500)
        }
    }
})()
