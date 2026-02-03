export default {
    sessionExpired: {
        severity: 'error',
        summary: 'Sesión expirada',
        detail: 'La sesión ha expirado. Por favor, inicie sesión nuevamente',
        life: 4000
    },
    noSession: {
        severity: 'error',
        summary: 'No hay sesión activa',
        detail: 'Por favor, inicie sesión antes de ingresar a esta sección',
        life: 4000
    },
    invalidSession: {
        severity: 'error',
        summary: 'Sesión inválida',
        detail: 'Los datos de la sesión están corruptos. Por favor, inicie sesión nuevamente',
        life: 4000
    },
    noPatientSelected: {
        severity: 'error',
        summary: 'Sin paciente seleccionado',
        detail: 'Por favor, seleccione un paciente antes de ingresar a esta sección',
        life: 4000
    },
    patientsLoaded: (doctor) => ({
        severity: 'success',
        summary: 'Pacientes cargados',
        detail: `Se cargaron los pacientes de ${doctor.name} ${doctor.lastname}`,
        life: 2500
    }),
    roomsLoaded: (doctor) => ({
        severity: 'success',
        summary: 'Habitaciones cargadas',
        detail: `Se cargaron las habitaciones de ${doctor.name} ${doctor.lastname}`,
        life: 2500
    }),
    completeAllFields: {
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Completa todos los campos para continuar',
        life: 2500
    },
    dataSaved: {
        severity: 'success',
        summary: 'Datos guardados',
        detail: 'Los datos se han guardado correctamente',
        life: 2500
    },
    dataUpdated: {
        severity: 'success',
        summary: 'Datos actualizados',
        detail: 'Los datos se han actualizado correctamente',
        life: 2500
    },
    termsAccepted: {
        severity: 'success',
        summary: 'Términos aceptados',
        detail: 'Gracias por aceptar los términos y condiciones, te damos la bienvenida a Somapp',
        life: 2500
    },


    errorLoading: (field, detail = null, life=2500) =>
        ({severity: 'error', summary: `Error al cargar ${field}`, detail, life}),
    errorSaving: (field, detail = null, life=2500) =>
        ({severity: 'error', summary: `Error al guardar ${field}`, detail, life}),
    errorDeleting: (field, detail = null, life=2500) =>
        ({severity: 'error', summary: `Error al eliminar ${field}`, detail, life}),


    success: (summary, detail = null, life=2500) =>
        ({severity: 'success', summary, detail, life}),
    warn: (summary, detail = null, life=4000) =>
        ({severity: 'warn', summary, detail, life}),
    error: (summary, detail = null, life=4000) =>
        ({severity: 'error', summary, detail, life}),
    info: (summary, detail = null, life=4000) =>
        ({severity: 'info', summary, detail, life}),
    contrast: (summary, detail = null, life=4000) =>
        ({severity: 'contrast', summary, detail, life}),
}