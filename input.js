let canInput = true

const keyboard = {
    pressed: new Set(),
    longPressed: new Set(),
    pushed: new Set(),
    upped: new Set(),
}

const keyDown = (e) => {
    if (!canInput) return

    if (!keyboard.pressed.has(e.code)) {
        keyboard.pushed.add(e.code)

        if (["KeyZ", "Enter", "Space"].includes(e.code)) keyboard.pushed.add("ok")
        if (["KeyX", "Escape", "Backspace"].includes(e.code)) keyboard.pushed.add("cancel")
    }

    keyboard.pressed.add(e.code)
    keyboard.longPressed.add(e.code)

    // console.log(keyboard.longPressed)
}

const keyUp = (e) => {
    if (!canInput) return

    // keyboard.longPressed.delete(e.code)
    keyboard.pressed.delete(e.code)
    keyboard.upped.add(e.code)
}

document.addEventListener("keydown", (e) => {
    keyDown(e)
})

document.addEventListener("keyup", (e) => {
    keyUp(e)
})

document.querySelector("#sub-canvas").addEventListener(
    "mousemove",
    (e) => {
        if (!canInput) return

        const rect = e.target.getBoundingClientRect()
        mouse.p = vec(e.clientX - rect.left, e.clientY - rect.top).mlt(cvsSub.width / rect.width)
    },
    false,
)

const mouse = {
    clicking: false,
    rightClicking: false,
    middleClicking: false,
    clicked: false,
    rightClicked: false,
    middleClicked: false,
    p: vec(0, 0),
}

document.querySelector("#sub-canvas").addEventListener(
    "mousedown",
    (e) => {
        if (!canInput) return

        if (e.button == 0) {
            mouse.clicked = true
            mouse.clicking = true
        } else if (e.button == 1) {
            mouse.middleClicked = true
            mouse.middleClicking = true
        } else if (e.button == 2) {
            mouse.rightClicked = true
            mouse.rightClicking = true
        }

        console.log(mouse.p)
    },
    false,
)

const mouseUp = (e) => {
    if (!canInput) return

    if (e.button == 0) {
        mouse.clicking = false
    } else if (e.button == 1) {
        mouse.middleClicking = false
    } else if (e.button == 2) {
        mouse.rightClicking = false
    }
}

document.querySelector("#sub-canvas").addEventListener("mouseup", mouseUp, false)
document.querySelector("#sub-canvas").addEventListener("mouseleave", mouseUp, false)

document.querySelector("#sub-canvas").addEventListener("wheel", (e) => {
    mouse.deltaX = e.deltaX
    mouse.deltaY = e.deltaY
})

document.addEventListener("contextmenu", (event) => {
    event.preventDefault()
})

const focusState = {
    isFocused: true,
    justFocused: false,
    justBlurred: false,
}

window.addEventListener("blur", (e) => {
    console.log("よそ見するにゃ!")
    focusState.isFocused = false
    focusState.justBlurred = true
})

window.addEventListener("focus", (e) => {
    console.log("こっち見んにゃ!")
    focusState.isFocused = true
    focusState.justFocused = true
})

const updateInput = () => {
    keyboard.longPressed.clear()
    keyboard.pushed.clear()
    keyboard.upped.clear()

    mouse.deltaY = 0
    mouse.clicked = false
    mouse.rightClicked = false
    mouse.middleClicked = false

    focusState.justFocused = false
    focusState.justBlurred = false

    if (!canInput) {
        keyboard.pressed.clear()
        mouse.clicking = false
        mouse.rightClicked = false
        mouse.middleClicking = false
    }
}
