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
 ** **                                      TURNOS POR FECHA                                                  ** **
 ** ************************************************************************************************************ **/
router.get("/turnosfecha", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
        SELECT usua_nombre as Usuario, serv_nombre as Servicio,
            date_format(turn_fecha, "%Y-%m-%d") as Fecha, SUM(turn_estado = 1) AS Atendidos,
            SUM( turn_estado != 1 AND turn_estado != 0) AS No_Atendidos,
            SUM(turn_estado != 0) AS Total 
        FROM turno t, servicio s, usuarios u, cajero c
        WHERE t.serv_codigo = s.serv_codigo 
            AND t.caje_codigo = c.caje_codigo 
            AND u.usua_codigo = c.usua_codigo 
        GROUP BY Fecha, Usuario, Servicio
        ORDER BY Usuario, Fecha, Servicio;
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
router.get("/getallcajeros", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
        SELECT * FROM cajero usua_codigo != 2 ORDER BY caje_nombre ASC;
        `;
    mysql_1.default.ejecutarQuery(query, (err, cajeros) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        }
        else {
            res.json({
                ok: true,
                cajeros,
            });
        }
    });
});
router.get("/getallcajeros/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    const query = ` SELECT * FROM usuario`;
    // const query = `
    //           SELECT c.caje_codigo, c.usua_codigo, c.caje_nombre, c.caje_estado 
    //           FROM cajero c, usuarios u 
    //           WHERE u.usua_codigo = c.usua_codigo
    //           ${!todasSucursales ? `AND u.empr_codigo IN (${listaSucursales})` : ''}
    //           AND u.usua_codigo != 2
    //           ORDER BY c.caje_nombre ASC;
    //           `;
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
router.get("/getallencuestas/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    // const query = ` SELECT * FROM usuario`;
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
router.get("/getallpreguntas/:encuestas", verifivarToken_1.TokenValidation, (req, res) => {
    const listaEncuestas = req.params.encuestas;
    const encuestasArray = listaEncuestas.split(",");
    let todasEncuestas = false;
    if (encuestasArray.includes("-2")) {
        todasEncuestas = true;
    }
    // const query = ` SELECT * FROM usuario`;
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
router.get("/getallfechas/:cajero/:encuesta/:fechaDesde/:fechaHasta/:horaInicio/:horaFin", verifivarToken_1.TokenValidation, (req, res) => {
    const cajero = req.params.cajero;
    const encuesta = req.params.encuesta;
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    let diaCompleto = false;
    let hFinAux = 0;
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    // const query = ` SELECT * FROM usuario`;
    const query = `
            SELECT COD_EV, 
            CAST(STR_TO_DATE(FECH_EV,'%Y-%m-%d %H:%i:%s') AS CHAR) AS Fecha
            FROM evaluacion WHERE COD_US = ${cajero} 
            AND COD_PR IN (SELECT COD_PR FROM pregunta WHERE COD_EN = ${encuesta}) 
            AND STR_TO_DATE(FECH_EV,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
            ${!diaCompleto ? `AND HOUR(FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
            ORDER BY FECH_EV DESC;
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
 ** **                               TIEMPO PROMEDIO DE ATENCION                                              ** **
 ** ************************************************************************************************************ **/
router.get("/tiempopromedioatencion/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:listaCodigos/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaCodigos = req.params.listaCodigos;
    const codigosArray = listaCodigos.split(",");
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todosCajeros = false;
    let todasSucursales = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (codigosArray.includes("-2")) {
        todosCajeros = true;
    }
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    let query = `
    SELECT e.empr_nombre AS nombreEmpresa, serv_nombre AS Servicio, caje_nombre AS Nombre, 
    COUNT(turn_codigo) AS Turnos, 
    TIME_FORMAT(sec_to_time(AVG(IFNUll(turn_duracionatencion, 0))), '%H:%i:%s') AS Promedio 
    FROM cajero c, turno t, servicio s, empresa e, usuarios u
    WHERE t.caje_codigo = c.caje_codigo 
    AND t.serv_codigo = s.serv_codigo 
    AND s.empr_codigo = e.empr_codigo  
    AND c.usua_codigo = u.usua_codigo
    AND t.turn_fecha BETWEEN '${fDesde}' AND '${fHasta}' 
    AND u.usua_codigo != 2
    ${!todasSucursales ? `AND u.empr_codigo IN (${listaSucursales})` : ''}
    ${!todosCajeros ? `AND c.caje_codigo IN (${listaCodigos})` : ''}
    ${!diaCompleto ? `AND t.turn_hora BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
    GROUP BY nombreEmpresa, Nombre, Servicio;
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
 ** **                               TIEMPO DE ATENCION POR TURNOS                                            ** **
 ** ************************************************************************************************************ **/
router.get("/tiempoatencionturnos/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:listaCodigos/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaCodigos = req.params.listaCodigos;
    const codigosArray = listaCodigos.split(",");
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todosCajeros = false;
    let todasSucursales = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (codigosArray.includes("-2")) {
        todosCajeros = true;
    }
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    let query = `
    SELECT e.empr_nombre AS nombreEmpresa, CAST(CONCAT(s.serv_descripcion,t.turn_numero) AS CHAR) AS turno, serv_nombre AS Servicio, caje_nombre AS Nombre, 
    sec_to_time(time_to_sec(turn_tiempoespera)) AS espera,
    sec_to_time(IFNUll(turn_duracionatencion, 0)) AS atencion,
    date_format(t.TURN_FECHA, '%Y-%m-%d') AS TURN_FECHA,
    CAST(CONCAT(LPAD(t.turn_hora, 2, '0'), ':', LPAD(t.turn_minuto, 2, '0')) AS CHAR) AS hora
    FROM cajero c, turno t, servicio s, empresa e, usuarios u
    WHERE t.caje_codigo = c.caje_codigo 
    AND t.serv_codigo = s.serv_codigo 
    AND s.empr_codigo = e.empr_codigo  
    AND c.usua_codigo = u.usua_codigo
    AND t.turn_fecha BETWEEN '${fDesde}' AND '${fHasta}' 
    AND u.usua_codigo != 2
    ${!todasSucursales ? `AND u.empr_codigo IN (${listaSucursales})` : ''}
    ${!todosCajeros ? `AND c.caje_codigo IN (${listaCodigos})` : ''}
    ${!diaCompleto ? `AND t.turn_hora BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
    ORDER BY t.turn_codigo DESC, t.TURN_FECHA DESC, hora DESC;
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
router.get("/tiempopromedioatencion", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
        SELECT serv_nombre AS Servicio, caje_nombre as Nombre,
            COUNT(turn_codigo) AS Turnos, 
            date_format(sec_to_time(AVG(IFNUll(turn_duracionatencion, 0))), '%H:%i:%s') AS Promedio 
        FROM cajero c, turno t, servicio s 
        WHERE t.caje_codigo = c.caje_codigo 
        AND t.serv_codigo = s.serv_codigo
        GROUP BY Nombre, Servicio
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
router.get("/entradasalidasistema/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
      SELECT e.empr_nombre AS nombreEmpresa,
      usua_nombre AS Usuario,
      CAST(STR_TO_DATE(reg_fecha,'%Y-%m-%d') AS CHAR) AS fecha,
      CAST(CONCAT(LPAD(reg_hora, 2, '0'), ':', LPAD(reg_minuto, 2, '0')) AS CHAR) AS hora,
      CASE r.reg_estado
                WHEN 1 THEN 'Entrada Servicio'
                WHEN 2 THEN 'Salida Servicio'
                WHEN 3 THEN 'Entrada Emisión'
                ELSE 'Salida Emisión'
            END AS Razon
      FROM registro r, usuarios u, empresa e
      WHERE r.usua_codigo = u.usua_codigo
      ${todasSucursales ? 'AND u.empr_codigo = e.empr_codigo' : `AND u.empr_codigo IN (${listaSucursales})`}
      AND reg_fecha BETWEEN '${fDesde}' AND '${fHasta}'
      ${!diaCompleto ? `AND r.reg_hora BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
      AND u.usua_codigo != 2
      ORDER BY fecha DESC, hora DESC;
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
 ** **                                       ATENCION AL USUARIO                                              ** **
 ** ************************************************************************************************************ **/
router.get("/atencionusuario", verifivarToken_1.TokenValidation, (req, res) => {
    const query = `
        SELECT usua_nombre AS Nombre, serv_nombre AS Servicio,
            SUM(turn_estado = 1) AS Atendidos
        FROM usuarios u, turno t, cajero c, servicio s
        WHERE u.usua_codigo = c.usua_codigo 
            AND c.caje_codigo = t.caje_codigo 
            AND t.serv_codigo = s.serv_codigo 
        GROUP BY Nombre, Servicio
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
router.get("/atencionusuario/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:listaCodigos/:sucursales", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaCodigos = req.params.listaCodigos;
    const codigosArray = listaCodigos.split(",");
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todosCajeros = false;
    let todasSucursales = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (codigosArray.includes("-2")) {
        todosCajeros = true;
    }
    if (sucursalesArray.includes("-1")) {
        todasSucursales = true;
    }
    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
        diaCompleto = true;
    }
    else {
        hFinAux = parseInt(hFin) - 1;
    }
    const query = `
    SELECT e.empr_nombre AS nombreEmpresa, usua_nombre AS Nombre, serv_nombre AS Servicio, 
        SUM(turn_estado = 1) AS Atendidos,
        SUM(turn_estado != 1 AND turn_estado != 0) AS No_Atendidos, 
        SUM(turn_estado != 0) AS Total 
    FROM usuarios u, turno t, cajero c, servicio s, empresa e 
    WHERE u.usua_codigo = c.usua_codigo 
        AND c.caje_codigo = t.caje_codigo 
        AND t.serv_codigo = s.serv_codigo 
        AND u.empr_codigo = e.empr_codigo 
        AND turn_fecha BETWEEN '${fDesde}' AND '${fHasta}'
        AND u.usua_codigo != 2 
        ${!todasSucursales ? `AND u.empr_codigo IN (${listaSucursales})` : ''}
        ${!todosCajeros ? `AND c.caje_codigo IN (${listaCodigos})` : ''}
        ${!diaCompleto ? `AND t.turn_hora BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
        GROUP BY Servicio, Nombre
        ORDER BY  Nombre ASC, Servicio ASC;
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
 ** **                                          TURNOS POR FECHA                                              ** **
 ** ************************************************************************************************************ **/
router.get("/turnosfecha/:fecha", verifivarToken_1.TokenValidation, (req, res) => {
    let fechas = req.params.fecha;
    const query = `
        SELECT usua_nombre AS Usuario, serv_nombre AS Servicio, turn_fecha AS Fecha, 
            SUM(turn_estado = 1) AS Atendidos, 
            SUM(turn_estado != 1 AND turn_estado != 0) AS No_Atendidos, 
            SUM(turn_estado != 0) AS Total  
        FROM turno t, servicio s, usuarios u, cajero c 
        WHERE t.serv_codigo = s.serv_codigo 
            AND t.caje_codigo = c.caje_codigo 
            AND u.usua_codigo = c.usua_codigo 
            AND turn_fecha = '${fechas}'  
        GROUP BY Fecha, Usuario, Servicio 
        ORDER BY Usuario, Fecha DESC, Servicio;`;
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
//Entradas al sistema
router.get("/turnosfechas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:cajeros", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    // const listaSucursales = req.params.sucursales;
    // const sucursalesArray = listaSucursales.split(",");
    const listaCajeros = req.params.cajeros;
    const cajerosArray = listaCajeros.split(",");
    // let todasSucursales = false;
    let todasCajeros = false;
    let diaCompleto = false;
    let hFinAux = 0;
    // if (sucursalesArray.includes("-1")) {
    //   todasSucursales = true
    // }
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
router.get("/turnostotalfechas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:preguntas", verifivarToken_1.TokenValidation, (req, res) => {
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
router.get("/turnosmeta/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:cajero/:encuesta/:fechas", verifivarToken_1.TokenValidation, (req, res) => {
    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const cajero = req.params.cajero;
    const encuesta = req.params.encuesta;
    const listaFechas = req.params.fechas;
    const fechasArray = listaFechas.split(",");
    let todasFechas = false;
    let diaCompleto = false;
    let hFinAux = 0;
    if (fechasArray.includes("-2")) {
        todasFechas = true;
    }
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
       evaluacion.COD_PR IN (SELECT cod_pr FROM PREGUNTA WHERE cod_en = 1) AND evaluacion.COD_US = 2
       AND STR_TO_DATE(evaluacion.FECH_EV,'%Y-%m-%d %H:%i:%s') BETWEEN '${fDesde}' AND '${fHasta}'
       ${!todasFechas ? `AND evaluacion.COD_EV IN (${listaFechas})` : ''}
       ${!diaCompleto ? `AND t.turn_hora BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
    ORDER BY evaluacion.COD_PR ASC;
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
exports.default = router;
