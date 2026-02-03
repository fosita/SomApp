module.exports = {
    removeSensibleInfo(user) {
        const {
            hashPassword, username, password,
            dniCe, token, failed_attempts,
            last_login_at, createdAt, updatedAt,
            ...safeUser } = user;
        return safeUser;
    }
}