const jwt = require('jsonwebtoken');

const authAny = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'Token não fornecido' });

    const token = authHeader.replace('Bearer ', '');

    // 1️⃣ Tentativa como Admin
    try {
        const decodedAdmin = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.user = {
            id: decodedAdmin.id,
            cargo: 'admin'
        };
        return next();
    } catch {
        try {
            const decodedUser = jwt.verify(token, process.env.JWT_USER_SECRET);
            req.user = {
                id: decodedUser.id,
                cargo: decodedUser.cargo || 'usuario',
                secretariaId: decodedUser.secretariaId
            };
            return next();
        } catch (errUser) {
            console.error(errUser);
            return res.status(401).json({ msg: 'Token inválido ou expirado' });
        }
    }
};

module.exports = authAny;