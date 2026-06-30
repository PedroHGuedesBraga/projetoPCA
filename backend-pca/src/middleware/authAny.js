const jwt = require('jsonwebtoken');

const authAny = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'Token não fornecido' });

    const token = authHeader.replace('Bearer ', '');

    try {
        try {
            const decodedAdmin = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
            req.user = { id: decodedAdmin.id, cargo: 'admin' };
            return next();
        } catch {
            const decodedUser = jwt.verify(token, process.env.JWT_USER_SECRET);
            req.user = { id: decodedUser.id, cargo: 'usuario' };
            return next();
        }
    } catch (err) {
        return res.status(401).json({ msg: 'Token inválido ou expirado' });
    }
};

module.exports = authAny;
