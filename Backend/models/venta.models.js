const { DataTypes } = require("sequelize"); 
const Sequelize = require("../database/connection"); 

const Venta = Sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  factura: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precioCosto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descuento: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // --- LA NUEVA LLAVE FORÁNEA ---
  cajaId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permitimos nulo temporalmente por compatibilidad con registros antiguos
    references: {
      model: 'cajas',
      key: 'id'
    }
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  articuloId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ventas',
  timestamps: true
});

module.exports = Venta;