export const nullToNothing = (content : string | null) => {
    if (content) {
        return content
    }
    else {
        return ""
    }
}
