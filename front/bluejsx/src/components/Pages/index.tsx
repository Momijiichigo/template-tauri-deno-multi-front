import { FuncCompParam, useConstProps } from "bluejsx"
import style from './index.module.scss'

export default ({ children }: FuncCompParam<{}>) => {
    const self = <div class={style.container}>
        {children}
    </div>
    const selfStyle = self.style
    let currentPage = 0
    // children.forEach(child => {
    //     const { style } = child
    //     // selfStyle.filter = 'blur(10px)'
    // })
    useConstProps(self, {
        switchPage(index: number){
            children[currentPage].classList.remove(style.focus)
            // selfStyle.filter = 'blur(0px)'
            children[index].classList.add(style.focus)
            currentPage = index
        }
    })
    self.switchPage(0)
    return self

}