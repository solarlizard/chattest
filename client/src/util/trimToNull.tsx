export const trimToNull = (content : string | null) => {
    if (content) {
        const trimmed = content.trim ()

        if (trimmed.length === 0) {
            return null
        }
        else {
            return trimmed
        }
    }
    else {
        return null
    }
}
