import { FuncCompParam, useAttrs } from "bluejsx"
import style from "./index.module.scss"

const HALF_MARK_WIDTH = 35
export default ({ children }: FuncCompParam<{}>) => {
    const self = <div class={style.menu}>

        <div class={style.mark_container}>
            <div class={`${style.dot} ${style.pointer}`} ref='pointerDot'></div>
            <div class={`${style.dot} ${style.mark}`} ref='markDot'></div>
        </div>
        <div class={style.bar}>
            {children}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="0" height="0">
            <defs>
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -5" id='colorMatrix' />
                </filter>
            </defs>
        </svg>
    </div>
    const { pointerDot, markDot } = self.refs<{
        pointerDot: 'div'
        markDot: 'div'
    }>()

    const numItems = children.length
    const markSpace = 50 / numItems
    const markSpaceT2 = markSpace * 2
    useAttrs(self, {
        pageSetter(index: number) { },
        currentPage: 0
    })
    const onTouch = (event: TouchEvent) => {
        const x = event.changedTouches[0].clientX
        pointerDot.style.transform = `translateX(${x - HALF_MARK_WIDTH}px)`
        // pointerDot.style.transform = `translateX(${x - self.clientWidth}px)`

        const index = x / self.clientWidth * numItems | 0
        self.pageSetter(index)
        if (self.currentPage !== index) {
            self.currentPage = index
        }
    }
    self.watch('currentPage', index => {
        markDot.style.transform = `translateX(calc(${index * markSpaceT2 + markSpace}vw - ${HALF_MARK_WIDTH}px))`
    })
    self.ontouchmove = onTouch
    self.ontouchend = (e) => {
        onTouch(e)
        pointerDot.classList.add(style.released)
        pointerDot.style.transform = `translateX(calc(${self.currentPage * markSpaceT2 + markSpace}vw - ${HALF_MARK_WIDTH}px))`
    }
    self.ontouchstart = () => {
        pointerDot.classList.remove(style.released)
    }
    pointerDot.style.transform = `translateX(calc(${self.currentPage * markSpaceT2 + markSpace}vw - ${HALF_MARK_WIDTH}px))`
    return self
}



