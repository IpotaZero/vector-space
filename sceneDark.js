const changeScene = (scene, ms = 500) => {
    const container = document.querySelector(".canvas-container")
    container.style.opacity = 0
    container.style.transition = `all ${ms / 1000}s`

    currentScene = sceneDark

    canInput = false

    setTimeout(() => {
        currentScene = scene
        currentScene.start?.()
        container.style.opacity = 1
        canInput = true
    }, ms)
}

const sceneDark = new (class {
    constructor() {}
    loop() {}
})()
