import { Router, Request, Response } from "express";
import { TokenValidation } from '../libs/verifivarToken';
import MySQL from "../mysql/mysql";

const router = Router();

/** ************************************************************************************************************ **
 ** **                                     TRATAMIENTO SUCURSALES                                             ** **
 ** ************************************************************************************************************ **/

router.get("/getallsucursales", TokenValidation, (req: Request, res: Response) => {
  const query =
    `
    SELECT * FROM sucursal ORDER BY NOM_SUC ASC;
    `;
  MySQL.ejecutarQuery(query, (err: any, empresas: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      console.log(err);
    } else {
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

router.get("/getallcajeros", TokenValidation, (req: Request, res: Response) => {

  const query =
    `
    SELECT * FROM usuario WHERE TIPO_US = 'Trabajador'
    `;
  MySQL.ejecutarQuery(query, (err: any, cajeros: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      console.log(err);
    } else {
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

router.get("/getallencuestas/:sucursales", TokenValidation, (req: Request, res: Response) => {

  const listaSucursales = req.params.sucursales;
  const sucursalesArray = listaSucursales.split(",");
  let todasSucursales = false;
  if (sucursalesArray.includes("-1")) {
    todasSucursales = true
  }
  const query =
    `
    SELECT encuesta.COD_EN, encuesta.NOM_EN
    FROM sucursal
    JOIN sucursalxencuesta ON sucursal.COD_SUC = sucursalxencuesta.COD_SUC
    JOIN encuesta ON sucursalxencuesta.COD_EN = encuesta.COD_EN
      ${!todasSucursales ? `WHERE sucursal.COD_SUC IN (${listaSucursales})` : ''};
    `;
  MySQL.ejecutarQuery(query, (err: any, cajeros: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      console.log(err);
    } else {
      res.json({
        ok: true,
        cajeros,
      });
    }
  });
});


/** ************************************************************************************************************ **
 ** **                                  TRATAMIENTO PREGUNTAS                                                 ** **
 ** ************************************************************************************************************ **/

router.get("/getallpreguntas/:encuestas", TokenValidation, (req: Request, res: Response) => {
  const listaEncuestas = req.params.encuestas;
  const encuestasArray = listaEncuestas.split(",");
  let todasEncuestas = false;
  if (encuestasArray.includes("-2")) {
    todasEncuestas = true
  }
  const query =
    `
    SELECT * FROM pregunta
      ${!todasEncuestas ? `WHERE COD_EN IN (${listaEncuestas})` : ''};
    `;
  MySQL.ejecutarQuery(query, (err: any, cajeros: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      console.log(err);
    } else {
      res.json({
        ok: true,
        cajeros,
      });
    }
  });
});

router.get(
  "/preguntasrespuestas/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:usuarios/:encuesta/:preguntas", TokenValidation,
  (req: Request, res: Response) => {

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
      todasEncuestas = true
    }

    if (usuariosArray.includes("-2")) {
      todosUsuarios = true
    }

    if (preguntasArray.includes("-2")) {
      todasPreguntas = true
    }

    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
      diaCompleto = true;
    } else {
      hFinAux = parseInt(hFin) - 1;
    }

    const query =
      `
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
    MySQL.ejecutarQuery(query, (err: any, turnos: Object[]) => {
      if (err) {
        res.status(400).json({
          ok: false,
          error: err,
        });
      } else {
        res.json({
          ok: true,
          turnos,
        });
      }
    });
  }
);


/** ************************************************************************************************************ **
 ** **                                     RESUMEN DE PREGUNTAS                                               ** **
 ** ************************************************************************************************************ **/

router.get(
  "/respuestasresumen/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:preguntas", TokenValidation,
  (req: Request, res: Response) => {

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
      todasSucursales = true
    }

    if (encuestasArray.includes("-2")) {
      todasEncuestas = true
    }

    if (preguntasArray.includes("-2")) {
      todasPreguntas = true
    }

    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
      diaCompleto = true;
    } else {
      hFinAux = parseInt(hFin) - 1;
    }

    const query =
      `
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
    MySQL.ejecutarQuery(query, (err: any, turnos: Object[]) => {
      if (err) {
        res.status(400).json({
          ok: false,
          error: err,
        });
      } else {
        res.json({
          ok: true,
          turnos,
        });
      }
    });
  }
);


/** ************************************************************************************************************ **
 ** **                               ENTRADAS Y SALIDAD DEL SISTEMA                                           ** **
 ** ************************************************************************************************************ **/

router.get(
  "/entradasistema/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:cajeros", TokenValidation,
  (req: Request, res: Response) => {

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
      todasCajeros = true
    }

    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
      diaCompleto = true;
    } else {
      hFinAux = parseInt(hFin) - 1;
    }

    const query =
      `
      SELECT
        actividad.COD_AC AS actividad_COD_AC,
        actividad.COD_US AS actividad_COD_US,
        CAST(STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d %H:%i:%s') AS CHAR) AS Fecha,
        CAST(STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d') AS CHAR) AS fecha_,
        CAST(DATE_FORMAT(actividad.FECH_ULT, "%H:%i:%S") AS CHAR) as hora_,
        usuario.NOM_US AS Usuario
      FROM
        usuario usuario INNER JOIN actividad actividad ON usuario.COD_US = actividad.COD_US
      WHERE STR_TO_DATE(actividad.FECH_ULT,'%Y-%m-%d') BETWEEN '${fDesde}' AND '${fHasta}'
        ${!todasCajeros ? `AND actividad.COD_US IN (${listaCajeros})` : ''} 
        ${!diaCompleto ? `AND HOUR(actividad.FECH_ULT) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''};
      `;
    MySQL.ejecutarQuery(query, (err: any, turnos: Object[]) => {
      if (err) {
        res.status(400).json({
          ok: false,
          error: err,
        });
      } else {
        res.json({
          ok: true,
          turnos,
        });
      }
    });
  }
);

export default router;
