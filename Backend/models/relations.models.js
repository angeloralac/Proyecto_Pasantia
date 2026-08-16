const User = require('./user.models');
const Cliente = require('./cliente.models');
const Articulo = require('./articulo.models');
const Venta = require('./venta.models');
const Caja = require('./caja.models');

const relations = () => {
  // Cliente <-> Venta
  Cliente.hasMany(Venta, { foreignKey: 'clienteId' });
  Venta.belongsTo(Cliente, { foreignKey: 'clienteId' });

  // Articulo <-> Venta
  Articulo.hasMany(Venta, { foreignKey: 'articuloId' });
  Venta.belongsTo(Articulo, { foreignKey: 'articuloId' });

  // User <-> Caja (Un cajero abre muchas cajas, una caja pertenece a un usuario)
  User.hasMany(Caja, { foreignKey: 'usuarioId' });
  Caja.belongsTo(User, { foreignKey: 'usuarioId' });

  // Caja <-> Venta (Una caja contiene muchas ventas, una venta pertenece a la caja activa)
  Caja.hasMany(Venta, { foreignKey: 'cajaId' });
  Venta.belongsTo(Caja, { foreignKey: 'cajaId' });
};

module.exports = relations;