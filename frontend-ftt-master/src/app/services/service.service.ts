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

  private URL = "http://192.168.0.145:3006";

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

  /** ****************************************************************************************************************** **
   ** **                                  TRATAMIENTO DATOS USUARIOS - CAJEROS                                        ** **
   ** ****************************************************************************************************************** **/

  getAllCajerosS(): Observable<cajero[]> {
    return this.http.get<cajero[]>(this.URL + "/getallcajeros");
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
