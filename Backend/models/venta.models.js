const { sequelize, DataTypes } = require('sequelize');
const Sequelize = require("../database/connection"); 

const Venta = Sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,        
        primaryKey: true,
        autoIncrement: true,
    },
factura: {
        type: DataTypes.STRING,
        allowNull: false,
    },
   
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    precioCosto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    precioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    descuento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },

    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    }
    });

module.exports = Venta;