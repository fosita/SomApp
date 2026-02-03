export function getMonthWeekLabel(date) {
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Encuentra el lunes más cercano hacia atrás (inicio de semana)
    const day = target.getDay(); // 0 (domingo) a 6 (sábado)
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(target);
    monday.setDate(target.getDate() + diffToMonday);

    // Año y mes del lunes (es a quien se le asigna la semana)
    const weekYear = monday.getFullYear();
    const weekMonth = monday.getMonth(); // 0-based

    // Buscar el primer lunes del mes
    const firstOfMonth = new Date(weekYear, weekMonth, 1);
    const firstDay = firstOfMonth.getDay();
    const firstMonday = new Date(firstOfMonth);
    const offsetToFirstMonday = (firstDay === 0 ? 1 : (8 - firstDay)) % 7;
    firstMonday.setDate(1 + offsetToFirstMonday);

    // Calcular número de semana
    const weekNumber = Math.floor((monday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

    return `${weekYear}-${weekMonth + 1}-${weekNumber}`;
}
export function getWeekDay(day){
    switch (day){
        case 0:
            return 'Lunes';
        case 1:
            return 'Martes';
        case 2:
            return 'Miércoles';
        case 3:
            return 'Jueves';
        case 4:
            return 'Viernes';
        case 5:
            return 'Sábado';
        case 6:
            return 'Domingo';
        default:
            return 'Día desconocido';
    }
}

export function getMonthName(month) {
    switch (month) {
        case 1:  return 'Enero';
        case 2:  return 'Febrero';
        case 3:  return 'Marzo';
        case 4:  return 'Abril';
        case 5:  return 'Mayo';
        case 6:  return 'Junio';
        case 7:  return 'Julio';
        case 8:  return 'Agosto';
        case 9:  return 'Septiembre';
        case 10: return 'Octubre';
        case 11: return 'Noviembre';
        case 12: return 'Diciembre';
        default: return 'Mes desconocido';
    }
}
