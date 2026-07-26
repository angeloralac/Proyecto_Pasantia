const { DataTypes } = require("sequelize"); 
const Sequelize = require("../database/connection"); 
const bcrypt = require("bcrypt"); 

const User = Sequelize.define("user", {
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }, 
  fotografia: {
    type: DataTypes.STRING, 
    allowNull: true,
    length: 100000
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true 
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true 
    }
  },
  contrasena: {
    type: DataTypes.TEXT, 
    allowNull: false,
    validate: {
      notEmpty: true 
    }
  }
}, {

  defaultScope: { 
    attributes: { exclude: ['contrasena'] }, 
  },
  hooks: { 
    beforeCreate: async (user) => {  
      if (user.contrasena) { 
        const salt = await bcrypt.genSalt(10); 
        user.contrasena = await bcrypt.hash(user.contrasena, salt); 
      }
    },
    beforeUpdate: async (user) => { 
      if (user.changed('contrasena') && user.contrasena) {
    const salt = await bcrypt.genSalt(10);
    user.contrasena = await bcrypt.hash(user.contrasena, salt);
  }
  }
  }
});

module.exports = User;