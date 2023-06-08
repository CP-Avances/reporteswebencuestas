import Server from './server/server';
import router from './router/router';

////////////
import usuarios from './router/usuarios';


////////////
import express = require('express');

//////
const server = Server.init(process.env.PORT || 3006);
//////

const port = process.env.PORT || 3006;

//llamar rutas
server.app.use(router);
server.app.use(usuarios);


server.app.use(express.urlencoded({extended: false}));
server.app.use(express.json());

server.start( () => {
    console.log(`servidor corriendo en el puerto ${port}`);
})