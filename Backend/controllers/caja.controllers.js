const { Op } = require('sequelize');
const Caja = require('../models/caja.models');
const ventamodel = require('../models/venta.models');

// 1. OBTENER LA CAJA ACTIVA
const getCajaAbierta = async (req, res) => {
  try {
    const caja = await Caja.findOne({ where: { estado: 'abierta' } });
    if (!caja) {
      return res.status(200).json({ cajaActiva: false, message: 'No hay ninguna caja abierta actualmente.' });
    }
    res.status(200).json({ cajaActiva: true, caja });
  } catch (error) {
    console.error('Error al verificar caja:', error);
    res.status(500).json({ error: 'Error interno al verificar la caja' });
  }
};

// 2. ABRIR UNA NUEVA CAJA
const abrirCaja = async (req, res) => {
  try {
    const { monto_inicial, usuarioId } = req.body;

    // Validación estricta de la llave foránea
    if (!usuarioId) {
      return res.status(400).json({ error: 'Se requiere el ID del cajero (usuario) para abrir la caja.' });
    }

    // ELIMINADO: La validación de caja existente. ¡Ahora tu middleware hace el trabajo sucio!

    const nuevaCaja = await Caja.create({
      monto_inicial: monto_inicial || 0,
      usuarioId: usuarioId, // Vinculamos la caja al cajero responsable
      estado: 'abierta',
      fecha_apertura: new Date()
    });

    res.status(201).json({ message: 'Caja abierta exitosamente', caja: nuevaCaja });
  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({ error: 'Error al abrir la caja' });
  }
};

// 3. CERRAR LA CAJA (Corte de Caja)
const cerrarCaja = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_real } = req.body; // El dinero físico que el cajero declara tener

    if (monto_real === undefined || monto_real === null) {
        return res.status(400).json({ error: 'Debes ingresar el monto real (efectivo contado) para cerrar la caja.' });
    }

    const caja = await Caja.findByPk(id);
    
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });
    if (caja.estado === 'cerrada') return res.status(400).json({ error: 'Esta caja ya ha sido cerrada.' });

    const fechaCierre = new Date();

    // Sumamos todas las ventas que se hicieron desde que se abrió esta caja hasta HOY
    const totalVentas = await ventamodel.sum('total', {
      where: {
        createdAt: {
          [Op.between]: [caja.fecha_apertura, fechaCierre]
        }
      }
    }) || 0;

    // Matemáticas del cuadre
    const monto_esperado = parseFloat(caja.monto_inicial) + parseFloat(totalVentas);
    const diferencia = parseFloat(monto_real) - monto_esperado;

    // Guardamos los resultados finales en la base de datos
    await caja.update({
      estado: 'cerrada',
      monto_esperado: monto_esperado,
      monto_real: monto_real,
      diferencia: diferencia,
      fecha_cierre: fechaCierre
    });

    res.status(200).json({ 
      message: 'Corte de caja realizado con éxito', 
      corte: {
        ventas_turno: parseFloat(totalVentas),
        esperado: monto_esperado,
        real: parseFloat(monto_real),
        diferencia: diferencia
      }
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ error: 'Error al cerrar la caja' });
  }
};

// 4. OBTENER HISTORIAL DE CORTES (Para reportes)
const getHistorialCajas = async (req, res) => {
  try {
    const cajas = await Caja.findAll({
      order: [['fecha_apertura', 'DESC']]
    });
    res.status(200).json(cajas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de cajas' });
  }
};

module.exports = { getCajaAbierta, abrirCaja, cerrarCaja, getHistorialCajas };