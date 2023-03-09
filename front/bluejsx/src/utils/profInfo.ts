import { EnumBase } from 'rusty-enums'
export class Sex extends EnumBase<{
    Male: undefined,
    Female: undefined,
    Other: string,
    Undeclared: undefined
}> {
    static Male = new Sex("Male", undefined)
    static Female = new Sex("Female", undefined)
    static Undeclared = new Sex("Undeclared", undefined)
    static Other(categ: string){
        return new Sex("Other", categ)
    }
}

export interface ProfInfo {
    name: string
    id: string
    sex: Sex
}