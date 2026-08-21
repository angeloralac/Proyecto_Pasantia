const jwt = require('jsonwebtoken');


const authGuard = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Verificamos si el encabezado de autorización está presente y tiene el formato correcto
    console.log("Header Authorization recibido:");

    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        console.log(" No se encontró token o el formato no es 'Bearer <token>'");
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        // Probamos con las variables de entorno en orden de prioridad, y si no existen, usamos la clave de respaldo
        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || process.env.SECRET_KEY || 'clave_respaldo_emergencia';
        
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
    } catch (error) {
        console.log("Error al verificar token:", error.message);
        return res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
    }
};

module.exports = authGuard;