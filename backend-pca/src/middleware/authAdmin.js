
const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
    try {
        
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ msg: 'Acesso negado: token não fornecido' });
        }

        
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

        
        req.adminId = decoded.id || decoded.adminId;
        
        
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ msg: 'Token inválido ou expirado' });
    }
};

module.exports = authAdmin;