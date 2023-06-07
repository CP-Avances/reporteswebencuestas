"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server/server"));
const router_1 = __importDefault(require("./router/router"));
////////////
const usuarios_1 = __importDefault(require("./router/usuarios"));
////////////
const express = require("express");
//////
const server = server_1.default.init(process.env.PORT || 3004);
//////
const port = process.env.PORT || 3004;
//llamar rutas
server.app.use(router_1.default);
server.app.use(usuarios_1.default);
server.app.use(express.urlencoded({ extended: false }));
server.app.use(express.json());
server.start(() => {
    console.log(`servidor corriendo en el puerto ${port}`);
});
