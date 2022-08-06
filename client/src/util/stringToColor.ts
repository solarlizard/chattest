
const hashFnv32a = (str : string) : number => {
    let i = 0
    let l = 0
    let hval = 0x811c9dc5

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt (i)
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
    }

    return hval >>> 0
}

export const stringToHslColor = (s : string) : string => `hsl(${hashFnv32a (s) % 360}, 75%, 67%)`
