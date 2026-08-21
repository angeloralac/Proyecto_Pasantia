const { Op } = require('sequelize');
const ventamodel = require('../models/venta.models');
const articulomodel = require('../models/articulo.models');
const Cliente = require('../models/cliente.models'); 
const Usuario = require('../models/user.models');
const Caja = require('../models/caja.models'); // Lo mantenemos porque se usa en getDetallesVenta

// Función de ayuda (Helper)
const buscarVentaOError = async (id, transaction = null) => {
  const options = transaction ? { transaction } : {};
  const ventaExistente = await ventamodel.findByPk(id, options);
  if (!ventaExistente) {
    throw new Error('Venta no encontrada');
  }
  return ventaExistente;
};

const getVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let whereCondition = {};
    if (fechaInicio && fechaFin) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }
    const ventas = await ventamodel.findAll({ where: whereCondition });
    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

const getVentaByFactura = async (req, res) => {
  try {
    const { factura } = req.params;
    const ventas = await ventamodel.findAll({ where: { factura: factura } });
    if (ventas.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la factura' });
  }
};

const getUltimasVentas = async (req, res) => {
  try {
    const ultimasVentas = await ventamodel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    res.status(200).json(ultimasVentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las últimas ventas' });
  }
};

const storeVenta = async (req, res) => {
  try {
    const { productos, clienteId } = req.body;
    
    // Obtenemos el ID de la caja inyectado por nuestro middleware de seguridad
    const cajaActivaId = req.cajaActivaId; 
    
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un producto' });
    }
    
    const codigoFactura = `FAC-${Date.now()}`;
    
    const resultado = await ventamodel.sequelize.transaction(async (t) => {
      
      // ELIMINADO: La búsqueda manual de la caja. El middleware ya lo confirmó.

      for (const item of productos) {
        await ventamodel.create({
          factura: codigoFactura,
          cajaId: cajaActivaId, // <-- Usamos directamente el ID que nos pasó el guardián
          cantidad: item.cantidad,
          precioCosto: item.precioCosto,
          precioVenta: item.precioVenta,
          descuento: item.descuento || 0,
          total: item.total,
          articuloId: item.articuloId,
          clienteId: clienteId, 
        }, { transaction: t });

        const articuloToUpdate = await articulomodel.findByPk(item.articuloId, { transaction: t });
        if (!articuloToUpdate) throw new Error(`Artículo con ID ${item.articuloId} no encontrado`);
        if (articuloToUpdate.stock < item.cantidad) throw new Error(`Stock insuficiente para el artículo ${articuloToUpdate.nombre}`);
        
        articuloToUpdate.stock = articuloToUpdate.stock - item.cantidad;
        await articuloToUpdate.save({ transaction: t });
      }
      return codigoFactura;
    });
    
    res.status(201).json({ message: 'Venta creada exitosamente', factura: resultado });
  } catch (error) {
    console.error('Error al crear la venta:', error);
    res.status(500).json({ 
      error: error.message || 'Error al crear la venta',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const deleteVenta = async (req, res) => {
  try {
    const { factura } = req.params;
    
    // Implementamos transacción para evitar corrupción de datos
    await ventamodel.sequelize.transaction(async (t) => {
      const ventas = await ventamodel.findAll({
        where: { factura: factura },
        transaction: t
      });

      if (ventas.length === 0) throw new Error('Venta no encontrada');

      for (const vent of ventas) {
        const articuloToUpdate = await articulomodel.findByPk(vent.articuloId, { transaction: t });
        if (articuloToUpdate) {
          articuloToUpdate.stock = articuloToUpdate.stock + vent.cantidad;
          await articuloToUpdate.save({ transaction: t });
        }
        await vent.destroy({ transaction: t });
      }
    });

    res.status(200).json({ message: `Venta con factura ${factura} eliminada y stock restaurado exitosamente` });
  } catch (error) {
    console.error(error);
    const status = error.message === 'Venta no encontrada' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

const updateVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaCantidad } = req.body;

    // Implementamos transacción para proteger el ajuste de inventario
    await ventamodel.sequelize.transaction(async (t) => {
      const ventaExistente = await buscarVentaOError(id, t);
      const articuloToUpdate = await articulomodel.findByPk(ventaExistente.articuloId, { transaction: t });
      
      if (articuloToUpdate) {
        // Lógica corregida: Devolvemos el stock original y luego restamos la nueva cantidad
        articuloToUpdate.stock = (articuloToUpdate.stock + ventaExistente.cantidad) - nuevaCantidad;
        await articuloToUpdate.save({ transaction: t });
      }

      await ventaExistente.update({
        cantidad: nuevaCantidad,
        total: nuevaCantidad * ventaExistente.precioVenta
      }, { transaction: t });
    });

    res.status(200).json({ message: 'Venta modificada y stock ajustado con éxito' });
  } catch (error) {
    console.error(error);
    const status = error.message === 'Venta no encontrada' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

const getVentaByCreationDate = async (req, res) => {
  try {
    const { fecha } = req.params;
    const iniciodeldia = new Date(`${fecha}T00:00:00.000`);
    const finaldeldia = new Date(`${fecha}T23:59:59.999`);
    
    const ventas = await ventamodel.findAll({
      where: {
        createdAt: {
          [Op.between]: [iniciodeldia, finaldeldia]
        }
      }
    });
    if (ventas.length === 0) {
      return res.status(404).json({ error: 'No se encontraron ventas para la fecha proporcionada' });
    }
    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas por fecha' });
  }
};

// NUEVA FUNCIÓN: Métricas Optimizadas para el Dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    const fechaActual = new Date();
    
    const inicioHoy = new Date(fechaActual.setHours(0, 0, 0, 0));
    const finHoy = new Date(fechaActual.setHours(23, 59, 59, 999));
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const finMes = new Date(fechaActual.getFullYear(), Math.min(fechaActual.getMonth() + 1, 11), 0, 23, 59, 59);

    // Delega el trabajo pesado a la Base de Datos usando sum() y count()
    const totalVentasHoy = await ventamodel.sum('total', {
      where: { createdAt: { [Op.between]: [inicioHoy, finHoy] } }
    }) || 0;

    const cantidadFacturasHoy = await ventamodel.count({
      distinct: true,
      col: 'factura',
      where: { createdAt: { [Op.between]: [inicioHoy, finHoy] } }
    });

    const totalVentasMes = await ventamodel.sum('total', {
      where: { createdAt: { [Op.between]: [inicioMes, finMes] } }
    }) || 0;

    const metaMensual = 10000; 
    let porcentajeMeta = Math.round((totalVentasMes / metaMensual) * 100);
    if (porcentajeMeta > 100) porcentajeMeta = 100;

    const ultimosRegistros = await ventamodel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15
    });

    res.status(200).json({
      hoy: { total: totalVentasHoy, cantidad: cantidadFacturasHoy },
      meta: { totalMes: totalVentasMes, esperado: metaMensual, porcentaje: porcentajeMeta },
      misVentasRaw: ultimosRegistros 
    });
  } catch (error) {
    console.error('Error en métricas del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

const getTopArticulos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let whereCondition = {};
    
    if (fechaInicio && fechaFin) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }

    const topArticulos = await ventamodel.findAll({
      attributes: [
        'articuloId',
        [ventamodel.sequelize.fn('SUM', ventamodel.sequelize.col('cantidad')), 'unidadesVendidas'],
        [ventamodel.sequelize.fn('SUM', ventamodel.sequelize.col('total')), 'dineroGenerado']
      ],
      where: whereCondition,
      group: ['articuloId'],
      order: [[ventamodel.sequelize.fn('SUM', ventamodel.sequelize.col('cantidad')), 'DESC']],
      limit: 10
    });

    const resultadosConNombres = await Promise.all(topArticulos.map(async (item) => {
      const data = item.dataValues; 
      const articulo = await articulomodel.findByPk(data.articuloId);
      
      return {
        id: data.articuloId,
        nombre: articulo ? articulo.nombre : 'Artículo Eliminado',
        unidades: parseInt(data.unidadesVendidas, 10),
        generado: parseFloat(data.dineroGenerado)
      };
    }));

    res.status(200).json(resultadosConNombres);
  } catch (error) {
    console.error('Error al obtener el top de artículos:', error);
    res.status(500).json({ error: 'Error al calcular el top de artículos' });
  }
};

// OBTENER DETALLES DE VENTA (Actualizado con Vendedor y Cliente)
const getDetallesVenta = async (req, res) => {
  try {
    const { factura } = req.query;
    let facturasABuscar = [];

    // Si se proporciona una factura específica, la buscamos; si no, tomamos las últimas 3 facturas
    if (factura) {
      facturasABuscar = [factura];
    } else {
      const todasLasVentas = await ventamodel.findAll({ order: [['createdAt', 'DESC']] });
      facturasABuscar = [...new Set(todasLasVentas.map(v => v.factura))].slice(0, 3);
    }
    if (facturasABuscar.length === 0) return res.status(200).json([]);

    // 0. Obtenemos todas las ventas correspondientes a las facturas encontradas
    const ventas = await ventamodel.findAll({
      where: { factura: facturasABuscar },
      order: [['createdAt', 'DESC']]
    });

    // 1. Buscamos las cajas y usuarios (Vendedores)
    const cajaIds = [...new Set(ventas.map(v => v.cajaId).filter(id => id !== null))];
    const cajas = await Caja.findAll({ where: { id: cajaIds } });
    const cajaToUsuario = {};
    cajas.forEach(c => cajaToUsuario[c.id] = c.usuarioId);

    // 1.1 Buscamos a los Usuarios (Vendedores)
    const usuarioIds = [...new Set(cajas.map(c => c.usuarioId).filter(id => id !== null))];
    const usuarios = await Usuario.findAll({ where: { id: usuarioIds } });
    const usuarioInfo = {};
    usuarios.forEach(u => usuarioInfo[u.id] = u.nombre);

    // Buscamos a los Clientes
    const clienteIds = [...new Set(ventas.map(v => v.clienteId).filter(id => id !== null))];
    const clientes = await Cliente.findAll({ where: { id: clienteIds } });
    const clienteInfo = {};
    clientes.forEach(c => clienteInfo[c.id] = c.nombre); 

    // 2. Armamos la respuesta con Producto, Vendedor y Cliente
    const detallesConNombres = await Promise.all(ventas.map(async (v) => {
      const articulo = await articulomodel.findByPk(v.articuloId);
      const usuarioId = cajaToUsuario[v.cajaId];
      
      // Determinamos el nombre del cliente (o Consumidor Final si es nulo)
      const nombreDelCliente = v.clienteId && clienteInfo[v.clienteId] 
        ? clienteInfo[v.clienteId] 
        : (v.clienteId ? `Cliente ID: ${v.clienteId}` : 'Consumidor Final');

      return {
        ...v.dataValues,
        articuloNombre: articulo ? articulo.nombre : 'Producto Eliminado',
        vendedor: usuarioId && usuarioInfo[usuarioId] ? usuarioInfo[usuarioId] : 'Desconocido',
        cliente: nombreDelCliente 
      };
    }));

    res.status(200).json(detallesConNombres);
  } catch (error) {
    console.error('Error al obtener detalles de venta:', error);
    res.status(500).json({ error: 'Error al obtener el desglose de las ventas' });
  }
};

module.exports = { 
  getVentas, 
  getVentaByFactura,
  getUltimasVentas,
  storeVenta,
  getVentaByCreationDate,
  deleteVenta,
  updateVenta,
  getDashboardMetrics,
  getTopArticulos,
  getDetallesVenta
};