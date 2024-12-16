let currentScene = scenePretitle

let BGM = bgm_ame
BGM.setVolume(0.1)
BGM.fetch()

let now = Date.now()

window.onload = () => {
    setInterval(() => {
        const pre = Date.now()

        cvsSub.style.cursor = ""
        ctxMain.shadowBlur=0

        currentScene.loop()

        // Itext(ctxMain, "#111", "Poiret One", 48, 0, height, Math.floor(1000 / (pre - now)), {
        //     baseline: "bottom",
        // })
        now = pre

        updateInput()
    }, 1000 / 60)
}
