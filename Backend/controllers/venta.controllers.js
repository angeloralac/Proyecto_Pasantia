const ventamodel = require('../models/venta.models');
const articulomodel = require('../models/articulo.models');


const getVentas = async (req, res) => {
  try {
    const ventas = await ventamodel.findAll({});
    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

const getVentaByFactura = async (req, res) => {
  try {
    const { factura } = req.params;
    const ventas = await ventamodel.findAll({
      where: { factura: factura }
    });
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

        console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('Productos:', req.body.productos);

    const { productos } = req.body;
    
    // Validación básica
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un producto' });
    }
    
    const codigoFactura = `FAC-${Date.now()}`;
    
    console.log('Procesando venta:', { codigoFactura, productos });
    
    // Usar transacción para asegurar consistencia
    const resultado = await ventamodel.sequelize.transaction(async (t) => {
      for (const item of productos) {
        console.log('Creando registro de venta para artículo:', item.articuloId);
        
        // Crear el registro de venta
        await ventamodel.create({
          factura: codigoFactura,
          cantidad: item.cantidad,
          precioCosto: item.precioCosto,
          precioVenta: item.precioVenta,
          descuento: item.descuento || 0,
          total: item.total,
          articuloId: item.articuloId,
          clienteId: item.clienteId
        }, { transaction: t });

        // Actualizar stock
        const articuloToUpdate = await articulomodel.findByPk(item.articuloId, { transaction: t });
        
        if (!articuloToUpdate) {
          throw new Error(`Artículo con ID ${item.articuloId} no encontrado`);
        }
        
        if (articuloToUpdate.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para el artículo ${articuloToUpdate.nombre}`);
        }
        
        console.log(`Actualizando stock de ${articuloToUpdate.nombre}: ${articuloToUpdate.stock} -> ${articuloToUpdate.stock - item.cantidad}`);
        
        articuloToUpdate.stock = articuloToUpdate.stock - item.cantidad;
        await articuloToUpdate.save({ transaction: t });
      }
      
      return codigoFactura;
    });
    
    res.status(201).json({ 
      message: 'Venta creada exitosamente', 
      factura: resultado 
    });
    
  } catch (error) {
    console.error('Error al crear la venta:', error);
    
    // Mensaje de error más específico
    const errorMessage = error.message || 'Error al crear la venta';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = { storeVenta };

const buscarVentaOError = async (id) => {
  const ventaExistente = await ventamodel.findByPk(id);
  if (!ventaExistente) {
    throw new Error('Venta no encontrada');
  }
  return ventaExistente;
};

// TODO: Implementar la función de eliminar venta y restaurar stock
const deleteVenta = async (req, res) => {
  try {
    const { factura } = req.params;
    const ventas = await ventamodel.findAll({
      where: { factura: factura }
    });
    for (const vent of ventas) {
      // restauramos el stock del artículo correspondiente
      const articuloToUpdate = await articulomodel.findByPk(vent.articuloId);
      if (articuloToUpdate) {
        articuloToUpdate.stock = articuloToUpdate.stock + vent.cantidad;
        await articuloToUpdate.save();
      }
      await vent.destroy(); // eliminamos la venta
    }
    res.status(200).json({ message: `Venta con factura ${factura} eliminada y stock restaurado exitosamente` });
  } catch (error) {
    console.error(error);
    const status = error.message === 'Venta no encontrada' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};


// TODO: Implementar la función de modificar venta Y VALIDAR SI SE INCREMENTA O DECREMENTA LA CANTIDAD PARA AJUSTAR EL STOCK
const updateVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaCantidad } = req.body;
    const ventaExistente = await buscarVentaOError(id);

  
    const articuloToUpdate = await articulomodel.findByPk(ventaExistente.articuloId);
    if (articuloToUpdate) {
      articuloToUpdate.stock = articuloToUpdate.stock + ventaExistente.cantidad - nuevaCantidad;
      await articuloToUpdate.save();
    }

    await ventaExistente.update({
      cantidad: nuevaCantidad,
      total: nuevaCantidad * ventaExistente.precioVenta // Recalculamos el total automáticamente
    });

    res.status(200).json({ message: 'Venta modificada y stock ajustado con éxito', ventaExistente });
  } catch (error) {
    console.error(error);
    const status = error.message === 'Venta no encontrada' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

const getVentaByCreationDate = async (req, res) => {
  try {
    const { fecha } = req.params;
    const ventas = await ventamodel.findAll({
      where: {
        createdAt: fecha
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

module.exports = { 
  getVentas, 
  getVentaByFactura,
  getUltimasVentas,
  storeVenta,
  getVentaByCreationDate,
  deleteVenta,
  updateVenta,

};
