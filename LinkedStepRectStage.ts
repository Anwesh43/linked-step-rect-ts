const w : number = window.innerWidth, h : number = window.innerHeight, LSR_NODES : number = 5
class LinkedStepRectStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    lsr : LinkedStepRect = new LinkedStepRect()

    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lsr.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lsr.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lsr.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedStepRectStage = new LinkedStepRectStage()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scales : Array<number> = [0, 0, 0, 0]

    prevScale : number = 0

    dir : number = 0

    j : number = 0

    update(stopcb : Function) {
        this.scales[this.j] += 0.1 * this.dir
        console.log(this.scales)
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.scales[this.j] = this.prevScale + this.dir
            this.j += this.dir
            if (this.j == this.scales.length || this.j == -1) {
                this.j -= this.dir
                this.dir = 0
                this.prevScale = this.scales[this.j]
                stopcb()
            }
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {

    animated : boolean = false

    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LSRNode {

    prev : LSRNode

    next : LSRNode

    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < LSR_NODES - 1) {
            this.next = new LSRNode(this.i+1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const h_gap : number = (0.9 * h / LSR_NODES), w_gap : number = ((0.9 * w) / LSR_NODES), size : number = Math.min(w_gap, h_gap)/5
        context.save()
        context.translate(this.i * w_gap + size/2, this.i * h_gap + size/2)
        context.fillStyle = '#FF6F00'
        const x : number = (w_gap + size/2) * this.state.scales[1], w_rect : number = size + (w_gap - size) * this.state.scales[0] * (1 -this.state.scales[1])
        const y : number = (h_gap + size/2) * this.state.scales[3], h_rect : number = size + (h_gap - size) * this.state.scales[2] * (1 -this.state.scales[3])
        context.fillRect(x, y, w_rect, h_rect)
        context.restore()
    }

    getNext(dir : number, cb : Function) {
        var curr : LSRNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }
}

class LinkedStepRect {

    curr : LSRNode = new LSRNode(0)

    dir : number = 1
    constructor() {
        console.log(this.curr)
    }
    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
