const repository = require('../../infrastructure/repositories/user.repository.cjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {HttpStatusCode} = require("axios");
const salt = Number(process.env.BCRYPT_SALT_ROUNDS);
const KEY = process.env.JWT_KEY;
const expiresIn = process.env.JWT_EXPIRES;
const logger = require('../../shared/utils/logger.util.cjs');
const {sendMessage} = require('../../infrastructure/whatsapp/waapi.manager.cjs');
module.exports = {
    async registerUser(req, res) {
        try {
            const { username, email, dniCe, password, phone } = req.body;
            const [exUser, exEmail, exDNI, exPhone] =
                await Promise.all([
                    repository.findByUsername(username),
                    repository.findByEmail(email),
                    repository.findByDNI(dniCe),
                    repository.findByPhone(phone),
                ]);

            if (exUser)  return res.status(HttpStatusCode.Conflict).json({ error: 'Usuario ya registrado' })
            if (exEmail) return res.status(HttpStatusCode.Conflict).json({ error: 'Correo electrónico ya registrado' })
            if (exDNI)   return res.status(HttpStatusCode.Conflict).json({ error: 'DNI/CEX ya registrado' })
            if (exPhone) return res.status(HttpStatusCode.Conflict).json({ error: 'Número de teléfono ya registrado' })

            const hashPassword = await bcrypt.hash(password, salt);

            const newUser = await repository.createUser({ hashPassword, ...req.body });
            //generate token for the new user
            newUser.token = jwt.sign({id: newUser.id, username: newUser.username}, KEY,{expiresIn});
            await repository.updateUser(newUser);

            //remove hashPassword from response
            delete newUser.hashPassword;
            res.status(HttpStatusCode.Created).json(newUser);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }) }
    },

    async loginUser(req, res) {
        try {
            const { username, password } = req.body;

            const user = await repository.findByUsername(username);
            if (!user) return res.status(HttpStatusCode.NotFound).json({ error: 'Usuario no encontrado' });

            const valid = await bcrypt.compare(password, user.hashPassword);
            if (!valid) return res.status(HttpStatusCode.Unauthorized).json({ error: 'Contraseña incorrecta' });

            if (!user) return res.status(HttpStatusCode.NotFound).json({ error: 'Usuario no encontrado' });

            // Generate a 6-digit OTP
            user.otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP válido por 10 minutos
            await repository.updateUser(user);

            console.log(user.otp)

            try { await sendMessage(user.phone, user.otp) }
            catch (e) { console.error(e) }

            //remove hashPassword from response
            delete user.hashPassword;
            delete user.otp;
            res.status(HttpStatusCode.Ok).json(user);
        } catch (err) { res.status(500).json({ error: err.message }); console.error(err) }
    },
    async validateOTP(req, res) {
        try {
            const {userId, otp} = req.body;
            const user = await repository.findById(userId);
            if (!user) return res.status(HttpStatusCode.NotFound).json({ error: 'Usuario no encontrado' });

            if (!user.otp) return res.status(HttpStatusCode.Unauthorized)
                    .json({error: 'El usuario no tiene OTP pendiente de validación'});

            if (new Date(user.otpExpiry).getTime() < Date.now()) {
                user.otp = null;
                user.otpExpiry = null;
                await repository.updateUser(user);
                return res.status(HttpStatusCode.Unauthorized).json({error: 'El OTP ha expirado'});
            }

            if (user.otp !== otp) {
                user.otp = null;
                user.otpExpiry = null;
                await repository.updateUser(user);
                return res.status(HttpStatusCode.Unauthorized).json({ error: 'OTP inválido' });
            }

            user.token = jwt.sign({id: user.id, username: user.username}, KEY,{expiresIn});
            user.otp = null;
            user.otpExpiry = null;
            await repository.updateUser(user);

            //remove hashPassword from response
            delete user.hashPassword;
            res.status(HttpStatusCode.Ok).json(user);
        } catch (err) { res.status(500).json({ error: err.message }); console.error(err) }
    },







    async updateUser(req, res) {
        try {
            let { userId } = req.params;
            const updates = req.body;

            userId = Number(userId)
            updates.id = userId;
            if (updates.password) {
                updates.hashPassword = await bcrypt.hash(updates.password, salt);
                delete updates.password;
            }

            const validateUsername = await repository.findByUsername(updates.username, true);
            if (validateUsername && validateUsername.id !== userId)
                return res.status(HttpStatusCode.Conflict).json({ error: 'El nombre de usuario ya está en uso', validateUsername });

            const validateEmail = await repository.findByEmail(updates.email);
            if (validateEmail && validateEmail.id !== userId)
                return res.status(HttpStatusCode.Conflict).json({ error: 'El correo electrónico ya está en uso' });

            const validateDNI = await repository.findByDNI(updates.dniCe);
            if (validateDNI && validateDNI.id !== userId)
                return res.status(HttpStatusCode.Conflict).json({ error: 'El DNI/CEX ya está en uso' });

            const validatePhone =  await repository.findByPhone(updates.phone);
            if (validatePhone && validatePhone.id !== userId)
                return res.status(HttpStatusCode.Conflict).json({ error: 'El número de teléfono ya está en uso' });

            const updatedUser = await repository.updateUser(updates);
            if (!updatedUser) return res.status(HttpStatusCode.NotFound).json({ error: 'Usuario no encontrado' });

            //remove hashPassword from response
            delete updatedUser.dataValues.hashPassword;
            res.status(HttpStatusCode.Ok).json(updatedUser);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }) }
    },

    async deactivateUser(req, res) {
        try {
            let { userId } = req.params;
            userId = Number(userId);

            const user = await repository.findById(userId);
            if (!user) return res.status(HttpStatusCode.NotFound).json({ error: 'Usuario no encontrado' });

            user.active = false;
            await repository.updateUser(user);
            res.status(HttpStatusCode.Ok).json({ message: 'Usuario desactivado correctamente' });
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }) }
    },

    async activateUser(req, res) {
        try {
            let { userId } = req.params;
            userId = Number(userId);

            const user = await repository.findById(userId);
            if (!user) return res.status(HttpStatusCode.NotFound).json({ error: 'Usuario no encontrado' });

            user.active = true;
            await repository.updateUser(user);
            res.status(HttpStatusCode.Ok).json({ message: 'Usuario activado correctamente' });
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }) }
    },

    async validateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
        if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
        try {
            const decoded = jwt.verify(token, KEY); // Lanza error si expiró o es inválido

            req.user = await repository.findByToken(token);
            if (!req.user || req.user.id !== decoded.id)
                console.log(req.user, decoded)

            if(req.user.id !== decoded.id)
                return res.status(401).json({ error: 'Token no coincide con el usuario' });

            logger.log('[Auth] Token válido, user ID:', decoded.id);
            if (next) return next();
            return res.status(200).json({ message: 'Token válido', user: req.user });
        } catch (err) {
            logger.error('[Auth] Error en token:', err.message);
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }
    },

    async markTermsAsRead(req, res) {
        try {
            const userId = Number(req.params.patientId);
            if (!userId || isNaN(userId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID de usuario inválido'});

            const user = await repository.findById(userId);
            if (!user) return res.status(HttpStatusCode.NotFound).json({error: 'Usuario no encontrado'});

            user.termsAccepted = true;
            await repository.updateUser(user);
            res.status(HttpStatusCode.Ok).json({message: 'Términos y condiciones aceptados'});
        } catch (e) { res.status(HttpStatusCode.InternalServerError).json({ error: e.message }) }
    },
};