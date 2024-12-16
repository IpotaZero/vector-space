const gcd = (x, y) => (x % y ? gcd(y, x % y) : y)

const range = (count) => [...Array(count).keys()]

const Irotate = (width, height, angle, func) => {
    const cvs = document.createElement("canvas")
    cvs.width = width
    cvs.height = height
    const ctx = cvs.getContext("2d")

    const x = -width / 2
    const y = -height / 2

    ctx.translate(cvs.width / 2, cvs.height / 2)
    ctx.rotate(angle)

    func(ctx, x, y)

    ctx.translate(-cvs.width / 2, -cvs.height / 2)

    return cvs
}

const Isetfont = (ctx, font, font_size, baseline, text_align, letter_spacing) => {
    ctx.font = font_size + "px " + font

    ctx.textBaseline = baseline
    ctx.textAlign = text_align
    ctx.letterSpacing = letter_spacing
}

const Iadjust = (ctx, max_width, text) => {
    let jtext = ""
    let width = 0
    for (let i = 0; i < text.length; i++) {
        const char = text[i]

        if (char == ";") {
            width = 0
            jtext += char

            continue
        }

        const char_width = ctx.measureText(char).width

        if (char == "<") {
            jtext += char
            i++
            let comma_flag = true
            while (i < text.length) {
                const char = text[i]
                jtext += char

                if (char == ">") {
                    break
                }

                i++

                if (char == ",") {
                    comma_flag = false
                    continue
                }

                if (comma_flag) {
                    const size = ctx.measureText(char).width
                    width += size
                }
            }

            continue
        }

        width += char_width
        if (width > max_width) {
            jtext += ";"
            width = char_width
        }

        jtext += char
    }

    return jtext
}

const Itext = (
    ctx,
    colour,
    font,
    font_size,
    x,
    y,
    text,
    {
        theta = 0,
        frame = 10000,
        max_width = 10000,
        max_line_num = 10000,

        text_align = "left",
        baseline = "top",
        line_spacing = 0,
        letter_spacing = "0px",

        outline_colours = [],
        outline_width = 2,

        se = null,
        transparent = false,
    } = {},
) => {
    // 表示方法の設定
    ctx.fillStyle = colour
    if (transparent) ctx.globalAlpha = frame / text.length / 2
    Isetfont(ctx, font, font_size, baseline, text_align, letter_spacing)

    // frameの値に基づいてテキストを切り取る
    const display_text = ("" + text).substring(0, frame)

    // max_widthを超えると;が挿入される
    let adjusted_text = Iadjust(ctx, max_width, display_text)

    // %が来たら今までのを無視する
    if (adjusted_text.includes("%")) {
        const sp = adjusted_text.split("%")
        adjusted_text = sp[sp.length - 1].substring(0, frame - sp.slice(0, -1).join("").length)
    }

    // 改行文字で分割
    const lines = adjusted_text.split(";").slice(0, max_line_num)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(theta)

    ctx.beginPath()

    // 各行を描画
    lines.forEach((line, index) => {
        const parts = [""]

        for (const letter of line) {
            if (letter == "<") parts.push("")
            parts[parts.length - 1] += letter
            if (letter == ">") parts.push("")
        }

        let current_x = 0
        const current_y = index * (font_size + line_spacing)

        parts.forEach((part) => {
            if (part.match(/<.*/)) {
                // <base,ruby> 形式の場合
                const [base_text, ruby_text] = part.replaceAll(/<|>/g, "").split(",")

                if (ruby_text != null) {
                    // ルビ描画
                    const base_text_width = ctx.measureText(base_text).width
                    const ruby_text_width = ctx.measureText(ruby_text).width

                    Itext(
                        ctx,
                        colour,
                        font,
                        font_size / 2,
                        current_x + base_text_width / 2 - ruby_text_width / 4,
                        current_y - font_size / 2,
                        ruby_text,
                        {
                            frame: frame,
                            text_align: "left",
                            outline_colours: outline_colours,
                            outline_width: outline_width,
                            transparent: transparent,
                        },
                    )

                    Isetfont(ctx, font, font_size, baseline, text_align, letter_spacing + "px")
                }

                part = base_text
            }

            // 通常のテキスト
            for (let j = outline_colours.length - 1; j >= 0; j--) {
                ctx.strokeStyle = outline_colours[j]
                ctx.lineWidth = outline_width * (j + 1)
                ctx.strokeText(part, current_x, current_y)
            }

            ctx.fillText(part, current_x, current_y)
            current_x += ctx.measureText(part).width
        })
    })

    ctx.globalAlpha = 1

    if (se != null) {
        if (frame < text.length) se.play()
    }

    ctx.restore()
}

