import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { servicio } from '../models/servicio';
import { empresa } from '../models/empresa';
import { cajero } from '../models/cajero';

@Injectable({
  providedIn: 'root'
})

export class ServiceService {

  private URL = "http://10.1.0.21:3006";

  constructor(
    private http: HttpClient
  ) { }

  /** ****************************************************************************************************************** **
   ** **                                        ENTRADAS AL SISTEMA                                                   ** **
   ** ****************************************************************************************************************** **/

  getEntradasSalidas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, cajeros: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/entradasistema/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + cajeros);
  }


  /** ****************************************************************************************************************** **
   ** **                             TRATAMIENTOS OPCION PREGUNTAS Y RESPUESTAS                                       ** **
   ** ****************************************************************************************************************** **/

  getPreguntasRespuestas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, usuarios: any, encuesta: any, preguntas): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/preguntasrespuestas/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + usuarios + "/" + encuesta + "/" + preguntas);
  }

  /** ****************************************************************************************************************** **
   ** **                                    TRATAMIENTOS OPCION RESUMEN DE PREGUNTAS                                  ** **
   ** ****************************************************************************************************************** **/

  getPreguntasResumen(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, sucursales: any, cajeros: any, preguntas): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/respuestasresumen/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + sucursales + "/" + cajeros + "/" + preguntas);
  }

  getResumenPreguntasSucursal(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, sucursales: any, encuestas: any, preguntas: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/preguntas-encuesta-sucursal/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + sucursales + "/" + encuestas + "/" + preguntas);
  }

  getResumenPreguntasRespuestas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, sucursales: any, encuestas: any, usuarios: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/encuesta-sucursal/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + sucursales + "/" + encuestas + "/" + usuarios);
  }

  getResumenEncuesta(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, encuestas: any, sucursales: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/resumenencuestas/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + encuestas + "/" + sucursales);
  }

  getListaPreguntasRespuestas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, encuestas: any, sucursales: any, usuarios: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/listapreguntasrespuestas/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + encuestas + "/" + sucursales + "/" + usuarios);
  }

  getCodigosRespuestas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, encuestas: any, sucursales: any, usuarios: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/codigosRespuesta/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + encuestas + "/" + sucursales + "/" + usuarios);
  }

  getRespuestasEncuesta(sucursales: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/respuestasEncuestas/" + sucursales);
  }

  getEncuestasCajero(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, sucursales: any, encuestas: any, usuarios: any, fecha: string, estado: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/encuestascajeros/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + sucursales + "/" + encuestas + "/" + usuarios+ "/" + fecha + "/" + estado);
  }

  /** ****************************************************************************************************************** **
   ** **                                  TRATAMIENTO DATOS USUARIOS - CAJEROS                                        ** **
   ** ****************************************************************************************************************** **/

  getAllCajerosS(): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/getallcajeros");
  }

  getCajerosEstado(sucursales: any, estado: any): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/getallcajeros/" + sucursales + "/" + estado);
  }


   // METODO PARA BUSCAR CAJEROS SEGUN SUCURSALES Y ESTADO
   actualizarEstadoCajerosSucursalEstado(sucursales: any): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/cambiarestadocajeros/" + sucursales);
  }


  /** ****************************************************************************************************************** **
   ** **                                     TRATAMIENTO DATOS SUCURSALES                                             ** **
   ** ****************************************************************************************************************** **/

  getAllSucursales(): Observable<empresa[]> {
    return this.http.get<empresa[]>(this.URL + "/getallsucursales");
  }


  /** ****************************************************************************************************************** **
   ** **                                      TRATAMIENTO DATOS ENCUESTAS                                             ** **
   ** ****************************************************************************************************************** **/

  getAllEncuestas(sucursales: any): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/getallencuestas/" + sucursales);
  }

  getEncuestasTotales(): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/getencuestastotales");
  }


  /** ****************************************************************************************************************** **
   ** **                                      TRATAMIENTO DATOS PREGUNTAS                                             ** **
   ** ****************************************************************************************************************** **/

  getAllPreguntas(encuestas: any): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/getallpreguntas/" + encuestas);
  }


  /** ****************************************************************************************************************** **
   ** **                                      TRATAMIENTO IMAGENES                                                    ** **
   ** ****************************************************************************************************************** **/

  setImagen(formdata: any) {
    return this.http.post<any>(`${this.URL}/uploadImage`, formdata);
  }

  getImagen(): Observable<any> {
    return this.http.get<any>(this.URL + "/nombreImagen");
  }


  /** ****************************************************************************************************************** **
   ** **                                    TRATAMIENTO MARCA DE AGUA                                                 ** **
   ** ****************************************************************************************************************** **/

  setMarca(marca: string) {
    return this.http.get<any>(`${this.URL}/setMarca/${marca}`);
  }

  getMarca(): Observable<any> {
    return this.http.get<any>(this.URL + "/getMarca");
  }

}
