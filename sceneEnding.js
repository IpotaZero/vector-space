const sceneEnding = new (class {
    constructor() {}

    start() {
        ctxSub.clearRect(0, 0, width, height)
        ctxMain.clearRect(0, 0, width, height)

        BGM.fade(0.01, 4).then(() => {
            BGM.pause()
        })

        this.text = endingText[0]

        this.textId = 0

        this.frame = 0
    }

    loop() {
        this.frame++

        Irect(ctxMain, "white", 0, 0, width, height, { line_width: 0 })

        Itext(ctxMain, "#111", "Klee One", 48, width / 2, height / 2, this.text, {
            text_align: "center",
            baseline: "middle",
        })

        if (this.frame > 210) {
            this.frame = 0
            this.textId++
            if (this.textId == endingText.length) {
                changeScene(sceneTitle)
                return
            }
            se_ending.play()

            this.text = endingText[this.textId]
        }
    }
})()

const endingText = [
    "",
    "Vector Space",
    "企画: いぽた",
    "BGM: うめぼし",
    "SE: 効果音ラボ",
    "背景: 「なんちゃって和柄パターン２」;https://www.pixiv.net/artworks/80831820",
    "制作: MCR",
    "",
    //
]
