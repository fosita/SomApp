const db = require('../sequelize.cjs');


module.exports = {
    async findAll() { return await db.PredictionParams.findAll() },
    async findById(id) { return await db.PredictionParams.findByPk(id) },
    async findByDoctorId(doctorId) {
        return await db.PredictionParams.findAll({ where: { doctorId }, raw: true });
    },
    async findByPatientId(patientId) {
        return await db.PredictionParams.findAll({ where: { patientId }, raw: true });
    },
    async create(patientId, doctorId, params) {
        if (!patientId || isNaN(Number(patientId))) throw new Error('ID de paciente inválido');
        if (!doctorId || isNaN(Number(doctorId))) throw new Error('ID de doctor inválido');
        return await db.PredictionParams.create({ ...params, patientId, doctorId });
    },
    async update(id, updatedData) {
        const params = await db.PredictionParams.findByPk(id);
        if (!params) throw new Error('Error al obtener parámetros de predicción')
        Object.assign(params, updatedData);

        return await params.save();
    }
};