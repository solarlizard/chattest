
export const formatDateDiff = (date1 : Date, date2 : Date) : string => {

    if (date2.getTime() < date1.getTime ()) {
        return formatDateDiff (date2, date1)
    }
    else {

        const getNumberedLiteral = (value : number, literal : string) => {
            if (value > 1) {
                return `${value} ${literal}s ago`
            }
            else {
                return `${value} ${literal} ago`
            }
        }
        
        const yearDiff = date2.getFullYear () - date1.getFullYear ()

        if (yearDiff >= 1) {
            return getNumberedLiteral (yearDiff, 'year')
        }

        const monthDif = date2.getMonth () - date1.getMonth ()
        
        if (monthDif >= 1) {
            return getNumberedLiteral (yearDiff, 'month')
        }

        const dayDiff = date2.getDay () - date1.getDay ()
        
        if (dayDiff >= 1) {
            return getNumberedLiteral (dayDiff, 'day')
        }

        const hourDiff = date2.getHours () - date1.getHours ()
        
        if (hourDiff >= 1) {
            return getNumberedLiteral (hourDiff, 'hour')
        }

        const minuteDiff = date2.getMinutes () - date1.getMinutes ()
        
        if (minuteDiff >= 1) {
            return getNumberedLiteral (minuteDiff, 'minute')
        }

        const secondDiff = date2.getSeconds () - date1.getSeconds ()
        
        if (secondDiff >= 1) {
            return getNumberedLiteral (secondDiff, 'second')
        }   
        
        return "now"
    }
}