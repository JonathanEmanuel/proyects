const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const salt = 10;
const jwt = require('jsonwebtoken');
// No se coloca la clave secreta en el script, y muchos menos se sube GitHub
// Se utiliza un archivo .env
const clave = 'appKey';

// Autenticación
exports.auth = async (req, res) => {
    const { email, password} = req.body;
    console.log(email, password);

    // Verifica en la db si exista el usuario
    const user = await userModel.findOne( {email} );
    console.log(user);
    if( !user ){
        return res.status(401).json({msg: 'Usuario invalido'});
    } 
    // Comparar la contraseña           retorna un boolean
    const passwordValido = await bcrypt.compare(  password, user.password );
    console.log(passwordValido);
    if( !passwordValido ){
        console.log('PASS INVALIDO')
        return res.status(401).json({msg: 'Password invalido'});
    }
    // Genero el Token        Payload      ClavePrivada  Expira en 1hs
    const token = jwt.sign( {email }, clave, { expiresIn: '1h'} );

    res.status(201).json({
        msg: 'Autenticación correcta',
        token
    })

}

// Creo el controlador del usuario
exports.crear = async( req, res ) => {
    //res.header('Access-Control-Allow-Origin', '*')

    try {
        const { email, password } = req.body
        if( !email || !password){
            res.status(400).json( { msg: 'Faltan campos'});
        } 
        // Creo el hash
        const passHash = await bcrypt.hash( password, salt );
        const userNew = new userModel({
            email,
            password: passHash
        });
        await userNew.save();

        res.status(201).json({
            msg: 'Usuario Guardado' , 
            id: userNew._id 
        });

    } catch (error) {
        console.log(error)
        res.status(500).json( { msg: 'Error en el servidor' } )
    }
}
