require('dotenv').config(); 
const express = require('express'); 
const morgan = require('morgan');
const cors = require('cors');

const sequelize = require('./database/connection'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173'}));

require ('./models/relations.models')();
const routes = require('./routes/index.routes');
app.use(routes);

sequelize.sync(
    { force: false }
).then(() => {
    console.log('Base de datos conectada');
}).catch((error) => {
    console.error('Base de datos no esta conectada:', error);
    });

app.listen(PORT, () => {
    console.log(`Servidor esta corriendo en el puerto ${PORT}`);
}); 

