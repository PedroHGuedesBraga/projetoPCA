const jwt = require('jsonwebtoken');

const authUsuario = (req, res, next) => {
  try {
    // Pega o token do header Authorization e remove o "Bearer "
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ msg: 'Acesso negado: token não fornecido' });
    }

    // Verifica o token usando a chave do usuário
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);

    // Salva o id do usuário no request
    req.usuarioId = decoded.id;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ msg: 'Token inválido ou expirado' });
  }
};

module.exports = authUsuario;
