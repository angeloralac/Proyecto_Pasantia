const jwt = require('jsonwebtoken');

const User = require('../models/user.models');

const ACCESS_SECRET = "misecretJWT";

const authGuard = async (req, res, next) => {
    // 1. Obtener el header Authorization
    const authHeader = req.headers['authorization'];
    
    // El header llega como "Bearer TOKEN_AQUÍ", así que separamos el string
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);

    // Si no enviaron ningún token
    if (!token) {
        return res.status(401).json({ mensaje: "Acceso denegado. Token no proporcionado." });
    }

    try {
        // 2. Verificar si el token es válido y no ha expirado
        const datosDecodificados = jwt.verify(token, ACCESS_SECRET);

        // 3. Buscar al usuario en la base de datos con Sequelize (Usa el defaultScope automáticamente)
        const usuario = await User.findByPk(datosDecodificados.id);

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado en el sistema." });
        }

        // 4. Guardar el usuario completo en el objeto req para que la ruta final lo use
        req.usuario = usuario;

        // Pasamos al siguiente paso (la ruta protegida)
        next();
    } catch (error) {
        // Si el token expiró o la firma está mal, jwt.verify lanzará un error
        return res.status(403).json({ mensaje: "Token inválido o expirado." });
    }
};

module.exports = authGuard;