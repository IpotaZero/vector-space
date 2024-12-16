const Iaudio = class {
    constructor(src) {
        this.audio = new Audio(src)
        this.audio.preload = "auto"
        this.audio.load()
    }

    async play(playbackRate = 1) {
        this.audio.currentTime = 0

        if (playbackRate < 0) this.audio.currentTime = this.audio.duration

        this.audio.playbackRate = playbackRate
        return this.audio.play()
    }

    setVolume(volume) {
        this.audio.volume = volume
        return this
    }
}

// const se_select = new Iaudio()
const se_ok = new Iaudio("sounds/ok.wav")
const se_open = new Iaudio("sounds/open.wav")
const se_goal = new Iaudio("sounds/goal.wav").setVolume(0.5)
const se_reverse = new Iaudio("sounds/ブウーン.mp3")
const se_glass = new Iaudio("sounds/break.wav").setVolume(0.5)
const se_glass_reverse = new Iaudio("sounds/break^-1.wav")
// const se_jump = new Iaudio("sounds/se_touch.wav")
const se_select = new Iaudio("sounds/カーソル移動2.mp3")
const se_gravity = new Iaudio("sounds/se_break.wav").setVolume(0.5)
const se_ending = new Iaudio("sounds/se_touch.wav").setVolume(0.5)

const bgm_test = new IBGM("sounds/試作30.m4a")
const bgm_extra = new IBGM("sounds/試作31.m4a")
const bgm_ame = new IBGM("sounds/街を襲う集中豪雨.mp3")

// const img_kandata = new Iimage("images/kandata.png", 0, 0, 100, 100)
// const img_buddha = new Iimage("images/buddha.webp", 0, 0, 1000, 1000, { alpha: 0.1 })
const img_mandara = new Iimage("images/bg.png", 420, 230, 500, 500, { alpha: 0.1 })
