const suuji = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

// 博士の異常な行数 または私は如何にして心配するのを止めて神クラスを愛するようになったか

const Icommand = class {
    constructor(
        ctx,
        font,
        font_size,
        colour,
        x,
        y,
        options,

        {
            titles = new RegExDict({}),
            outline_colours = [],
            outline_width = 0,
            max_line_num = 10000,
            transparent = false,
        } = {},
    ) {
        this.ctx = ctx
        this.font = font
        this.font_size = font_size
        this.colour = colour
        this.x = x
        this.y = y
        this.options = options

        this.outline_colours = outline_colours
        this.outline_width = outline_width
        this.transparent = transparent
        this.max_line_num = max_line_num
        this.titles = titles

        this.branch = ""
        this.num = 0
        this.position = 0

        this.is_operable = true

        this.init_range_values(options)
        this.init_toggle_values(options)
    }

    init_range_values(options) {
        this.range_value = new RegExDict({})

        for (let key in options.dict) {
            for (let option of options.dict[key]) {
                if (typeof option != "string" && option.length == 4) {
                    this.range_value.dict[key] ??= []
                    this.range_value.dict[key].push(option[1])
                }
            }
        }
    }

    init_toggle_values(options) {
        this.toggle_value = new RegExDict({})

        for (let key in options.dict) {
            for (let option of options.dict[key]) {
                if (typeof option != "string" && option.length == 2) {
                    this.toggle_value.dict[key] ??= []
                    this.toggle_value.dict[key].push(option[1])
                }
            }
        }
    }

    run(frame = 10000) {
        this.is_selected = false

        if (this.handle_cancel()) return

        this.draw_title(frame)

        const option = this.options.get(this.branch)

        if (option == null) return

        this.solve_options(option, frame)

        this.receive_updown()
    }

    solve_options(option, frame) {
        if (typeof option == "string") {
            this.draw_text(option)
            return
        }

        this.draw_option(option, frame)
    }

    receive_updown() {
        if (keyboard.longPressed.has("ArrowDown")) {
            this.down()
            se_select.play()
        } else if (keyboard.longPressed.has("ArrowUp")) {
            this.up()
            se_select.play()
        }

        // console.log(this.num, this.position)
    }

    scroll() {
        const option = this.options.get(this.branch)

        // スクロールの必要がなければ帰れ
        if (option.length <= this.max_line_num) return

        if (this.num - this.position == this.max_line_num - 1) this.position++

        if (this.position > option.length - this.max_line_num) this.position = option.length - this.max_line_num

        if (this.num == 0) {
            this.position = 0
            return
        }

        if (this.num - this.position <= 0) this.position--

        if (this.num - this.position > this.max_line_num) {
            this.position = option.length - this.max_line_num
            return
        }

        // console.log(this.num, this.position)
    }

    handle_cancel() {
        if (this.is_operable && (keyboard.pushed.has("cancel") || mouse.right_clicked) && this.branch !== "") {
            this.cancel()
            // se_cancel.play()
            return true
        }
        return false
    }

    draw_title(frame) {
        const title = this.titles.get(this.branch)
        if (title == null) return

        Itext(this.ctx, this.colour, this.font, this.font_size, this.x, this.y, title, {
            frame,
            outline_colours: this.outline_colours,
            outline_width: this.outline_width,
            transparent: this.transparent,
        })
    }

    draw_text(text) {
        Itext(this.ctx, this.colour, this.font, this.font_size, this.x, this.y, text, {
            outline_colours: this.outline_colours,
            outline_width: this.outline_width,
        })
    }

    draw_line(text, i, frame, text_count) {
        if (text[0] == "!") text = text.substring(1)

        const width = this.ctx.measureText(text).width

        const is_selected = i == this.num - this.position

        const r = is_selected ? Math.random() / 24 + 1 : 1
        const r2 = is_selected ? Math.random() / 24 + 1 : 1

        const x = this.x + this.font_size * r
        const y = this.y + this.font_size * (i + r2)

        const is_clicked = Ibutton(
            this.ctx,
            this.colour,
            this.font,
            this.font_size,
            x,
            y,
            width,
            this.font_size,
            text,
            {
                line_width: 0,
                frame: frame - text_count,
                outline_colours: this.outline_colours,
                outline_width: this.outline_width,
                transparent: this.transparent,
                selected: is_selected,
            },
        )

        this.solve_scroll(x, y, width)

        return is_clicked
    }

    draw_dots(option, i, frame, text_count) {
        if (option.length <= this.max_line_num) return false

        if (i == this.max_line_num - 1 && this.position < option.length - this.max_line_num) {
            const is_clicked = this.draw_line("...", i, frame, text_count)

            if (is_clicked) {
                this.down()
                se_select.play()
            }

            return true
        }

        if (this.position > 0 && i == 0) {
            const is_clicked = this.draw_line("...", 0, frame, text_count)

            if (is_clicked) {
                this.up()
                se_select.play()
            }

            return true
        }
    }

    draw_range(text, i, j, frame, text_count) {
        const width = this.ctx.measureText(text[0]).width

        const is_selected = i == this.num - this.position

        const r = is_selected ? Math.random() / 24 + 1 : 1
        const r2 = is_selected ? Math.random() / 24 + 1 : 1

        const x = this.x + this.font_size * r
        const y = this.y + this.font_size * (i + r2)

        Itext(this.ctx, this.colour, this.font, this.font_size, x, y, text[0], {
            outline_colours: this.outline_colours,
            outline_width: this.outline_width,
            transparent: this.transparent,
            frame: frame - text_count,
        })

        const ranges = this.range_value.get(this.branch)

        let lr = 0
        if (frame - text_count > 0)
            lr = Irange(this.ctx, this.colour, this.font, this.font_size, x + width, y, ranges[j], {
                outline_colours: this.outline_colours,
                outline_width: this.outline_width,
            })

        if (i == this.num) {
            if (keyboard.longPressed.has("left")) lr--
            if (keyboard.longPressed.has("right")) lr++
        }

        ranges[j] += lr

        let se_flag = true

        if (ranges[j] > text[3]) {
            ranges[j] = text[3]
            se_flag = false
        }
        if (ranges[j] < text[2]) {
            ranges[j] = text[2]
            se_flag = false
        }

        if (lr != 0 && se_flag) se_select.play()

        this.solve_scroll(x, y, width)
    }

    draw_toggle(text, i, h, frame, text_count) {
        const tf = this.toggle_value.get(this.branch)[h]

        const is_clicked = this.draw_line(text[0] + ": " + (tf ? "ON" : "OFF"), i, frame, text_count)
        const is_pushed = i == this.num && keyboard.pushed.has("ok")

        if (!(is_clicked || is_pushed)) return

        this.toggle_value.get(this.branch)[h] = !this.toggle_value.get(this.branch)[h]

        se_select.play()
    }

    solve_scroll(x, y, width) {
        const sc = Iscroll(x, y, width, this.font_size)
        if (sc == 1) {
            this.up()
            se_select.play()
        } else if (sc == -1) {
            this.down()
            se_select.play()
        }
    }

    draw_option(option, frame) {
        Isetfont(this.ctx, this.font, this.font_size)

        let j = 0
        let h = 0

        let text_count = 0

        option.slice(this.position, this.position + this.max_line_num).forEach((text, i) => {
            if (this.draw_dots(option, i, frame, text_count)) return

            if (typeof text == "string") {
                const is_clicked = this.draw_line(text, i, frame, text_count)

                text_count += text.length

                if (this.is_selected) return

                const is_pushed = i + this.position == this.num && keyboard.pushed.has("ok")

                if (is_clicked || is_pushed) {
                    this.select(i + this.position)
                }
            } else {
                text_count += text[0].length

                if (this.is_selected) return

                if (text.length == 2) {
                    this.draw_toggle(text, i, h, frame, text_count)
                    h++
                } else if (text.length == 4) {
                    this.draw_range(text, i, j, frame, text_count)
                    j++
                }
            }
        })

        if (this.is_selected) return

        this.draw_arrow(frame)
    }

    draw_arrow(frame) {
        const cvs = Irotate(
            this.font_size,
            this.font_size,
            (Math.PI / 16) * Math.sin((frame - 10000) / 24),
            (ctx, x, y) => {
                Itext(ctx, this.colour, this.font, this.font_size, x, y, "→", {
                    outline_colours: this.outline_colours,
                    outline_width: this.outline_width,
                })
            },
        )

        this.ctx.drawImage(cvs, this.x, this.y + this.font_size * (this.num - this.position + 1))
    }

    is_match(key) {
        if (this.branch.match(new RegExp("^" + key + "$"))) {
            return true
        }

        return false
    }

    get_range_value() {
        return this.range_value.get(this.branch)
    }

    get_toggle_value() {
        return this.toggle_value.get(this.branch)
    }

    get_selected_num(num) {
        return suuji.indexOf(this.branch[num])
    }

    get_selected_option() {
        return this.options.get(this.branch.slice(0, -1))[this.branch.slice(-1)]
    }

    up() {
        const option = this.options.get(this.branch)
        if (option == null) return

        this.num += option.length - 1
        this.num %= option.length

        this.scroll()
    }

    down() {
        const option = this.options.get(this.branch)
        if (option == null) return

        this.num += 1
        this.num %= option.length

        this.scroll()
    }

    cancel(n = 1) {
        this.is_selected = true
        // 元の位置
        let num = 0
        for (let i = 0; i < n; i++) {
            if (this.branch == "") break

            num = suuji.indexOf(this.branch.charAt(this.branch.length - 1))
            this.branch = this.branch.slice(0, -1)
        }
        this.num = 0
        this.position = 0
        for (let i = 0; i < num; i++) this.down()
    }

    select(num) {
        this.branch += suuji[num]
        this.num = 0
        this.is_selected = true

        this.position = 0

        // if (this.get_selected_option()[0] != "!") se_ok.play()
    }

    reset() {
        this.branch = ""
        this.num = 0
        this.position = 0
    }
}
