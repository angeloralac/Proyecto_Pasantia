const Caja = require('../models/caja.models');

// 1. GUARDIÁN PARA VENTAS: Exige que haya una caja abierta para poder vender
const requerirCajaAbierta = async (req, res, next) => {
  try {
    const cajaAbierta = await Caja.findOne({ where: { estado: 'abierta' } });

    if (!cajaAbierta) {
      return res.status(403).json({ 
        error: 'Acceso denegado: No hay ninguna caja abierta. Por favor, apertura la caja antes de procesar ventas.' 
      });
    }

    // Guardamos el ID de la caja en la petición por si el controlador lo necesita
    req.cajaActivaId = cajaAbierta.id; 
    
    next(); // La caja está abierta, la petición puede continuar
  } catch (error) {
    console.error('Error en el Guardián de Caja (requerirCajaAbierta):', error);
    res.status(500).json({ error: 'Error interno al verificar el estado de la caja' });
  }
};

// 2. GUARDIÁN PARA APERTURA: Exige que NO haya cajas abiertas antes de abrir una nueva
const requerirCajaCerrada = async (req, res, next) => {
  try {
    const cajaExistente = await Caja.findOne({ where: { estado: 'abierta' } });

    if (cajaExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una caja abierta en el sistema. Debes cerrarla antes de abrir otra.' 
      });
    }

    next(); // No hay cajas abiertas, la petición de abrir una nueva puede continuar
  } catch (error) {
    console.error('Error en el Guardián de Caja (requerirCajaCerrada):', error);
    res.status(500).json({ error: 'Error interno al verificar el estado de la caja' });
  }
};

module.exports = {
  requerirCajaAbierta,
  requerirCajaCerrada
};