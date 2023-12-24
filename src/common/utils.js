export function dateToYMD(date) {
    let d = date.getDate();
    let m = date.getMonth() + 1;
    let y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

export function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

export function dateDelta(d, targetDay)
{
    let date = new Date(d);
    let delta = targetDay - date.getDay();

    delta >= 0 ? date.setDate(date.getDate() + delta) : date.setDate(date.getDate() + 7 + delta)
    
    return date
}