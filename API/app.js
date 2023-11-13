const express = require('express');
const dataBase = require('./dataBase');
const cors = require('cors');
const userController = require('./controllers/userController');
const jwt = require('jsonwebtoken');
const salt = 10;
// No se coloca la clave secreta en el script, y muchos menos se sube GitHub
// Se utuiliza un archivo .env
const clave = 'appKey';

const app = express();
const port = 3000;

app.use( express.json() );
app.use( cors());

// Utilidad para varificar el token
function validarToken(  req, res, next ){
    // El token viaja en el header
    let token = req.headers.authorization;
    // Chequeo si se paso el token
    //console.log(token)
    if( !token){
        return res.status(401).json({ msg: 'No se paso el token'})
    }
    //token = token.split(' ')[1];

    //console.log('Si', token);
    jwt.verify(token, clave, (error, decoded) => {

        if( error) {
            console.log(error.JsonWebTokenError);
            return res.status(403).json({ msg: 'Token invalido'})
        }
        // Retorno el id del usuario
        req.userEmail = decoded.email;
        next();
    })
    
}

// Me conecto a la BD
dataBase.on( 'error', () => {
    console.error('Error de conexion con MongoDB')
});

dataBase.once( 'open', ()=> {
    console.log('Conexión con MongoDB 👌');
})

// Rutas
app.get('/', (req, res) => {
    res.send('<h1>API REST</h1>');
})

app.post('/api/auth', userController.auth);

app.post('/api/user', userController.crear );

// Rutas protegidas

app.listen( port, () => {
    console.log('Servidor en el puerto ', port);
})