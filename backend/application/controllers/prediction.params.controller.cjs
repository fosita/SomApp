const repository = require('../../infrastructure/repositories/prediction.params.repository.cjs');

module.exports = {
    async create(req, res) {
        try {
            const { patientId, doctorId, params } = req.body;
            if (!patientId || isNaN(Number(patientId))) {
                return res.status(400).json({ error: 'ID de paciente inválido' });
            }
            if (!doctorId || isNaN(Number(doctorId))) {
                return res.status(400).json({ error: 'ID de doctor inválido' });
            }
            if (!params || typeof params !== 'object') {
                return res.status(400).json({ error: 'Parámetros inválidos' });
            }

            const createdParams = await repository.create(Number(patientId), Number(doctorId), params);
            res.status(201).json(createdParams);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { id, updatedData } = req.body;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            if (!updatedData || typeof updatedData !== 'object') {
                return res.status(400).json({ error: 'Datos de actualización inválidos' });
            }

            const updatedParams = await repository.update(Number(id), updatedData);
            res.status(200).json(updatedParams);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findAll(req, res) {
        try {
            const params = await repository.findAll();
            res.status(200).json(params);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findAllByDoctorId(req, res) {
        try {
            const { doctorId } = req.params;
            if (!doctorId || isNaN(Number(doctorId))) {
                return res.status(400).json({ error: 'ID de doctor inválido' });
            }

            const params = await repository.findByDoctorId(Number(doctorId));
            res.status(200).json(params);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const param = await repository.findById(Number(id));
            res.status(200).json(param);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findAllByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            if (!patientId || isNaN(Number(patientId))) {
                return res.status(400).json({ error: 'ID de paciente inválido' });
            }

            const params = await repository.findByPatientId(Number(patientId));
            res.status(200).json(params);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};