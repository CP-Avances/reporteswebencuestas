"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifivarToken_1 = require("../libs/verifivarToken");
const mysql_1 = __importDefault(require("../mysql/mysql"));
const router = (0, express_1.Router)();
/** ************************************************************************************************************ **
 ** **                                     TRATAMIENTO SUCURSALES                                             ** **
 ** ************************************************************************************************************ **/
router.get("/getallsucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
    SELECT * FROM sucursal ORDER BY NOM_SUC ASC;
    `;
    mysql_1.default.ejecutarQuery(query, (err, empresas) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                empresas,
            });
        }
    });
});
/** ************************************************************************************************************ **
 ** **                           TRATAMIENTO USUARIOS - CAJEROS                                               ** **
 ** ************************************************************************************************************ **/
router.get("/getallcajeros", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
    SELECT * FROM usuario WHERE TIPO_US = 'Trabajador'
    `;
    mysql_1.default.ejecutarQuery(query, (err, cajeros) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                cajeros,
            });
        }
    });
});
// BUSCAR CAJEROS DE ACUERDO A LA SUCURSAL
router.get("/getallcajeros/:sucursales/:estado", verifivarToken_1.TokenValidation, (req, res) => {
    // 1 --> INACTIVOS
    // 2 --> ACTIVOS
    // 3 --> TODOS
    // FILTROS SUCURSALES
    console.log(' sucursales ', req.params.sucursales);
    console.log('estado ', req.params.estado);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;
    // VALIDACIONES SUCURSALES
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    // FILTROS ESTADO
    const estado_usuario = req.params.estado;
    let estado = ``;
    if (estado_usuario != 3) {
        estado = `AND ESTADO_US = ${estado_usuario}`;
    }
    const query = `
    SELECT U.COD_US, u.CI_US, u.NOM_US, u.TIPO_US, u.ESTADO_US, sc.NOM_SUC 
    FROM
      usuario u
    JOIN puestotrabajo pt ON pt.COD_US = u.COD_US
    JOIN servicio s ON s.COD_SER = pt.COD_SER
    JOIN sucursal sc ON sc.COD_SUC = s.COD_SUC
    WHERE u.TIPO_US = 'Trabajador'
      ${!todasSucursales ? `AND sc.COD_SUC IN (${listaSucursales})` : ''}
      ${estado}
    `;
    console.log('query usuario ', query);
    mysql_1.default.ejecutarQuery(query, (err, cajeros) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                cajeros,
            });
        }
    });
});
/** ************************************************************************************************************ **
 ** **                               ACTUALIZAR ESTADO                                                        ** **
 ** ************************************************************************************************************ **/
router.get("/cambiarestadocajeros/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const listaSucursales = req.params.sucursales;
    const query = `
  UPDATE  usuario u
  SET 
  
    u.ESTADO_US = CASE 
                    WHEN u.ESTADO_US = 2 THEN 1
                    WHEN u.ESTADO_US = 1 THEN 2
                    ELSE u.ESTADO_US
                    END
  WHERE U.COD_US IN (${listaSucursales});
`;
    mysql_1.default.ejecutarQuery(query, (err, cajeros) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                cajeros,
            });
        }
    });
});
/** ************************************************************************************************************ **
 ** **                                 TRATAMIENTO ENCUESTAS                                                  ** **
 ** ************************************************************************************************************ **/
router.get("/getallencuestas/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    const query = `
    SELECT encuesta.COD_EN, encuesta.NOM_EN
    FROM sucursal
    JOIN sucursalxencuesta ON sucursal.COD_SUC = sucursalxencuesta.COD_SUC
    JOIN encuesta ON sucursalxencuesta.COD_EN = encuesta.COD_EN
      ${!todasSucursales ? `WHERE sucursal.COD_SUC IN (${listaSucursales})` : ''};
    `;
    mysql_1.default.ejecutarQuery(query, (err, cajeros) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                cajeros,
            });
        }
    });
});
router.get("/getencuestastotales", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
    SELECT * FROM encuesta;
    `;
    mysql_1.default.ejecutarQuery(query, (err, encuestasT) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                encuestasT,
            });
        }
    });
});
/** ************************************************************************************************************ **
 ** **                                  TRATAMIENTO PREGUNTAS                                                 ** **
 ** ************************************************************************************************************ **/
