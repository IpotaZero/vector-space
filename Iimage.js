const Iimage = class {
    constructor(
        path,
        x = 0,
        y = 0,
        width,
        height,
        {
            alpha = 1,
            rotate = 0,
            center_x = 0,
            center_y = 0,
            repeat_x = 1,
            repeat_y = 1,
            reverse_x = false,
            chromaKey = null,
            composite_operation = null,
        } = {},
    ) {
        const p = path.split(".")
        const extension = p[p.length - 1]

        const images = []

        if (extension == "apng") {
            this.type = "apng"
            APNG.parseURL(path).then((apngObject) => {
                apngObject.frames.forEach((e) => {
                    images.push(e.img)
                })
            })
        } else {
            this.type = "not_anime"
            images.push(new Image())
            images[0].src = path
        }

        images[images.length - 1].onload = () => {
            this.images = []

            images.forEach((image) => {
                const canvas = document.createElement("canvas")
                canvas.width = image.width
                canvas.height = image.height
                // console.log(image.width, image.height)

                const ctx = canvas.getContext("2d")

                ctx.drawImage(image, 0, 0)

                if (chromaKey != null) {
                    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height)

                    const data = image_data.data

                    for (let i = 0; i < data.length; i += 4) {
                        // console.log(data.slice(i, i + 3).join())
                        if (data.slice(i, i + 3).join() == chromaKey) {
                            data[i + 3] = 0
                        }
                    }

                    ctx.putImageData(image_data, 0, 0)
                }

                this.images.push(canvas)
            })
        }

        this.frame = 0

        this.width = width
        this.height = height
        this.alpha = alpha
        this.composite_operation = composite_operation

        this.rotate = rotate
        this.center_x = center_x
        this.center_y = center_y

        this.repeat_x = repeat_x
        this.repeat_y = repeat_y

        this.x = x
        this.y = y

        this.reverse_x = reverse_x
    }

    draw(ctx, { x, y, alpha, composite_operation } = {}) {
        // コンテキストを保存する
        ctx.save()

        ctx.globalAlpha = alpha ?? this.alpha
        if (this.composite_operation != null) ctx.globalCompositeOperation = this.composite_operation
        if (composite_operation != null) ctx.globalCompositeOperation = composite_operation

        const unit_width = this.width / this.repeat_x
        const unit_height = this.height / this.repeat_y

        if (this.reverse_x) {
            ctx.transform(-1, 0, 0, 1, 0, 0)
        }

        ILoop([0, 0], [this.repeat_x - 1, this.repeat_y - 1], (i, j) => {
            let real_x = (x ?? this.x) - this.center_x + unit_width * i
            let real_y = (y ?? this.y) - this.center_y + unit_height * j

            if (this.reverse_x) {
                real_x = -real_x - unit_width
            }

            // console.log(this.image[this.frame])

            ctx.drawImage(this.images[this.frame], real_x, real_y, unit_width, unit_height)
        })

        if (this.images.length > 1) {
            this.frame = (this.frame + 1) % (this.images.length - 1)
        }
        // // コンテキストを元に戻す
        ctx.restore()
    }
}
