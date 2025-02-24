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

  getEntradasSalidas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, cajeros: any, estado: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/entradasistema/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + cajeros  + "/" + estado);
  }


  /** ****************************************************************************************************************** **
   ** **                                    TRATAMIENTOS OPCION RESUMEN DE PREGUNTAS                                  ** **
   ** ****************************************************************************************************************** **/

  getCodigosRespuestas(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, encuestas: any, sucursales: any, usuarios: any, estado: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/codigosRespuesta/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + encuestas + "/" + sucursales + "/" + usuarios + "/" + estado);
  }

  getRespuestasEncuesta(sucursales: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/respuestasEncuestas/" + sucursales);
  }

  getEncuestasCajero(fechaDesde: any, fechaHasta: any, horaInicio: any, horaFin: any, sucursales: any, encuestas: any, usuarios: any, fecha: string, estado: any): Observable<servicio[]> {
    return this.http.get<servicio[]>(this.URL + "/encuestascajeros/" + fechaDesde + "/" + fechaHasta + "/" + horaInicio + "/" + horaFin + "/" + sucursales + "/" + encuestas + "/" + usuarios + "/" + fecha + "/" + estado);
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