const Iarc = (ctx, colour, x, y, r, { start = 0, end = 2 * Math.PI, line_width = 0 } = {}) => {
    ctx.beginPath()
    ctx.arc(x, y, r, start, end)

    if (line_width == 0) {
        ctx.fillStyle = colour
        ctx.fill()
    } else {
        ctx.strokeStyle = colour
        ctx.lineWidth = line_width
        ctx.stroke()
    }
}

const Ipolygon = (ctx, vertices, density, x, y, r, colour, { theta = 0, line_width = 2 } = {}) => {
    ctx.beginPath()
    const g = gcd(vertices, density)
    vertices /= g
    density /= g

    ctx.lineCap = "square"

    for (let h = 0; h < g; h++) {
        const first = vec(x, y).add(vec(0, -r).rot(theta + (2 * Math.PI * h) / g / vertices))
        ctx.moveTo(first.x, first.y)

        const angle = (2 * Math.PI * density) / vertices
        for (let i = 1; i <= vertices; i++) {
            const to = vec(x, y).add(vec(0, -r).rot(theta + angle * i + (2 * Math.PI * h) / g / vertices))
            ctx.lineTo(to.x, to.y)
        }
    }

    ctx.closePath()

    ctx.strokeStyle = colour
    ctx.lineWidth = line_width
    ctx.stroke()
}

const Irect = (ctx, colour, x, y, width, height, { line_width = 0 } = {}) => {
    ctx.beginPath()

    if (line_width == 0) {
        ctx.fillStyle = colour
        ctx.fillRect(x, y, width, height)
    } else {
        ctx.strokeStyle = colour
        ctx.lineWidth = line_width
        ctx.strokeRect(x, y, width, height)
    }
}

const Iline = (ctx, colour, line_width, joints) => {
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.lineWidth = line_width

    joints.forEach((j, i) => {
        if (i == 0) {
            ctx.moveTo(j.x, j.y)
            return
        }

        ctx.lineTo(j.x, j.y)
    })

    ctx.stroke()
}

const Ibutton = (
    ctx,
    colour,
    font,
    font_size,
    x,
    y,
    width,
    height,
    text,
    {
        line_width = 2,
        frame = 10000,
        text_align = "left",
        baseline = "top",
        outline_colours = [],
        outline_width = 0,
        transparent = false,
        clicking = false,
        selected = false,
    } = {},
) => {
    let x_ = x

    if (text_align == "center") x_ = x + width / 2

    const P = mouse.p

    ctx.save()

    if (x <= P.x && P.x <= x + width && y <= P.y && P.y <= y + height) {
        cvsSub.style.cursor = "pointer"

        if (clicking ? mouse.clicking : mouse.clicked) {
            return true
        }

        ctx.shadowBlur = 10
        ctx.shadowColor = colour
    }

    if (selected) {
        ctx.shadowBlur = 10
        ctx.shadowColor = colour
    }

    if (line_width > 0)
        Irect(ctx, colour, x, y, width, height, {
            line_width: line_width,
        })

    Itext(ctx, colour, font, font_size, x_, y + 2, text, {
        frame: frame,
        text_align: text_align,
        outline_colours: outline_colours,
        outline_width: outline_width,
        transparent: transparent,
        baseline: baseline,
    })

    ctx.restore()

    return false
}

const Iscroll = (x, y, width, height) => {
    if (x < mouse.p.x && mouse.p.x < x + width && y < mouse.p.y && mouse.p.y < y + height) {
        if (mouse.deltaY > 30) return -1
        if (mouse.deltaY < -30) return 1
    }

    return 0
}

const Irange = (ctx, colour, font, font_size, x, y, value, { outline_colours = [], outline_width = 0 } = {}) => {
    const is_clicked_left = Ibutton(ctx, colour, font, font_size, x, y, font_size, font_size, "◁", {
        line_width: 0,
        outline_colours: outline_colours,
        outline_width: outline_width,
    })
    const is_clicked_right = Ibutton(ctx, colour, font, font_size, x + font_size * 2, y, font_size, font_size, "▷", {
        line_width: 0,
        outline_colours: outline_colours,
        outline_width: outline_width,
    })

    const sc = Iscroll(x + font_size, y, font_size, font_size)

    Itext(ctx, colour, font, font_size, x + font_size * 1.5, y, value, {
        outline_colours: outline_colours,
        outline_width: outline_width,
        text_align: "center",
    })

    if (sc != 0) return sc

    if (is_clicked_left) return -1
    if (is_clicked_right) return 1

    return 0
}

const ILoop = (a = null, b, f) => {
    //aをコピー
    let arr = [...a]

    while (arr.join() != b.join()) {
        f(...arr)
        arr[arr.length - 1]++
        for (let i = arr.length - 1; i != 0; i--) {
            if (arr[i] > b[i]) {
                arr[i] = a[i]
                arr[i - 1]++
            }
        }
    }

    f(...arr)
}

console.log("Ifunctions.js is loaded")
