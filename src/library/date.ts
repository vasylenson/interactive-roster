export function addWeek(date: Date) {
    date.setDate(date.getDate() + 7);
}

export function isStartOfMonth(date: Date): boolean {
    return date.getDate() <= 7;
}