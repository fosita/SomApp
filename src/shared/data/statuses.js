import userRoles from "@/shared/data/user.roles.js";
const nullStatus = { id: 0, name: '-', colour: '#9e9e9e', patient: 0, doctor: 0 };
export function getAvailableStatuses(userType, currentStatus, statuses) {
    if (userType !== userRoles.patient && userType !== userRoles.doctor)
        throw new Error('Tipo de usuario inválido. Usa "userRoles.patient" o "userRoles.doctor".');
    if (!currentStatus) currentStatus = nullStatus;
    if (typeof currentStatus === 'number') currentStatus = statuses.find(s => s.id === currentStatus) || nullStatus;

    const otherType = userType === userRoles.patient ? 'doctor' : 'patient';
    const targetValue = currentStatus[otherType];

    return statuses.filter(s => s[otherType] === targetValue);
}