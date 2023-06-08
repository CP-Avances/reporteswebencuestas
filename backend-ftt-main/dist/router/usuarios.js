"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifivarToken_1 = require("../libs/verifivarToken");
const express_1 = require("express");
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
    const query = `SELECT * FROM usuario`;
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
router.get("/encuestausuarios/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:cajero/:encuesta", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const cajero = req.params.cajero;
    const encuesta = req.params.encuesta;
    let diaCompleto = false;
    let hFinAux = 0;
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
        SELECT DISTINCT
        DISTINCT(evaluacion.COD_PR),
        evaluacion.COD_EV,
        evaluacion.VAL_EV AS evaluacion_VAL_EV,
        pregunta.SEC_PR AS pregunta_SEC_PR,
        pregunta.PREG_PR AS pregunta_PREG_PR,
        usuario.NOM_US AS usuario_NOM_US,
        encuesta.NOM_EN AS encuesta_NOM_EN,
        CAST(STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d %H:%i:%s') AS CHAR) AS fecha,
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
        PREGUNTA pregunta INNER JOIN EVALUACION evaluacion ON pregunta.COD_PR = evaluacion.COD_PR
        INNER JOIN ENCUESTA encuesta ON pregunta.COD_EN = encuesta.COD_EN
        INNER JOIN USUARIO usuario ON evaluacion.COD_US = usuario.COD_US
    WHERE
       evaluacion.COD_PR IN (SELECT cod_pr FROM PREGUNTA WHERE cod_en = ${encuesta}) AND evaluacion.COD_US = ${cajero}
       AND STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
       ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
    ORDER BY evaluacion.COD_PR ASC;
    `;
    mysql_1.default.ejecutarQuery(query, (err, turnos) => {
        if (err) {
            console.log('error ', err);
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
router.get("/preguntasrespuestas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:preguntas", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    const listaPreguntas = req.params.preguntas;
    const preguntasArray = listaPreguntas.split(",");
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
    pregunta.SEC_PR AS titulo,
    pregunta.PREG_PR AS pregunta,
    encuesta.NOM_EN AS encuesta,
    sucursal.NOM_SUC AS sucursal,
    CAST(STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d %H:%i:%s') AS CHAR) AS fecha,
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
    ORDER BY fecha DESC;
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
    actividad.COD_AC AS actividad_COD_AC,
    actividad.COD_US AS actividad_COD_US,
    CAST(STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d %H:%i:%s') AS CHAR) AS Fecha,
    usuario.NOM_US AS Usuario
    FROM
    usuario usuario INNER JOIN actividad actividad ON usuario.COD_US = actividad.COD_US
    WHERE STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
    ${!todasCajeros ? `AND actividad.COD_US IN (${listaCajeros})` : ''} 
    ${!diaCompleto ? `AND HOUR(actividad.FECH_ULT) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
    ;`;
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
