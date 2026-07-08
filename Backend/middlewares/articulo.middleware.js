const validarStock = (req, res, next) => {

const stock = req.body.stock !== undefined ? Number(req.body.stock) : undefined;

    if (stock === undefined || stock <= 0) {
        return res.status(400).json({
        message: 'El stock ingresado debe ser mayor a 0'
        });

    }
    return next();
};

