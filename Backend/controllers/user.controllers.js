const UserModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Leemos las llaves desde las variables de entorno (.env) con tus nombres exactos
const ACCESS_SECRET = process.env.JWT_SECRET || 'clave_respaldo_emergencia';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'clave_refresh_emergencia';

const createUser = async (req, res) => {
  try {
    const { nombre, email, contrasena, fotografia } = req.body;

    const user = await UserModel.create({
      nombre,
      email,
      contrasena,
      fotografia: fotografia || null
    });

    // Generamos ambos tokens al crear un usuario
    const token = jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user,
      token,
      refreshToken
    });
    
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    await user.update(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const idUserDelete = req.params.id;
    const idUserLogeado = req.user.id; 

    if (parseInt(idUserDelete) === parseInt(idUserLogeado)) {
      return res.status(403).json({ error: "No puedes eliminar tu propia cuenta." });
    }
    
    const user = await UserModel.findByPk(idUserDelete);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  
    await user.destroy();
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        const usuario =  await UserModel.scope(null).findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ mensaje: "Credenciales incorrectas (Email no encontrado)" });
        }
     
        const contraseñaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contraseñaCorrecta) {
            return res.status(400).json({ mensaje: "Credenciales incorrectas (Contraseña mal)" });
        }

        // 1. GENERAMOS ACCESS TOKEN (Vida corta: 15 minutos)
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, 
            ACCESS_SECRET, 
          { expiresIn: '15m' } 
        );

        // 2. GENERAMOS REFRESH TOKEN (Vida larga: 7 días)
        const refreshToken = jwt.sign(
          { id: usuario.id, email: usuario.email }, 
            REFRESH_SECRET, 
            { expiresIn: '7d' } 
        );

        // Devolvemos ambos al frontend
        res.json({
            mensaje: "Login exitoso",
            token: token,
            refreshToken: refreshToken,
            user: {
                id: usuario.id,
                email: usuario.email,
                name: usuario.nombre
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
};

// NUEVA FUNCIÓN: Renovación de Token sin pedir contraseña
const renovarToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Si el frontend no manda un refresh token, lo rechazamos
        if (!refreshToken) {
            return res.status(401).json({ mensaje: "Refresh Token requerido" });
        }

        // Verificamos si el Refresh Token es válido y no ha expirado usando REFRESH_SECRET
        jwt.verify(refreshToken, REFRESH_SECRET, (error, decoded) => {
            if (error) {
                return res.status(403).json({ mensaje: "Refresh Token inválido o expirado. Por favor, inicia sesión de nuevo." });
            }

            // Si es válido, generamos un NUEVO Access Token por otros 15 minutos usando ACCESS_SECRET
            const nuevoToken = jwt.sign(
                { id: decoded.id, email: decoded.email }, 
                ACCESS_SECRET, 
                { expiresIn: '15m' }
            );

            // Se lo enviamos al frontend
            res.json({ token: nuevoToken });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: "Error al renovar el token", error });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, login, renovarToken };