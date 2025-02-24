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
      //console.log(err);
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
      //console.log(err);
    } else {
      res.json({
        ok: true,
        cajeros,
      });
    }
  });
});

// BUSCAR CAJEROS DE ACUERDO A LA SUCURSAL
router.get("/getallcajeros/:sucursales/:estado", TokenValidation, (req: Request, res: Response) => {
  // 1 --> INACTIVOS
  // 2 --> ACTIVOS
  // 3 --> TODOS
  // FILTROS SUCURSALES
  //console.log(' sucursales ', req.params.sucursales);
  //console.log('estado ', req.params.estado)
  const listaSucursales = req.params.sucursales;
  const sucursalesArray = listaSucursales.split(",");
  let todasSucursales = false;
  // VALIDACIONES SUCURSALES
  if (sucursalesArray.includes("-1")) {
    todasSucursales = true
  }
  // FILTROS ESTADO
  const estado_usuario: any = req.params.estado;
  let estado = ``;
  if (estado_usuario != 3) {
    estado = `AND ESTADO_US = ${estado_usuario}`
  }

  const query =
    `
    SELECT u.COD_US, u.CI_US, u.NOM_US, u.TIPO_US, u.ESTADO_US, sc.NOM_SUC 
    FROM
      usuario u
    JOIN puestotrabajo pt ON pt.COD_US = u.COD_US
    JOIN servicio s ON s.COD_SER = pt.COD_SER
    JOIN sucursal sc ON sc.COD_SUC = s.COD_SUC
    WHERE u.TIPO_US = 'Trabajador'
      ${!todasSucursales ? `AND sc.COD_SUC IN (${listaSucursales})` : ''}
      ${estado}
    `;

  //console.log('query usuario ', query)
  MySQL.ejecutarQuery(query, (err: any, cajeros: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      //console.log(err);
    } else {
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
router.get("/cambiarestadocajeros/:sucursales", TokenValidation, (req: Request, res: Response) => {

  const listaSucursales = req.params.sucursales;
  const query = `
  UPDATE  usuario u
  SET 
  
    u.ESTADO_US = CASE 
                    WHEN u.ESTADO_US = 2 THEN 1
                    WHEN u.ESTADO_US = 1 THEN 2
                    ELSE u.ESTADO_US
                    END
  WHERE u.COD_US IN (${listaSucursales});
`;

  MySQL.ejecutarQuery(query, (err: any, cajeros: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      //console.log(err);
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
      //console.log(err);
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
  
  //console.log('ver query preguntas encuesta ', query)
  MySQL.ejecutarQuery(query, (err: any, preguntas: Object[]) => {
    if (err) {
      res.status(400).json({
        ok: false,
        error: err,
      });
      //console.log(err);
    } else {
      res.json({
        ok: true,
        preguntas,
      });
    }
  });
});


/** ************************************************************************************************************ **
 ** **                                     RESUMEN DE PREGUNTAS                                               ** **
 ** ************************************************************************************************************ **/

// LISTA DE CODIGOS DE RESPUESTA SEGUN SUCURSALES
router.get(
  "/codigosRespuesta/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:encuestas/:sucursales/:usuarios/:estado", TokenValidation,
  (req: Request, res: Response) => {

    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const estado = req.params.estado;

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
      todasSucursales = true
    }

    if (encuestasArray.includes("-2")) {
      todasEncuestas = true
    }

    if (usuariossArray.includes("-2")) {
      todasUsuarios = true
    }

    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
      diaCompleto = true;
    } else {
      hFinAux = parseInt(hFin) - 1;
    }

    let comprobarestado = ''
    if (estado == '3') {
      comprobarestado = `usuario.ESTADO_US != 0`
    } else {
      comprobarestado = `usuario.ESTADO_US = ${estado}`
    }

    const query =
      `
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
        ${!todasUsuarios ? `AND usuario.COD_US IN (${listaUsuarios}) AND ${comprobarestado} ` : `AND ${comprobarestado}`}
        ${!diaCompleto ? `AND HOUR(evaluacion.FECH_EV) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''}
	    ORDER BY CODIGO_RESPUESTA;
    `;
    MySQL.ejecutarQuery(query, (err: any, resumen: Object[]) => {
      if (err) {
        res.status(400).json({
          ok: false,
          error: err,
        });
      } else {
        res.json({
          ok: true,
          resumen,
        });
      }
    });
  }
);


// RESPUESTAS DE ENCUESTAS
router.get(
  "/respuestasEncuestas/:sucursales", TokenValidation,
  (req: Request, res: Response) => {
    const listaSucursales = req.params.sucursales;
    const sucursalesArray = listaSucursales.split(",");
    let todasSucursales = false;

    if (sucursalesArray.includes("-1")) {
      todasSucursales = true
    }

    const query =
      `
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
    
      //console.log('ver respuestas ', query)
    MySQL.ejecutarQuery(query, (err: any, respuestas: Object[]) => {
      if (err) {
        res.status(400).json({
          ok: false,
          error: err,
        });
      } else {
        res.json({
          ok: true,
          respuestas,
        });
      }
    });
  }
);


router.get(
  "/encuestascajeros/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:sucursales/:encuestas/:usuarios/:fecha/:estado", TokenValidation,
  (req: Request, res: Response) => {

    const fDesde = req.params.fechaDesde;
    //console.log('ver fecha desde ', fDesde)
    const fHasta = req.params.fechaHasta;
    //console.log('ver fecha hasta ', fHasta)
    const hInicio = req.params.horaInicio;
    //console.log('ver hora desde ', hInicio)
    const hFin = req.params.horaFin;
    //console.log('ver hora hasta ', hFin)
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
      todasSucursales = true
    }

    if (encuestasArray.includes("-2")) {
      todasEncuestas = true
    }

    if (usuariossArray.includes("-2")) {
      todasUsuarios = true
    }

    // VALIDACION DE FECHAS
    if (fecha === "2") {
      verFecha = false;
    }

    let comprobarestado = ''
    if (estado == '3') {
      comprobarestado = `usuario.ESTADO_US != 0`
    } else {
      comprobarestado = `usuario.ESTADO_US = ${estado}`
    }

    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
      diaCompleto = true;
    } else {
      hFinAux = parseInt(hFin) - 1;
    }

    const query =
      `
      SELECT 
        encuesta.COD_EN AS codigo_encuesta,
        encuesta.NOM_EN AS nombre_encuesta,

        ${listaUsuarios != '0N' ?
        `usuario.COD_US AS codigo_usuario,
        usuario.NOM_US AS nombre_usuario,`
        :
        ''
      }   

       
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
        
      `
    //console.log("ver el query", query)
    MySQL.ejecutarQuery(query, (err: any, resumen: Object[]) => {
      if (err) {
        res.status(400).json({
          ok: false,
          error: err,
        });
      } else {
        res.json({
          ok: true,
          resumen,
        });
      }
    });
  }
);


/** ************************************************************************************************************ **
 ** **                               ENTRADAS Y SALIDAD DEL SISTEMA                                           ** **
 ** ************************************************************************************************************ **/

router.get(
  "/entradasistema/:fechaDesde/:fechaHasta/:horaInicio/:horaFin/:cajeros/:estado", TokenValidation,
  (req: Request, res: Response) => {

    const fDesde = req.params.fechaDesde;
    const fHasta = req.params.fechaHasta;
    const hInicio = req.params.horaInicio;
    const hFin = req.params.horaFin;
    const listaCajeros = req.params.cajeros;
    const estado = req.params.estado;


    const cajerosArray = listaCajeros.split(",");
    let todasCajeros = false;
    let diaCompleto = false;
    let hFinAux = 0;

    if (cajerosArray.includes("-2")) {
      todasCajeros = true
    }

    
    let comprobarestado = ''
    if (estado == '3') {
      comprobarestado = `usuario.ESTADO_US != 0`
    } else {
      comprobarestado = `usuario.ESTADO_US = ${estado}`
    }

    

    if ((hInicio == "-1") || (hFin == "-1") || (parseInt(hInicio) > parseInt(hFin))) {
      diaCompleto = true;
    } else {
      hFinAux = parseInt(hFin) - 1;
    }

    const query =
      `
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
        ${!todasCajeros ? `AND actividad.COD_US IN (${listaCajeros}) AND ${comprobarestado}  ` : `AND ${comprobarestado}`} 
        ${!diaCompleto ? `AND HOUR(actividad.FECH_ULT) BETWEEN '${hInicio}' AND '${hFinAux}' ` : ''};
      `;
    //console.log('query ', query)
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
