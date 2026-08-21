const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

const ventamodel = require('../models/venta.models');
const articulomodel = require('../models/articulo.models');
const Cliente = require('../models/cliente.models');

// NUEVA FUNCIÓN: Exportar Ventas a PDF
const descargarReporteVentasPDF = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let whereCondition = {};
    
    if (fechaInicio && fechaFin) {
      // Ajustamos para tomar todo el día completo
      const inicio = new Date(`${fechaInicio}T00:00:00.000Z`);
      const fin = new Date(`${fechaFin}T23:59:59.999Z`);
      
      whereCondition.createdAt = {
        [Op.between]: [inicio, fin]
      };
    }

    // 1. Obtenemos las ventas de la Base de Datos
    const ventas = await ventamodel.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });

    if (ventas.length === 0) {
      return res.status(404).json({ error: 'No hay ventas en este rango de fechas' });
    }

    // 2. Armamos los diccionarios para que el PDF muestre nombres y no IDs
    const articuloIds = [...new Set(ventas.map(v => v.articuloId))];
    const articulos = await articulomodel.findAll({ where: { id: articuloIds } });
    const articuloInfo = {};
    articulos.forEach(a => articuloInfo[a.id] = a.nombre);

    const clienteIds = [...new Set(ventas.map(v => v.clienteId).filter(id => id !== null))];
    const clientes = await Cliente.findAll({ where: { id: clienteIds } });
    const clienteInfo = {};
    clientes.forEach(c => clienteInfo[c.id] = c.nombre);

    // 3. Preparamos la respuesta HTTP para enviar un archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.pdf');

    // 4. Creamos el PDF y lo conectamos a la respuesta
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // 5. Encabezado del PDF
    doc.fontSize(18).text('Reporte General de Ventas', { align: 'center' });
    if (fechaInicio && fechaFin) {
      doc.fontSize(10).fillColor('gray').text(`Período: ${fechaInicio} al ${fechaFin}`, { align: 'center' });
    }
    doc.moveDown(2);

    // 6. Procesamos las filas para la tabla
    let totalAcumulado = 0;
    const rows = ventas.map(venta => {
      totalAcumulado += parseFloat(venta.total);
      
      const nombreArticulo = articuloInfo[venta.articuloId] || 'Producto Eliminado';
      const nombreCliente = venta.clienteId && clienteInfo[venta.clienteId] 
        ? clienteInfo[venta.clienteId] 
        : 'Consumidor Final';

      // Formato de fecha dd/mm/yyyy
      const fechaObj = new Date(venta.createdAt);
      const fecha = `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;

      return [
        venta.factura,
        fecha,
        nombreCliente,
        nombreArticulo,
        venta.cantidad.toString(),
        `Q ${parseFloat(venta.total).toFixed(2)}`
      ];
    });

    const tableArray = {
      title: "Detalle de Transacciones",
      headers: ["Factura", "Fecha", "Cliente", "Artículo", "Cant.", "Total"],
      rows: rows,
    };

    // 7. Dibujamos la tabla
    await doc.table(tableArray, { 
      width: 535, 
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9).fillColor('black'),
      prepareRow: () => doc.font("Helvetica").fontSize(8)
    });

    // 8. Total General al final
    doc.moveDown();
    doc.font("Helvetica-Bold")
       .fontSize(12)
       .text(`Total Generado: Q ${totalAcumulado.toFixed(2)}`, { align: 'right' });

    // 9. Cerramos el PDF
    doc.end();

  } catch (error) {
    console.error("Error al generar PDF de ventas:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno al generar el documento' });
    }
  }
};

module.exports = {
  descargarReporteVentasPDF
};