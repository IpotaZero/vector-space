const IBGM = class {
    constructor(src, { loopStart = null, loopEnd = null } = {}) {
        this.src = src
        this.loopStart = loopStart
        this.loopEnd = loopEnd
        this.context = new AudioContext()
        this.context.suspend()

        this.gain = this.context.createGain()
        this.gain.connect(this.context.destination)

        // AnalyserNodeを作成
        this.analyser = this.context.createAnalyser()
        this.analyser.fftSize = 64 // FFTサイズを設定（データの解像度）
        this.frequency_data_array = new Uint8Array(this.analyser.frequencyBinCount)
        this.gain.connect(this.analyser)

        this.volume = 1
        this.isReversed = false // 逆再生状態を管理
        this.startTime = 0 // 再生開始時間
        this.pauseTime = 0 // 一時停止位置
    }

    isPlaying() {
        return this.context.state == "running"
    }

    // 音源を読み込む
    async fetch() {
        const response = await fetch(this.src)
        const arrayBuffer = await response.arrayBuffer()
        this.audioBuffer = await this.context.decodeAudioData(arrayBuffer)
    }

    // 再生中の現在の位置を取得
    getCurrentTime() {
        const elapsed = this.context.currentTime - this.startTime
        return this.isReversed
            ? this.audioBuffer.duration - (elapsed % this.audioBuffer.duration)
            : (this.audioBuffer.duration + elapsed) % this.audioBuffer.duration
    }

    // AudioBufferを反転させる（逆再生用）
    reverseBuffer(buffer) {
        const reversedBuffer = this.context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate)

        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const originalData = buffer.getChannelData(channel)
            const reversedData = reversedBuffer.getChannelData(channel)
            for (let i = 0; i < originalData.length; i++) {
                reversedData[i] = originalData[originalData.length - i - 1]
            }
        }

        return reversedBuffer
    }

    // 最初のplay前の処理
    reset(startPosition = 0) {
        if (this.audio != null) {
            this.audio.stop()
            this.audio.disconnect()
            this.audio.onended = undefined
        }

        this.audio = this.context.createBufferSource()
        this.audio.buffer = this.isReversed ? this.reverseBuffer(this.audioBuffer) : this.audioBuffer

        this.audio.loop = true
        this.audio.loopStart = this.loopStart ?? 0
        this.audio.loopEnd = this.loopEnd ?? this.audioBuffer?.duration ?? 10000
        this.audio.connect(this.gain)

        // 再生開始時間を調整
        const offset = this.isReversed ? this.audioBuffer.duration - startPosition : startPosition

        this.audio.start(0, offset)
        this.startTime = this.context.currentTime - startPosition
    }

    play() {
        this.gain.gain.value = this.volume
        return this.context.resume()
    }

    pause() {
        this.pauseTime = this.getCurrentTime() // 一時停止位置を記録
        return this.context.suspend()
    }

    setVolume(volume) {
        if (volume != null) this.volume = volume
        this.gain.gain.value = this.volume
    }

    fade(value, second) {
        this.gain.gain.cancelScheduledValues(0)
        this.gain.gain.exponentialRampToValueAtTime(value, this.context.currentTime + second)

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, second * 1000)
        })
    }

    // 再生方向を切り替える
    reversePlayback() {
        this.gain.gain.value = 0.01
        this.fade(this.volume, 2.5)
        const currentTime = this.getCurrentTime() // 現在の再生位置を取得
        this.isReversed = !this.isReversed // 再生方向を反転
        this.reset(currentTime) // 現在の位置から再生
    }

    // 周波数データを描画するメソッド
    drawFrequency(ctx, colour, x, y, radius_in, radius_ex) {
        if (this.context.state == "suspended") return

        const buffer_length = this.analyser.frequencyBinCount
        const data_array = new Uint8Array(buffer_length)
        this.analyser.getByteFrequencyData(data_array)

        // 円の中心と半径を設定
        const center = vec(x, y)
        const bar_width = (Math.PI * 2) / buffer_length // 1本のバーが占める角度

        ctx.save()

        ctx.strokeStyle = colour // 色を変更
        ctx.lineWidth = 2

        const d = 16
        const lv = 1.5
        const bar_height = (radius_ex - radius_in) / lv / d

        for (let i = 0; i < buffer_length; i++) {
            const num = Math.floor(data_array[i] / (256 / d)) // 高さを周波数データに基づいて決定

            // 各バーの角度を計算
            const angle = i * bar_width

            const direction = vec(1, 0).rot(angle)
            const direction2 = vec(1, 0).rot(angle + (bar_width * 3) / 4)

            for (let i = 0; i < num; i++) {
                const start = center.add(direction.mlt(radius_in + bar_height * i * lv))
                const end = center.add(direction.mlt(radius_in + bar_height * (i * lv + 1)))
                const start2 = center.add(direction2.mlt(radius_in + bar_height * i * lv))
                const end2 = center.add(direction2.mlt(radius_in + bar_height * (i * lv + 1)))

                // 描画
                ctx.beginPath()
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(end.x, end.y)
                ctx.lineTo(end2.x, end2.y)
                ctx.lineTo(start2.x, start2.y)
                ctx.closePath()

                ctx.stroke()
            }
        }

        ctx.restore()
    }
}