router.get("/getallpreguntas/:encuestas", verifivarToken_1.TokenValidation, (req, res) => {
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    let todasEncuestas = false;
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    const query = `
    SELECT * FROM pregunta
      ${!todasEncuestas ? `WHERE COD_EN IN (${listaEncuestas})` : ''};
    `;
    mysql_1.default.ejecutarQuery(query, (err, preguntas) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
            console.log(err);
        }
        else {
            res.json({
                ok: true,
                preguntas,
            });
        }
    });
});
router.get("/preguntasrespuestas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:usuarios/:encuesta/:preguntas", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaEncuestas = req.params.encuesta;
    const encuestasArray = listaEncuestas.split(",");
    const listaUsuarios = req.params.usuarios;
    const usuariosArray = listaUsuarios.split(",");
    const listaPreguntas = req.params.preguntas;
    const preguntasArray = listaPreguntas.split(",");
    let todasEncuestas = false;
    let todosUsuarios = false;
    let todasPreguntas = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (usuariosArray.includes("-2")) {
        todosUsuarios = true;
    }
    if (preguntasArray.includes("-2")) {
        todasPreguntas = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT titulo, pregunta, encuesta, respuesta, usuario,
        COUNT(*) AS conteo_respuestas
      FROM (
        SELECT
          pregunta.SEC_PR AS titulo,
          pregunta.PREG_PR AS pregunta,
          encuesta.NOM_EN AS encuesta,
          usuario.NOM_US AS usuario,
          CASE evaluacion.VAL_EV
            WHEN 1 THEN pregunta.ETIQUNO_PR
            WHEN 2 THEN pregunta.ETIQDOS_PR
            WHEN 3 THEN pregunta.ETIQTRES_PR
            WHEN 4 THEN pregunta.ETIQCUATRO_PR
            WHEN 5 THEN pregunta.ETIQCINCO_PR
            WHEN 6 THEN pregunta.ETIQSEIS_PR
            WHEN 7 THEN pregunta.ETIQSIETE_PR
            WHEN 8 THEN pregunta.ETIQOCHO_PR
            WHEN 9 THEN pregunta.ETIQNUEVE_PR
            WHEN 10 THEN pregunta.ETIQDIEZ_PR
          END AS respuesta
      FROM
          evaluacion
          JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
          JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
          JOIN usuario ON evaluacion.COD_US = usuario.COD_US
      WHERE STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todosUsuarios ? `AND evaluacion.COD_US IN (${listaUsuarios}) ` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${!todasPreguntas ? `AND pregunta.COD_PR IN (${listaPreguntas})` : ''}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
        ) subconsulta
      GROUP BY encuesta, usuario, titulo, pregunta, respuesta;
    `;
    mysql_1.default.ejecutarQuery(query, (err, turnos) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                turnos,
            });
        }
    });
});
/** ************************************************************************************************************ **
 ** **                                     RESUMEN DE PREGUNTAS                                               ** **
 ** ************************************************************************************************************ **/
router.get("/respuestasresumen/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:preguntas", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    console.log('ver fecha desde ', fDesde);
    const fHasta = req.params.fechaHasta;
    console.log('ver fecha hasta ', fHasta);
    const hInicio = req.params.horaInicio;
    console.log('ver hora desde ', hInicio);
    const hFin = req.params.horaFin;
    console.log('ver hora hasta ', hFin);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaPreguntas = req.params.preguntas;
    const preguntasArray = listaPreguntas.split(",");
    console.log('ver preguntas ', listaPreguntas);
    let todasSucursales = false;
    let todasEncuestas = false;
    let todasPreguntas = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (preguntasArray.includes("-2")) {
        todasPreguntas = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT titulo, pregunta, encuesta, sucursal, respuesta,
        COUNT(*) AS conteo_respuestas
      FROM (
        SELECT
          pregunta.SEC_PR AS titulo,
          pregunta.PREG_PR AS pregunta,
          encuesta.NOM_EN AS encuesta,
          sucursal.NOM_SUC AS sucursal,
          CASE evaluacion.VAL_EV
            WHEN 1 THEN pregunta.ETIQUNO_PR
            WHEN 2 THEN pregunta.ETIQDOS_PR
            WHEN 3 THEN pregunta.ETIQTRES_PR
            WHEN 4 THEN pregunta.ETIQCUATRO_PR
            WHEN 5 THEN pregunta.ETIQCINCO_PR
            WHEN 6 THEN pregunta.ETIQSEIS_PR
            WHEN 7 THEN pregunta.ETIQSIETE_PR
            WHEN 8 THEN pregunta.ETIQOCHO_PR
            WHEN 9 THEN pregunta.ETIQNUEVE_PR
            WHEN 10 THEN pregunta.ETIQDIEZ_PR
          END AS respuesta
      FROM
          evaluacion
          JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
          JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
          JOIN sucursalxencuesta ON encuesta.COD_EN = sucursalxencuesta.COD_EN
          JOIN sucursal ON sucursalxencuesta.COD_SUC = sucursal.CIU_SUC
      WHERE STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${!todasPreguntas ? `AND pregunta.COD_PR IN (${listaPreguntas})` : ''}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
        ) subconsulta
      GROUP BY titulo, pregunta, respuesta, sucursal, encuesta;
    `;
    mysql_1.default.ejecutarQuery(query, (err, turnos) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                turnos,
            });
        }
    });
});
router.get("/preguntas-encuesta-sucursal/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:preguntas", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    console.log('ver fecha desde ', fDesde);
    const fHasta = req.params.fechaHasta;
    console.log('ver fecha hasta ', fHasta);
    const hInicio = req.params.horaInicio;
    console.log('ver hora desde ', hInicio);
    const hFin = req.params.horaFin;
    console.log('ver hora hasta ', hFin);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaPreguntas = req.params.preguntas;
    const preguntasArray = listaPreguntas.split(",");
    console.log('ver preguntas ', listaPreguntas);
    let todasSucursales = false;
    let todasEncuestas = false;
    let todasPreguntas = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (preguntasArray.includes("-2")) {
        todasPreguntas = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT 
        codigo_pregunta, titulo, pregunta, encuesta, sucursal, respuesta,
        COUNT(*) AS conteo_respuestas
      FROM (
        SELECT
          pregunta.SEC_PR AS titulo,
          pregunta.PREG_PR AS pregunta,
          pregunta.COD_PR AS codigo_pregunta,
          encuesta.NOM_EN AS encuesta,
          sucursal.NOM_SUC AS sucursal,
          CASE evaluacion.VAL_EV
            WHEN '1' THEN pregunta.ETIQUNO_PR
            WHEN '2' THEN pregunta.ETIQDOS_PR
            WHEN '3' THEN pregunta.ETIQTRES_PR
            WHEN '4' THEN pregunta.ETIQCUATRO_PR
            WHEN '5' THEN pregunta.ETIQCINCO_PR
            WHEN '6' THEN pregunta.ETIQSEIS_PR
            WHEN '7' THEN pregunta.ETIQSIETE_PR
            WHEN '8' THEN pregunta.ETIQOCHO_PR
            WHEN '9' THEN pregunta.ETIQNUEVE_PR
            WHEN '10' THEN pregunta.ETIQDIEZ_PR
            ELSE evaluacion.VAL_EV
          END AS respuesta
      FROM
        evaluacion
        JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
        JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
        JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
      WHERE 
        STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${!todasPreguntas ? `AND pregunta.COD_PR IN (${listaPreguntas})` : ''}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
        ) subconsulta
      GROUP BY codigo_pregunta, titulo, pregunta, respuesta, sucursal, encuesta
      ORDER BY sucursal, encuesta, codigo_pregunta;
    `;
    mysql_1.default.ejecutarQuery(query, (err, resumen) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                resumen,
            });
        }
    });
});
router.get("/resumenencuestas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:encuestas/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    console.log('ver fecha desde ', fDesde);
    const fHasta = req.params.fechaHasta;
    console.log('ver fecha hasta ', fHasta);
    const hInicio = req.params.horaInicio;
    console.log('ver hora desde ', hInicio);
    const hFin = req.params.horaFin;
    console.log('ver hora hasta ', hFin);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    let todasSucursales = false;
    let todasEncuestas = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT
          encuesta.COD_EN,
          encuesta.NOM_EN,
          sucursal.COD_SUC,
          sucursal.NOM_SUC,
          COUNT(DISTINCT evaluacion.CODIGO_RESPUESTA) AS total_encuestas
      FROM
          evaluacion
          JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
          JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
          JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
      WHERE 
          STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
          ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
          ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
          ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
      GROUP BY 
          encuesta.COD_EN, encuesta.NOM_EN, sucursal.COD_SUC, sucursal.NOM_SUC;
    `;
    mysql_1.default.ejecutarQuery(query, (err, resumen) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                resumen,
            });
        }
    });
});
router.get("/listapreguntasrespuestas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:encuestas/:sucursales/:usuarios", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    console.log('ver fecha desde ', fDesde);
    const fHasta = req.params.fechaHasta;
    console.log('ver fecha hasta ', fHasta);
    const hInicio = req.params.horaInicio;
    console.log('ver hora desde ', hInicio);
    const hFin = req.params.horaFin;
    console.log('ver hora hasta ', hFin);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaUsuarios = req.params.usuarios;
    const usuariossArray = listaUsuarios.split(",");
    let todasSucursales = false;
    let todasEncuestas = false;
    let todasUsuarios = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (usuariossArray.includes("-2")) {
        todasUsuarios = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT
        pregunta.SEC_PR AS titulo,
        pregunta.PREG_PR AS pregunta,
        pregunta.COD_PR AS codigo_pregunta,
        encuesta.NOM_EN AS encuesta,
        encuesta.COD_EN,
		    evaluacion.CODIGO_RESPUESTA,
        sucursal.NOM_SUC AS sucursal,
        sucursal.COD_SUC,
        evaluacion.FECH_EV AS fecha_hora,
        HOUR(evaluacion.FECH_EV) AS hora,
        STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') AS fecha,
		    usuario.COD_US,
        usuario.NOM_US,
        CASE evaluacion.VAL_EV
          WHEN '1' THEN pregunta.ETIQUNO_PR
          WHEN '2' THEN pregunta.ETIQDOS_PR
          WHEN '3' THEN pregunta.ETIQTRES_PR
          WHEN '4' THEN pregunta.ETIQCUATRO_PR
          WHEN '5' THEN pregunta.ETIQCINCO_PR
          WHEN '6' THEN pregunta.ETIQSEIS_PR
          WHEN '7' THEN pregunta.ETIQSIETE_PR
          WHEN '8' THEN pregunta.ETIQOCHO_PR
          WHEN '9' THEN pregunta.ETIQNUEVE_PR
          WHEN '10' THEN pregunta.ETIQDIEZ_PR
          ELSE evaluacion.VAL_EV
        END AS respuesta
      FROM
        evaluacion
        JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
        JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
        JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
        JOIN usuario ON usuario.COD_US = evaluacion.COD_US
      WHERE 
        STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${!todasUsuarios ? `AND usuario.COD_US IN (${listaUsuarios})` : ''}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
	    ORDER BY CODIGO_RESPUESTA;
    `;
    mysql_1.default.ejecutarQuery(query, (err, resumen) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                resumen,
            });
        }
    });
});
// LISTA DE CODIGOS DE RESPUESTA SEGUN SUCURSALES
router.get("/codigosRespuesta/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:encuestas/:sucursales/:usuarios", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaUsuarios = req.params.usuarios;
    const usuariossArray = listaUsuarios.split(",");
    let todasSucursales = false;
    let todasEncuestas = false;
    let todasUsuarios = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (usuariossArray.includes("-2")) {
        todasUsuarios = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT
        DISTINCT evaluacion.CODIGO_RESPUESTA,
        encuesta.NOM_EN AS encuesta,
        encuesta.COD_EN,
        sucursal.NOM_SUC AS sucursal,
        sucursal.COD_SUC,
        usuario.NOM_US
      FROM
        evaluacion
        JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
        JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
        JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
        JOIN usuario ON usuario.COD_US = evaluacion.COD_US
      WHERE 
        STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${!todasUsuarios ? `AND usuario.COD_US IN (${listaUsuarios})` : ''}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
	    ORDER BY CODIGO_RESPUESTA;
    `;
    mysql_1.default.ejecutarQuery(query, (err, resumen) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                resumen,
            });
        }
    });
});
// RESPUESTAS DE ENCUESTAS
router.get("/respuestasEncuestas/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;
    if (sucursalesArray.includes("-2")) {
        todasSucursales = true;
    }
    const query = `
      SELECT evaluacion.COD_PR, evaluacion.FECH_EV AS fecha_hora,
        HOUR(evaluacion.FECH_EV) AS hora,
        MINUTE(evaluacion.FECH_EV) AS minutos,
        SECOND(evaluacion.FECH_EV) AS segundos,
        DATE_FORMAT (evaluacion.FECH_EV,'%Y-%m-%d') AS fecha,
        CODIGO_RESPUESTA,
        CODIGO_SUCURSAL,
      CASE evaluacion.VAL_EV
        WHEN '1' THEN pregunta.ETIQUNO_PR
        WHEN '2' THEN pregunta.ETIQDOS_PR
        WHEN '3' THEN pregunta.ETIQTRES_PR
        WHEN '4' THEN pregunta.ETIQCUATRO_PR
        WHEN '5' THEN pregunta.ETIQCINCO_PR
        WHEN '6' THEN pregunta.ETIQSEIS_PR
        WHEN '7' THEN pregunta.ETIQSIETE_PR
        WHEN '8' THEN pregunta.ETIQOCHO_PR
        WHEN '9' THEN pregunta.ETIQNUEVE_PR
        WHEN '10' THEN pregunta.ETIQDIEZ_PR
        ELSE evaluacion.VAL_EV
      END AS respuesta
      FROM
        evaluacion
        JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
        JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
        ${!todasSucursales ? ` WHERE sucursal.COD_SUC IN (${listaSucursales})` : ''};
      `;
    mysql_1.default.ejecutarQuery(query, (err, respuestas) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                respuestas,
            });
        }
    });
});
router.get("/encuestascajeros/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:usuarios/:fecha/:estado", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    console.log('ver fecha desde ', fDesde);
    const fHasta = req.params.fechaHasta;
    console.log('ver fecha hasta ', fHasta);
    const hInicio = req.params.horaInicio;
    console.log('ver hora desde ', hInicio);
    const hFin = req.params.horaFin;
    console.log('ver hora hasta ', hFin);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaUsuarios = req.params.usuarios;
    const usuariossArray = listaUsuarios.split(",");
    const fecha = req.params.fecha;
    const estado = req.params.estado;
    let verFecha = true;
    let todasSucursales = false;
    let todasEncuestas = false;
    let todasUsuarios = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (usuariossArray.includes("-2")) {
        todasUsuarios = true;
    }
    // VALIDACION DE FECHAS
    if (fecha === "2") {
        verFecha = false;
    }
    let comprobarestado = '';
    if (estado == '3') {
        comprobarestado = `usuario.ESTADO_US != 0`;
    }
    else {
        comprobarestado = `usuario.ESTADO_US = ${estado}`;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT 
        encuesta.COD_EN AS codigo_encuesta,
        encuesta.NOM_EN AS nombre_encuesta,

        ${listaUsuarios != '0N' ?
        `usuario.COD_US AS codigo_usuario,
        usuario.NOM_US AS nombre_usuario,`
        :
            ''}   

       
        sucursal.NOM_SUC AS nombre_sucursal,
        ${verFecha ? `DATE_FORMAT(evaluacion.FECH_EV, '%Y-%m-%d') AS Fecha,` : ''}
        COUNT(DISTINCT evaluacion.CODIGO_RESPUESTA) AS encuestas_realizadas
      FROM 
        evaluacion
        JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
        JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
       JOIN usuario ON usuario.COD_US = evaluacion.COD_US
        JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
      WHERE 
        STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${listaUsuarios != '0N' ? ` ${!todasUsuarios ? `AND usuario.COD_US IN (${listaUsuarios}) AND ${comprobarestado}` : ` AND ${comprobarestado}`}` : ` AND ${comprobarestado}`}   
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
      GROUP BY 
        ${verFecha ? `` : ``}
       ${listaUsuarios != '0N' ?
        `encuesta.COD_EN, encuesta.NOM_EN, usuario.COD_US, usuario.NOM_US
        ${verFecha ? `,DATE_FORMAT(evaluacion.FECH_EV, '%Y-%m-%d')` : ``}
        ,sucursal.NOM_SUC; `
        :
            `encuesta.COD_EN, encuesta.NOM_EN
        ${verFecha ? `,DATE_FORMAT(evaluacion.FECH_EV, '%Y-%m-%d')` : ``}
        , sucursal.NOM_SUC; `}   
        
      `;
    console.log("ver el query", query);
    mysql_1.default.ejecutarQuery(query, (err, resumen) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                resumen,
            });
        }
    });
});
router.get("/encuesta-sucursal/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:usuarios", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    console.log('ver fecha desde ', fDesde);
    const fHasta = req.params.fechaHasta;
    console.log('ver fecha hasta ', fHasta);
    const hInicio = req.params.horaInicio;
    console.log('ver hora desde ', hInicio);
    const hFin = req.params.horaFin;
    console.log('ver hora hasta ', hFin);
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaUsuarios = req.params.usuarios;
    const usuariossArray = listaUsuarios.split(",");
    let todasSucursales = false;
    let todasEncuestas = false;
    let todasUsuarios = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    if (usuariossArray.includes("-2")) {
        todasUsuarios = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT 
        sucursal.NOM_SUC AS sucursal,
	      evaluacion.CODIGO_RESPUESTA AS codigo_respuesta,
        encuesta.COD_EN AS codigo_encuesta,
        encuesta.NOM_EN AS nombre_encuesta,
        usuario.NOM_US AS nombre_usuario,
          (SELECT COUNT(pregunta.COD_PR) AS total_preguntas 
          FROM pregunta, encuesta
          WHERE pregunta.COD_EN = encuesta.COD_EN AND encuesta.COD_EN = codigo_encuesta) AS numero_preguntas,
        COUNT(evaluacion.CODIGO_RESPUESTA) AS conteo_respuestas
      FROM 
        evaluacion
        JOIN pregunta ON evaluacion.COD_PR = pregunta.COD_PR
        JOIN encuesta ON pregunta.COD_EN = encuesta.COD_EN
        JOIN sucursal ON sucursal.COD_SUC = evaluacion.CODIGO_SUCURSAL
        JOIN usuario ON usuario.COD_US = evaluacion.COD_US
      WHERE 
        STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasSucursales ? `AND sucursal.COD_SUC IN (${listaSucursales})` : ''}
        ${!todasEncuestas ? `AND encuesta.COD_EN IN (${listaEncuestas})` : ''}
        ${!todasUsuarios ? `AND usuario.COD_US IN (${listaUsuarios})` : ''}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
	    GROUP BY 
        sucursal, codigo_respuesta, encuesta.COD_EN, nombre_usuario
      ORDER BY 
        sucursal, codigo_respuesta, encuesta.COD_EN;
      `;
    mysql_1.default.ejecutarQuery(query, (err, resumen) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                resumen,
            });
        }
    });
});
/** ************************************************************************************************************ **
 ** **                               ENTRADAS Y SALIDAD DEL SISTEMA                                           ** **
 ** ************************************************************************************************************ **/
