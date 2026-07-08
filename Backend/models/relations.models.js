const User = require('./user.models');
const Cliente = require('./cliente.models');
const Articulo = require('./articulo.models');
const Venta = require('./venta.models');

const relations = () => {

Cliente.hasMany(Venta, { foreignKey: 'clienteId' });
Venta.belongsTo(Cliente, { foreignKey: 'clienteId' });



Articulo.hasMany(Venta, { foreignKey: 'articuloId' });
Venta.belongsTo(Articulo, { foreignKey: 'articuloId' });

}

module.exports = relations;
