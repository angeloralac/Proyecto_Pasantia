const Articulo = require("../models/articulo.models");
const { Op } = require("sequelize"); 

const createArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.create(req.body);
    res.status(201).json(articulo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllArticulos = async (req, res) => {
  try {
    const articulos = await Articulo.findAll();
    res.status(200).json(articulos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArticuloById = async (req, res) => {
  try {
    const articulo = await Articulo.findByPk(req.params.codigo);
    if (!articulo) return res.status(404).json({ error: "Artículo no encontrado" });
    res.status(200).json(articulo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/articulo.controllers.js
const searchArticulos = async (req, res) => {
  try {
    const { q, parametro } = req.query;
    const searchTerm = q || parametro;
    
    console.log('Buscando:', searchTerm);

    if (!searchTerm) {
      return res.status(400).json({ error: 'Se requiere un parámetro de búsqueda' });
    }

    const articulosEncontrados = await Articulo.findAll({
      where: {
        [Op.or]: [
          { codigo_barras: { [Op.like]: `%${searchTerm}%` } },
          { nombre: { [Op.like]: `%${searchTerm}%` } },
          { descripcion: { [Op.like]: `%${searchTerm}%` } }
        ]
      }
    });
    
    // AGREGA ESTE CONSOLE.LOG PARA VER QUÉ DATOS ESTÁS RECIBIENDO
    console.log('Artículos encontrados:', JSON.stringify(articulosEncontrados, null, 2));
    
    res.status(200).json(articulosEncontrados);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error al buscar artículos' });
  }
};

const updateArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.findByPk(req.params.codigo);
    if (!articulo) return res.status(404).json({ error: "Artículo no encontrado" });
    await articulo.update(req.body);
    res.status(200).json(articulo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.findByPk(req.params.codigo);
    if (!articulo) return res.status(404).json({ error: "Artículo no encontrado" });
    await articulo.destroy();
    res.status(200).json({ message: "Artículo eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createArticulo, getAllArticulos, getArticuloById, updateArticulo, deleteArticulo, searchArticulos };
