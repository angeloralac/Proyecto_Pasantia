const UserModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const user = await UserModel.create(req.body);
    res.status(201).json({
      user,
      token: jwt.sign({ id: user.id, email: user.email }, 'misecretJWT', { expiresIn: '2h' })
    });
    
  } catch (error) {
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
    const user = await UserModel.findByPk(idUsuarioAEliminar);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  
    await user.destroy();
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
    try {
        const { nombre, email, contrasena } = req.body;

        const usuario =  await UserModel.scope(null).findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ mensaje: "Credenciales incorrectas (Email no encontrado)" });
        }
     
        const contraseñaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contraseñaCorrecta) {
            return res.status(400).json({ mensaje: "Credenciales incorrectas (Contraseña mal)" });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, 
            'misecretJWT', 
            { expiresIn: '1h' } 
        );

        res.json({
            mensaje: "Login exitoso",
          token: token,
            user: {
                id: usuario.id,
                email: usuario.email,
                name: usuario.nombre,
                token: token
            }
        });

    } catch (error) {
      console.log(error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
}

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, login };