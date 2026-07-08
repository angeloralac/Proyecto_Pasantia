const { sequelize, DataTypes } = require('sequelize');
const Sequelize = require("../database/connection");

const Cliente = Sequelize.define("cliente", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nit: {
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  direccion: {  
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Cliente;