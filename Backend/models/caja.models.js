const { sequelize, DataTypes } = require('sequelize');
const Sequelize = require("../database/connection");

const Caja = Sequelize.define('Caja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estado: {
    type: DataTypes.ENUM('abierta', 'cerrada'),
    defaultValue: 'abierta',
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', 
      key: 'id'
    }
  },
  monto_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  monto_esperado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Se calcula al cerrar la caja
  },
  monto_real: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // El dinero físico contado por el cajero
  },
  diferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Sobrante (positivo) o faltante (negativo)
  },
  fecha_apertura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_cierre: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'cajas',
  timestamps: true
});

module.exports = Caja;