router.get("/entradasistema/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:cajeros", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaCajeros = req.params.cajeros;
    const cajerosArray = listaCajeros.split(",");
    let todasCajeros = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (cajerosArray.includes("-2")) {
        todasCajeros = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT
        sc.NOM_SUC,
        actividad.COD_AC AS actividad_COD_AC,
        actividad.COD_US AS actividad_COD_US,
        CAST(STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d %H:%i:%s') AS CHAR) AS Fecha,
        CAST(STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d') AS CHAR) AS fecha_,
        CAST(DATE_FORMAT(actividad.FECH_ULT, "%H:%i:%S") AS CHAR) as hora_,
        usuario.NOM_US AS Usuario
      FROM
        usuario usuario 
      INNER JOIN actividad actividad ON usuario.COD_US = actividad.COD_US
      INNER JOIN puestotrabajo pt ON pt.COD_US = usuario.COD_US
      INNER JOIN servicio s ON s.COD_SER = pt.COD_SER
      INNER JOIN sucursal sc ON sc.COD_SUC = s.COD_SUC
      WHERE STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        AND usuario.TIPO_US = 'Trabajador'
        ${!todasCajeros ? `AND actividad.COD_US IN (${listaCajeros})` : ''} 
        ${!diaCompleto ? `AND HOUR(actividad.FECH_ULT) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''};
      `;
    console.log('query ', query);
    mysql_1.default.ejecutarQuery(query, (err, turnos) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                turnos,
            });
        }
    });
});
exports.default = router;
