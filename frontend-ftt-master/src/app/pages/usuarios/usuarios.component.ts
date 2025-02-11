import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { Utils } from "../../utils/util";
import { DateTime } from 'luxon';
import ExcelJS from 'exceljs';

import { AuthenticationService } from "../../services/authentication.service";
import { ImagenesService } from "../../shared/imagenes.service";
import { ServiceService } from "../../services/service.service";

// COMPLEMENTOS PARA PDF Y EXCEL
import * as XLSX from "xlsx";
import moment from "moment";
import { ValidacionesService } from "src/app/services/validaciones/validaciones.service";

const EXCEL_EXTENSION = ".xlsx";

@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.scss"],
})

export class UsuariosComponent implements OnInit {
  // SETEO DE FECHAS PRIMER DIA DEL MES ACTUAL Y DIA ACTUAL
  fromDate: any;
  toDate: any;

  // CAPTURA DE ELEMENTOS DE LA INTERFAZ VISUAL PARA TRATARLOS Y CAPTURAR DATOS
  @ViewChild("content") element: ElementRef;
  @ViewChild("fromDateTurnosFecha") fromDateTurnosFecha: ElementRef;
  @ViewChild("toDateTurnosFecha") toDateTurnosFecha: ElementRef;
  @ViewChild("fromDateTurnosTotalFecha") fromDateTurnosTotalFecha: ElementRef;
  @ViewChild("toDateTurnosTotalFecha") toDateTurnosTotalFecha: ElementRef;
  @ViewChild("fromDateResumen") fromDateResumen: ElementRef;
  @ViewChild("toDateResumen") toDateResumen: ElementRef;
  @ViewChild("fromDateEncuesta") fromDateEncuesta: ElementRef;
  @ViewChild("toDateEncuesta") toDateEncuesta: ElementRef;


  @ViewChild("fromDatePromAtencion") fromDatePromAtencion: ElementRef;
  @ViewChild("toDatePromAtencion") toDatePromAtencion: ElementRef;
  @ViewChild("fromDateTiempoAtencion") fromDateTiempoAtencion: ElementRef;
  @ViewChild("toDateTiempoAtencion") toDateTiempoAtencion: ElementRef;
  @ViewChild("fromDateAtencionUsua") fromDateAtencionUsua: ElementRef;
  @ViewChild("toDateAtencionUsua") toDateAtencionUsua: ElementRef;
  @ViewChild("fromDateUES") fromDateUES: ElementRef;
  @ViewChild("toDateUES") toDateUES: ElementRef;

  @ViewChild("horaInicioTF") horaInicioTF: ElementRef;
  @ViewChild("horaFinTF") horaFinTF: ElementRef;
  @ViewChild("horaInicioTTF") horaInicioTTF: ElementRef;
  @ViewChild("horaFinTTF") horaFinTTF: ElementRef;
  @ViewChild("horaInicioR") horaInicioR: ElementRef;
  @ViewChild("horaFinR") horaFinR: ElementRef;
  @ViewChild("horaInicioE") horaInicioE: ElementRef;
  @ViewChild("horaFinE") horaFinE: ElementRef;



  @ViewChild("horaInicioTPA") horaInicioTPA: ElementRef;
  @ViewChild("horaFinTPA") horaFinTPA: ElementRef;
  @ViewChild("horaInicioTA") horaInicioTA: ElementRef;
  @ViewChild("horaFinTA") horaFinTA: ElementRef;
  @ViewChild("horaInicioAU") horaInicioAU: ElementRef;
  @ViewChild("horaFinAU") horaFinAU: ElementRef;
  @ViewChild("horaInicioES") horaInicioES: ElementRef;
  @ViewChild("horaFinES") horaFinES: ElementRef;

  // SERVICIOS-VARIABLES DONDE SE ALMACENARAN LAS CONSULTAS A LA BD
  sucursales: any[];
  cajerosUsuarios: any = [];
  encuestas: any = [];
  preguntas: any = [];
  servicioTurnosFecha: any = [];
  servicioTurnosTotalFecha: any = [];
  servicioResumen: any = [];
  servicioEncuesta: any = [];

  // BANDERAS PARA MOSTRAR LA TABLA CORRESPONDIENTE A LAS CONSULTAS
  todasSucursalesTPA: boolean = false;
  todasSucursalesTA: boolean = false;
  todasSucursalesTF: boolean = false;
  todasSucursalesTTF: boolean = false;
  todasSucursalesTM: boolean = false;
  todasSucursalesES: boolean = false;
  todasSucursalesAU: boolean = false;
  todasEncuestas: boolean = false;
  todasEncuestasI: boolean = false;
  todosLosCajeros: boolean = false;
  soloEncuestas: boolean = false;

  // BANDERAS PARA QUE NO SE QUEDE EN PANTALLA CONSULTAS ANTERIORES
  malRequestTF: boolean = false;
  malRequestTTF: boolean = false;
  malRequestR: boolean = false;
  malRequestE: boolean = false;
  malRequestTFPag: boolean = false;
  malRequestTTFPag: boolean = false;
  malRequestRPag: boolean = false;
  malRequestEPag: boolean = false;

  // USUARIO QUE INGRESO AL SISTEMA
  userDisplayName: any;

  // CONTROL PAGINACION
  configTF: any;
  configTTF: any;
  configR: any;
  configE: any;

  // FECHA CAPTURADA DEL SERVIDOR
  date: any;

  // VARIABLE USADA EN EXPORTACION A EXCEL
  p_color: any = '#0077b6';

  // MAXIMO DE ITEMS MOSTRADO DE TABLA EN PANTALLA
  private MAX_PAGS = 10;

  // PALABRAS DE COMPONENTE DE PAGINACION
  public labels: any = {
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
  };

  // IMAGEN LOGO
  urlImagen: string;
  nombreImagen: any[];
  private imagen: any;

  //OPCIONES MULTIPLES
  allSelected: boolean = false;
  selectedItems: string[] = [];
  selectedEncuestas: string[] = [];
  selectedPreguntas: string[] = [];
  selectedFechas: string[] = [];
  sucursalesSeleccionadas: string[] = [];
  encuestasTodas: string[] = [];
  usuariosSeleccionados: string[] = [];
  seleccionMultiple: boolean = false;
  seleccionMultipleE: boolean = false;
  seleccionMultipleI: boolean = false;
  encuestaSeleccionada: string[] = [];
  cajeroSeleccionado: any;

  //MOSTRAR CAJEROS
  mostrarCajeros: boolean = false;
  mostrarEncuestas: boolean = false;
  mostrarPreguntas: boolean = false;
  mostrarFechas: boolean = false;

  //Variables de informacion
  valor: number;
  marca: string = "FullTime Tickets";
  horas: number[] = [];

  //Totales
  respuestasTotal: number;
  respuestasTotalC: number;

  @Output() menuMostrarOcultar: EventEmitter<any> = new EventEmitter();

  constructor(
    private serviceService: ServiceService,
    private toastr: ToastrService,
    private router: Router,
    private auth: AuthenticationService,
    public datePipe: DatePipe,
    private imagenesService: ImagenesService,
    public validar: ValidacionesService
  ) {
    // SETEO DE ITEM DE PAGINACION CUANTOS ITEMS POR PAGINA, DESDE QUE PAGINA EMPIEZA, EL TOTAL DE ITEMS RESPECTIVAMENTE
    // ENTRADAS AL SISTEMA
    this.configTF = {
      id: "usuariosTF",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioTurnosFecha.length,
    };
    // RESUMEN CAJEROS
    this.configTTF = {
      id: "usuariosTTF",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioTurnosTotalFecha.length,
    };
    // RESUMEN PREGUNTAS
    this.configR = {
      id: "usuariosR",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioResumen.length,
    };
    // RESUMEN ENCUESTAS REALIZADAS
    this.configE = {
      id: "usuariosE",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioEncuesta.length,
    };
    for (let i = 0; i <= 24; i++) {
      this.horas.push(i);
    }
  }

  // EVENTOS PARA AVANZAR O RETROCEDER EN LA PAGINACION
  // ENTRADAS Y SALIDAS
  pageChangedTF(event: any) {
    this.configTF.currentPage = event;
  }
  // RESUMEN CAJEROS
  pageChangedTTF(event: any) {
    console.log('evento ', event)
    this.configTTF.currentPage = event;
  }
  // RESUMEN PREGUNTAS
  pageChangedR(event: any) {
    this.configR.currentPage = event;
  }
  // RESUMEN ENCUESTAS
  pageChangedE(event: any) {
    this.configE.currentPage = event;
  }

  ngOnInit(): void {
    var f = moment();
    this.date = f.format("YYYY-MM-DD");

    // CARGAMOS COMPONENTES SELECTS HTML
    this.getMarca();
    this.getlastday();
    this.getCajeros();
    this.getSucursales();
    this.getEncuestasTotales();

    // CARGAMOS NOMBRE DE USUARIO LOGUEADO
    this.userDisplayName = sessionStorage.getItem("loggedUser");

    // SETEO DE BANDERAS CUANDO EL RESULTADO DE LA PETICION HTTP NO ES 200 OK
    this.malRequestTFPag = true;
    this.malRequestTTFPag = true;
    this.malRequestRPag = true;
    this.malRequestEPag = true;

    // CARGAR LOGO PARA LOS REPORTES
    this.imagenesService
      .cargarImagen()
      .then((result: any) => {
        this.urlImagen = result;
      })
      .catch((error) => {
        Utils.getImageDataUrlFromLocalPath1("assets/images/logo.png").then(
          (result) => (this.urlImagen = result)
        );
      });
  }

  // OPCIONES DE SELECCION DE DATOS
  selectAll(opcion: string) {
    switch (opcion) {
      case "allSelected":
        this.allSelected = !this.allSelected;
        break;
      case "todosLosCajeros":
        this.todosLosCajeros = !this.todosLosCajeros;
        break;
      case "todasEncuestasI":
        this.todasEncuestasI = !this.todasEncuestasI;
        this.todasEncuestasI
          ? this.ObtenerPreguntas(this.encuestaSeleccionada)
          : null;
        break;
      case "encuestasSeleccionadasI":
        this.seleccionMultipleI = this.encuestaSeleccionada.length > 1;
        this.encuestaSeleccionada.length > 0
          ? this.ObtenerPreguntas(this.encuestaSeleccionada)
          : null;
        break;
      case "todasSucursales":
        this.todasSucursalesTTF = !this.todasSucursalesTTF;
        this.ObtenerPreguntas(this.encuestaSeleccionada);
        this.ObtenerRespuestas(this.encuestaSeleccionada);
        break;
      case "sucursalesSeleccionadasE":
        this.seleccionMultiple = this.sucursalesSeleccionadas.length > 1;
        this.sucursalesSeleccionadas.length > 0
          ? this.getEncuestas(this.sucursalesSeleccionadas)
          : null;
        break;
      case "todasEncuestas":
        this.todasEncuestas = !this.todasEncuestas;
        break;
      case "encuestasSeleccionadas":
        this.seleccionMultipleE = this.selectedEncuestas.length > 1;
        this.selectedEncuestas.length > 0
          ? this.ObtenerPreguntas(this.selectedEncuestas)
          : null;
        break;
      case "soloEncuestas":
        this.soloEncuestas = !this.soloEncuestas;
        break;
      case "cajerosSeleccionados":
        this.getEncuestas("-1");
        break;
      default:
        break;
    }
  }

  // CONSULTA DE MARCA DE AGUA PARA REPORTES
  getMarca() {
    this.serviceService.getMarca().subscribe((marca: any) => {
      this.marca = marca.marca;
    });
  }

  // SE OBTIENE LA FECHA ACTUAL
  getlastday() {
    this.toDate = this.datePipe.transform(new Date(), "yyyy-MM-dd");
    let lastweek = new Date();
    var firstDay = new Date(lastweek.getFullYear(), lastweek.getMonth(), 1);
    this.fromDate = this.datePipe.transform(firstDay, "yyyy-MM-dd");
  }

  // CONSULTA DE LISTA DE CAJEROS
  getCajeros() {
    this.serviceService.getAllCajerosS().subscribe(
      (cajeros: any) => {
        this.cajerosUsuarios = cajeros.cajeros;
        this.mostrarCajeros = true;
      },
      (error) => {
        if (error.status == 400) {
          this.cajerosUsuarios = [];
          this.mostrarCajeros = false;
        }
      }
    );
  }

  // CONSULTA DE DATOS DE ENCUESTAS
  getEncuestas(sucursal: any) {
    this.serviceService.getAllEncuestas(sucursal).subscribe(
      (cajeros: any) => {
        let respuesta = cajeros.cajeros;
        this.encuestas = respuesta.filter(
          (valor: any, indice: any, self: any) =>
            self.findIndex((v: any) => v.COD_EN === valor.COD_EN) === indice
        );
        //console.log(' encuestas ', this.encuestas)
        this.mostrarEncuestas = true;
      },
      (error) => {
        if (error.status == 400) {
          this.encuestas = [];
          this.mostrarEncuestas = false;
        }
      }
    );
  }

  // CONSULTA DE DATOS DE TODAS LAS ENCUESTAS
  encuestasTotales: any = [];
  mostrarEncuestaTotal: boolean = false;
  getEncuestasTotales() {
    this.serviceService.getEncuestasTotales().subscribe(
      (res: any) => {
        this.encuestasTotales = res.encuestasT;
        this.mostrarEncuestaTotal = true;
      },
      (error) => {
        if (error.status == 400) {
          this.encuestasTotales = [];
          this.mostrarEncuestaTotal = false;
        }
      }
    );
  }

  // CONSULATA PARA LLENAR LA LISTA DE SURCURSALES.
  getSucursales() {
    this.serviceService.getAllSucursales().subscribe((empresas: any) => {
      this.sucursales = empresas.empresas;
    });
  }

  // METODO PARA LLAMAR CONSULTA DE DATOS
  limpiar() {
    this.selectedItems = [];
    this.allSelected = false;
    this.todasSucursalesTPA = false;
    this.todasSucursalesTA = false;
    this.todasSucursalesTF = false;
    this.todasSucursalesTTF = false;
    this.todosLosCajeros = false;
    this.todasEncuestas = false;
    this.todasEncuestasI = false;
    this.todasSucursalesTM = false;
    this.todasSucursalesES = false;
    this.todasSucursalesAU = false;
    this.seleccionMultiple = false;
    this.seleccionMultipleE = false;
    this.seleccionMultipleI = false;
    this.sucursalesSeleccionadas = [];
    this.usuariosSeleccionados = [];
    this.selectedEncuestas = [];
    this.selectedPreguntas = [];
    this.selectedFechas = [];
    this.mostrarEncuestas = false;
    this.encuestas = [];
    this.encuestaSeleccionada = [];
    this.cajeroSeleccionado = null;
    this.servicioResumen = [];
    this.servicioEncuesta = [];
    this.respuestasTotal = 0;
    this.respuestasTotalC = 0;
    this.encuestasTodas = [];
    this.soloEncuestas = false;
    this.preguntas_respuestas = [];
  }

  // COMPRUEBA SI SE REALIZO UNA BUSQUEDA POR SUCURSALES
  comprobarBusquedaSucursales(cod: string) {
    return cod == "-1" ? true : false;
  }

  // SE DESLOGUEA DE LA APLICACION
  salir() {
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  /** ********************************************************************************************************** **
   ** **                                     ENTRADAS AL SISTEMA                                              ** **
   ** ********************************************************************************************************** **/

  buscarEntradas() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fromDateTurnosFecha.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.toDateTurnosFecha.nativeElement.value
      .toString()
      .trim();

    let horaInicio = this.horaInicioTF.nativeElement.value;
    let horaFin = this.horaFinTF.nativeElement.value;

    if (this.selectedItems.length !== 0) {
      this.serviceService
        .getEntradasSalidas(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.selectedItems
        )
        .subscribe(
          (servicio: any) => {
            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
            this.servicioTurnosFecha = servicio.turnos;
            this.malRequestTF = false;
            this.malRequestTFPag = false;

            // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
            if (this.configTF.currentPage > 1) {
              this.configTF.currentPage = 1;
            }
          },
          (error) => {
            if (error.status == 400) {
              // SI HAY ERROR 400 SE VACIA VARIABLE Y BANDERAS CAMBIAN PARA QUITAR TABLA DE INTERFAZ
              this.servicioTurnosFecha = null;
              this.malRequestTF = true;
              this.malRequestTFPag = true;

              // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
              // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
              if (this.servicioTurnosFecha == null) {
                this.configTF.totalItems = 0;
              } else {
                this.configTF.totalItems = this.servicioTurnosFecha.length;
              }

              // POR ERROR 400 SE SETEA ELEMENTOS DE PAGINACION
              this.configTF = {
                itemsPerPage: this.MAX_PAGS,
                currentPage: 1,
              };

              // SE INFORMA QUE NO SE ENCONTRARON REGISTROS
              this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
                timeOut: 6000,
              });
            }
          }
        );
    }
  }

  /** ********************************************************************************************************** **
   ** **                                    PREGUNTAS Y RESPUESTAS                                             ** **
   ** ********************************************************************************************************** **/

  // CONSULTA DE DATOS DE PREGUNTAS
  ObtenerPreguntas(sucursal: any) {
    this.serviceService.getAllPreguntas(sucursal).subscribe(
      (res: any) => {
        this.preguntas = res.preguntas;
        console.log('ver preguntas ', this.preguntas)
        this.mostrarPreguntas = true;
      },
      (error) => {
        if (error.status == 400) {
          this.preguntas = [];
          this.mostrarPreguntas = false;
        }
      }
    );
  }

  respuestas: any = [];
  ObtenerRespuestas(sucursal: any) {
    this.serviceService.getRespuestasEncuesta(sucursal).subscribe(
      (res: any) => {
        this.respuestas = res.respuestas;
        console.log('ver respuestas ', this.respuestas)
        //this.mostrarPreguntas = true;
      },
      (error) => {
        if (error.status == 400) {
          this.respuestas = [];
          //this.mostrarPreguntas = false;
        }
      }
    );
  }

  /** ******************************************************************************************** **
   ** **                    CONSULTA DE ENCUESTAS - PREGUNTAS Y RESPUESTAS                      ** **
   ** ******************************************************************************************** **/
  preguntas_respuestas: any = [];
  listaPreguntas: any = [];
  buscarPreguntasRespuestas() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fromDateTurnosTotalFecha.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.toDateTurnosTotalFecha.nativeElement.value
      .toString()
      .trim();

    let horaInicio = this.horaInicioTTF.nativeElement.value;
    let horaFin = this.horaFinTTF.nativeElement.value;

    if (this.encuestaSeleccionada.length !== 0) {
      this.serviceService
        .getCodigosRespuestas(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.encuestaSeleccionada,
          this.sucursalesSeleccionadas.length === 0 ? '-1' : this.sucursalesSeleccionadas,
          this.usuariosSeleccionados.length === 0 ? '-2' : this.usuariosSeleccionados,
        )
        .subscribe(
          (servicio: any) => {
            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
            //console.log(' resultado ', servicio.resumen);
            let listaSucursales: any = [];
            let respuesta: any = [];
            let procesar: any = [];
            let listaEncuestas: any = [];

            listaSucursales = servicio.resumen;
            respuesta = servicio.resumen;

            const listaSinDuplicados = listaSucursales.filter((value: any, index: any, self: any) =>
              index === self.findIndex((t: any) => t.COD_EN === value.COD_EN) // COMPARAR POR 'ID' PARA ELIMINAR DUPLICADOS
            );

            listaSinDuplicados.forEach((encuesta: any) => {
              procesar.push({
                COD_EN: encuesta.COD_EN,
                COD_SUC: encuesta.COD_SUC,
                encuesta: encuesta.encuesta,
                sucursal: encuesta.sucursal,
              });
            });

            listaEncuestas = procesar;
            console.log('ver respuesta ', respuesta)
            // Asociar aplicadas (cajeros que respondieron la encuesta)
            procesar.forEach((encuesta: any) => {
              console.log('encuesta ', encuesta)
              let auxiliar: any[] = [];
              respuesta.forEach((aplicadas: any) => {
                console.log('aplicada ', aplicadas)
                if (encuesta.COD_EN === aplicadas.COD_EN) {
                  auxiliar.push({
                    CODIGO_RESPUESTA: aplicadas.CODIGO_RESPUESTA,
                    cajero: aplicadas.NOM_US,
                  });
                }
              });
              encuesta.aplicadas = auxiliar;
            });

            // ASOCIAR PREGUNTAS A CADA ENCUESTA
            procesar.forEach((encuesta: any) => {
              let auxiliar: any[] = [];
              let contador: number = 1;
              this.preguntas.forEach((pregunta: any) => {
                if (encuesta.COD_EN === pregunta.COD_EN) {
                  auxiliar.push({
                    codigo_pregunta: pregunta.COD_PR,
                    identificador: 'PREGUNTA ' + contador++,
                    pregunta: pregunta.PREG_PR,
                    respuesta: '',
                    fecha: '',
                    hora: ''
                  });
                }
              });

              // Ordenar preguntas por código
              auxiliar.sort((a, b) => a.codigo_pregunta - b.codigo_pregunta);

              // COPIA INDEPENDIENTE DE PREGUNTAS PARA CADA "APLICADA"**
              encuesta.aplicadas.forEach((aplicadas: any) => {
                aplicadas.preguntas = auxiliar.map(p => ({ ...p })); // SE HACE UNA COPIA DEL ARRAY
              });
            });

            // ASOCIAR RESPUESTAS A PREGUNTAS
            procesar.forEach((encuesta: any) => {
              encuesta.aplicadas.forEach((aplicada: any) => {
                this.respuestas.forEach((respuesta: any) => {
                  if (aplicada.CODIGO_RESPUESTA === respuesta.CODIGO_RESPUESTA) {
                    aplicada.preguntas.forEach((pregunta: any) => {
                      if (pregunta.codigo_pregunta === respuesta.COD_PR) {
                        pregunta.respuesta = respuesta.respuesta;
                        pregunta.fecha = respuesta.fecha;
                        pregunta.hora = `${String(respuesta.hora).padStart(2, '0')}:${String(respuesta.minutos).padStart(2, '0')}:${String(respuesta.segundos).padStart(2, '0')}`;
                        aplicada.fecha = respuesta.fecha;
                      }
                    });
                  }
                });
              });
            });

            console.log('datos original ...', procesar);

            //this.servicioTurnosTotalFecha = procesar;

            this.servicioTurnosTotalFecha = procesar.map(encuesta => {
              // Ordenar las aplicaciones dentro de cada encuesta por la fecha de mayor a menor
              encuesta.aplicadas.sort((a, b) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                return fechaB.getTime() - fechaA.getTime(); // Ordenar de mayor a menor
              });

              return encuesta;
            });

            console.log('datos ...', this.servicioTurnosTotalFecha);



            let preguntasUnicas: any[] = [];
            listaEncuestas.forEach((encuesta: any) => {
              let preguntasEncuesta = new Set(); // Para evitar preguntas duplicadas en cada encuesta
              let preguntasFiltradas: any[] = [];
              let contador: number = 1;
              this.preguntas.forEach((pregunta: any) => {
                if (encuesta.COD_EN === pregunta.COD_EN && !preguntasEncuesta.has(pregunta.COD_PR)) {
                  preguntasEncuesta.add(pregunta.COD_PR);
                  preguntasFiltradas.push({
                    codigo_pregunta: pregunta.COD_PR,
                    identificativo: 'PREGUNTA ' + contador++,
                    pregunta: pregunta.PREG_PR
                  });
                }
              });

              preguntasUnicas.push({
                COD_EN: encuesta.COD_EN,
                sucursal: encuesta.sucursal,
                preguntas: preguntasFiltradas
              });
            });

            console.log("Preguntas únicas por encuesta:", preguntasUnicas);
            this.listaPreguntas = preguntasUnicas;

            this.malRequestTTF = false;
            this.malRequestTTFPag = false;

            // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
            console.log(' ver paginacion ', this.configTTF.currentPage)
            if (this.configTTF.currentPage > 1) {
              this.configTTF.currentPage = 1;
            }

            this.respuestasTotalC = this.preguntas_respuestas.length;
          },
          (error) => {
            if (error.status == 400) {
              // SI HAY ERROR 400 SE VACIA VARIABLE Y BANDERAS CAMBIAN PARA QUITAR TABLA DE INTERFAZ
              this.servicioTurnosTotalFecha = null;
              this.malRequestTTF = true;
              this.malRequestTTFPag = true;

              // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
              // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
              if (this.servicioTurnosTotalFecha == null) {
                this.configTTF.totalItems = 0;
              } else {
                this.configTTF.totalItems =
                  this.servicioTurnosTotalFecha.length;
              }

              // POR ERROR 400 SE SETEA ELEMENTOS DE PAGINACION
              this.configTTF = {
                itemsPerPage: this.MAX_PAGS,
                currentPage: 1,
              };

              // SE INFORMA QUE NO SE ENCONTRARON REGISTROS
              this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
                timeOut: 6000,
              });
            }
          }
        );
    }
  }

  ordenarClaves(a: any, b: any): number {
    const numA = parseInt(a.key.split('_')[1], 10);
    const numB = parseInt(b.key.split('_')[1], 10);
    return numA - numB;
  }

  // GENERAR ARCHIVO DE EXCEL
  ExportExcelEncuestas() {
    let workbook = new ExcelJS.Workbook();
    let imagen = workbook.addImage({
      base64: this.urlImagen,  // URL de la imagen en base64
      extension: 'png',
    });

    let contador: number = 1;
    // Iterar sobre las encuestas para crear una hoja por cada una
    this.servicioTurnosTotalFecha.forEach((encuesta: any) => {
      // Crear hoja por cada encuesta
      const sheet = workbook.addWorksheet('ENCUESTA ' + contador++);

      // Agregar la imagen en cada hoja
      sheet.addImage(imagen, {
        tl: { col: 0, row: 0 },
        ext: { width: 220, height: 105 },
      });

      // COMBINAR CELDAS
      sheet.mergeCells("B1:H1");
      sheet.mergeCells("B2:H2");
      sheet.mergeCells("B3:H3");
      sheet.mergeCells("B4:H4");
      sheet.mergeCells("B5:H5");

      // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
      sheet.getCell("B1").value = (encuesta.sucursal).toUpperCase();
      sheet.getCell("B2").value = (encuesta.encuesta).toUpperCase();
      var fechaDesde = this.fromDateTurnosTotalFecha.nativeElement.value
        .toString()
        .trim();
      var fechaHasta = this.toDateTurnosTotalFecha.nativeElement.value
        .toString()
        .trim();
      sheet.getCell("B3").value = "PERIODO DE " + fechaDesde + " HASTA " + fechaHasta;
      // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
      ["B1", "B2", "B3"].forEach((cell) => {
        sheet.getCell(cell).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        sheet.getCell(cell).font = { bold: true, size: 14 };
      });

      // Establecer las cabeceras de la tabla (SUCURSAL, CAJERO y preguntas)
      const header = ['SUCURSAL', 'CAJERO', 'FECHA', ...encuesta.aplicadas[0]?.preguntas.map((pregunta: any) => pregunta.identificador)];
      sheet.addRow(header);

      // Agregar comentarios a las cabeceras en la fila 6 con el valor de la pregunta
      header.forEach((headerItem, index) => {
        const rowNumber = 6;  // Cambiar a fila 6
        if (index === 0) {
          sheet.getCell(`A${rowNumber}`).note = 'Nombre de la sucursal en la que se realizó la encuesta.';
        } else if (index === 1) {
          sheet.getCell(`B${rowNumber}`).note = 'Nombre del cajero que aplicó la encuesta.';
        }
        else if (index === 2) {
          sheet.getCell(`C${rowNumber}`).note = 'Fecha en la que se aplicó la encuesta.';
        }
        else {
          // PARA LAS PREGUNTAS, PONER EL VALOR DE PREGUNTA.PREGUNTA EN EL COMENTARIO
          const pregunta = encuesta.aplicadas[0]?.preguntas[index - 3];  // AJUSTE PARA EL ÍNDICE DE LAS PREGUNTAS
          if (pregunta) {
            // AJUSTE PARA OBTENER LAS CELDAS CORRECTAMENTE, A PARTIR DE LA COLUMNA D
            const columnLetter = String.fromCharCode(68 + index - 3); // COMIENZA DESDE 'D' PARA LAS PREGUNTAS
            sheet.getCell(`${columnLetter}${rowNumber}`).note = `Pregunta: ${pregunta.pregunta}`;
          }
        }
      });

      // LLENAR LAS FILAS CON LAS RESPUESTAS DE LOS CAJEROS
      encuesta.aplicadas.forEach((aplicada: any, index: number) => {
        const fila = [
          encuesta.sucursal,  // SUCURSAL
          aplicada.cajero,    // CAJERO
          aplicada.fecha,     // FECHA
          ...aplicada.preguntas.map((pregunta: any) => pregunta.respuesta) // RESPUESTAS A LAS PREGUNTAS
        ];
        const row = sheet.addRow(fila);
        // APLICAR BORDES A CADA CELDA DE LA FILA
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
        // APLICAR ESTILO CEBRA A LAS FILAS
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F2F2F2' }, // COLOR GRIS CLARO PARA FILAS PARES
            };
          });
        }
      });

      // ESTABLECER EL ANCHO DE LAS COLUMNAS DINÁMICAMENTE
      sheet.columns = header.map(() => ({ width: 30 }));  // TODAS LAS COLUMNAS CON ANCHO 30

      // ESTILOS DE ENCABEZADO
      sheet.getRow(6).eachCell((cell, colNumber) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4F81BD" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = {
          bold: true,
          color: { argb: "FFFFFF" }, // COLOR BLANCO PARA EL TEXTO
        };
        // HABILITAR FILTRO EN LA CELDA
        sheet.autoFilter = {
          from: { row: 6, column: 1 },  // INICIO DEL FILTRO (FILA 6, COLUMNA 1)
          to: { row: 6, column: sheet.columnCount } // FIN DEL FILTRO (ULTIMA COLUMNA)
        };
      });

      // CONGELAR LA FILA 6 Y LAS PRIMERAS 2 COLUMNAS (INCLUYENDO LA COLUMNA DE LA "FECHA")
      sheet.views = [
        {
          state: 'frozen',
          xSplit: 3,  // CONGELAR HASTA LA COLUMNA C (COLUMNA DE LA FECHA)
          ySplit: 6,  // CONGELAR HASTA LA FILA 6
          topLeftCell: 'D7',  // COMIENZA LA VISUALIZACIÓN DESDE LA CELDA D7
        }
      ];
    });

    // GENERAR EL ARCHIVO Y DESCARGARLO
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Encuestas.xlsx';
      link.click();
    });
  }

  // FUNCION PARA CREAR EL PDF
  async generarPdfPreguntasRespuestas(action = "open", pdf: number) {
    if (this.servicioTurnosTotalFecha.length != 0) {
      // RANGO DE FECHAS DE LA CONSULTA PARA IMPRESION EN PDF
      var fechaDesde = this.fromDateTurnosTotalFecha.nativeElement.value.toString().trim();
      var fechaHasta = this.toDateTurnosTotalFecha.nativeElement.value.toString().trim();
      const pdfMake = await this.validar.ImportarPDF();
      let documentDefinition: any;
      if (pdf === 1) {
        documentDefinition = this.getDocumentTurnosTotalFecha(fechaDesde, fechaHasta);
      }
      // OPCIONES DE PDF
      switch (action) {
        case "open":
          pdfMake.createPdf(documentDefinition).open();
          break;
        case "print":
          pdfMake.createPdf(documentDefinition).print();
          break;
        case "download":
          pdfMake.createPdf(documentDefinition).download();
          break;
        default:
          pdfMake.createPdf(documentDefinition).open();
          break;
      }
    }
  }

  // FUNCION DELEGADA PARA LA ESTRUCTURA DEL DOCUMENTO PDF
  getDocumentTurnosTotalFecha(fechaDesde: any, fechaHasta: any) {
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();

    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 40],
      watermark: { text: this.marca, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.userDisplayName, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, timer: any) {
        fecha = f.toJSON().split("T")[0];
        timer = f.toJSON().split("T")[1].slice(0, 5);
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + timer, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.urlImagen, width: 100, margin: [10, -25, 0, 5] },
        { text: `LISTA DE ENCUESTAS APLICADAS`, bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `PERIODO DEL ${fechaDesde} HASTA ${fechaHasta}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        this.EstructurarDatosPDF(this.servicioTurnosTotalFecha),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        principal: { fontSize: 8, bold: true, alignment: 'center', fillColor: "#aafdc3" },
        itemsTable: { fontSize: 8 },
        tableMargin: { margin: [0, 0, 0, 0] },
      },
    };
  }

  EstructurarDatosPDF(data: any[]) {
    const body: any[] = [];

    data.forEach(encuesta => {
      if (!encuesta.aplicadas || encuesta.aplicadas.length === 0) return;

      encuesta.aplicadas.forEach((aplicada: any) => {
        // ENCABEZADOS DE ENCUESTA Y SUCURSAL (PRIMERA FILA)
        body.push([
          { text: 'ENCUESTA', style: 'principal', alignment: 'center', colSpan: 2 }, {},
          { text: 'SUCURSAL', style: 'principal', alignment: 'center', colSpan: 2 }, {}
        ]);
        body.push([
          { text: encuesta.encuesta || 'N/A', style: 'itemsTable', alignment: 'center', colSpan: 2 }, {},
          { text: encuesta.sucursal || 'N/A', style: 'itemsTable', alignment: 'center', colSpan: 2 }, {}
        ]);

        // ENCABEZADOS DE CAJERO Y FECHA (SEGUNDA FILA)
        body.push([
          { text: 'CAJERO(A)', style: 'tableHeader', alignment: 'center', colSpan: 2 }, {},
          { text: 'FECHA', style: 'tableHeader', alignment: 'center', colSpan: 2 }, {}
        ]);
        body.push([
          { text: aplicada.cajero || 'N/A', style: 'itemsTable', alignment: 'center', colSpan: 2 }, {},
          { text: aplicada.fecha || 'N/A', style: 'itemsTable', alignment: 'center', colSpan: 2 }, {}
        ]);

        // CABECERA DE PREGUNTAS Y RESPUESTAS (UNA SOLA VEZ)
        body.push([
          { text: 'No.', style: 'tableHeader', alignment: 'center', width: '10%' },
          { text: 'PREGUNTA', style: 'tableHeader', alignment: 'center', colSpan: 2, width: '55%' }, {},
          { text: 'RESPUESTA', style: 'tableHeader', alignment: 'center', width: '35%' }
        ]);

        // SECCIÓN DE PREGUNTAS Y RESPUESTAS
        aplicada.preguntas.forEach((pregunta: any, index: number) => {
          body.push([
            { text: pregunta.identificador, style: 'itemsTable', alignment: 'center' },
            { text: pregunta.pregunta || 'Pregunta no disponible', style: 'itemsTable', colSpan: 2 }, {},
            { text: pregunta.respuesta || '', style: 'itemsTable' }
          ]);
        });

        // ESPACIADO ENTRE ENCUESTAS
        body.push([{ text: '', colSpan: 4, border: [false, false, false, false], margin: [0, 5, 0, 5] }, {}, {}, {}]);
      });
    });

    return {
      style: 'tableMargin',
      table: {
        widths: ['10%', '45%', '10%', '35%'], // 4 columnas
        body
      },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? '#E5E7E9' : null),
      }
    };
  }




  /** ********************************************************************************************************** **
   ** **                                      RESUMEN DE PREGUNTAS                                            ** **
   ** ********************************************************************************************************** **/

  buscarRespuestas() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fromDateResumen.nativeElement.value.toString().trim();
    var fechaHasta = this.toDateResumen.nativeElement.value.toString().trim();

    let horaInicio = this.horaInicioR.nativeElement.value;
    let horaFin = this.horaFinR.nativeElement.value;

    if (this.selectedEncuestas.length !== 0) {
      this.serviceService
        .getEncuestasCajero(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.sucursalesSeleccionadas.length === 0 ? '-1' : this.sucursalesSeleccionadas,
          this.selectedEncuestas,
          this.usuariosSeleccionados.length === 0 ? '-2' : this.usuariosSeleccionados,
        )
        .subscribe(
          (servicio: any) => {
            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
            this.servicioResumen = servicio.resumen;
            console.log('resumen ', this.servicioResumen)
            this.malRequestR = false;
            this.malRequestRPag = false;

            // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
            if (this.configR.currentPage > 1) {
              this.configR.currentPage = 1;
            }

            let totalR = this.servicioResumen.map(
              (res: any) => res.encuestas_realizadas
            );
            let total = 0;
            for (let i = 0; i < totalR.length; i++) {
              total += totalR[i];
            }
            this.respuestasTotal = total;
          },
          (error) => {
            if (error.status == 400) {
              // SI HAY ERROR 400 SE VACIA VARIABLE Y BANDERAS CAMBIAN PARA QUITAR TABLA DE INTERFAZ
              this.servicioResumen = null;
              this.malRequestR = true;
              this.malRequestRPag = true;

              // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
              // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
              if (this.servicioResumen == null) {
                this.configR.totalItems = 0;
              } else {
                this.configR.totalItems = this.servicioResumen.length;
              }

              // POR ERROR 400 SE SETEA ELEMENTOS DE PAGINACION
              this.configR = {
                itemsPerPage: this.MAX_PAGS,
                currentPage: 1,
              };

              // SE INFORMA QUE NO SE ENCONTRARON REGISTROS
              this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
                timeOut: 6000,
              });
            }
          }
        );
    }
  }

  /** ********************************************************************************************************** **
   ** **                                        LISTA DE ENCUESTAS                                            ** **
   ** ********************************************************************************************************** **/

  buscarListaEncuestas() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fromDateEncuesta.nativeElement.value.toString().trim();
    var fechaHasta = this.toDateEncuesta.nativeElement.value.toString().trim();

    let horaInicio = this.horaInicioE.nativeElement.value;
    let horaFin = this.horaFinE.nativeElement.value;

    if (this.encuestasTodas.length !== 0) {
      this.serviceService
        .getResumenEncuesta(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.encuestasTodas,
          '-1'
        )
        .subscribe(
          (servicio: any) => {
            console.log(' servicio encuesta ', servicio)
            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
            this.servicioEncuesta = servicio.resumen;
            this.malRequestE = false;
            this.malRequestEPag = false;

            // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
            if (this.configE.currentPage > 1) {
              this.configE.currentPage = 1;
            }

            let totalE = this.servicioEncuesta.map(
              (res) => res.total_encuestas
            );
            let total = 0;
            for (let i = 0; i < totalE.length; i++) {
              total += totalE[i];
            }
            this.respuestasTotal = total;
          },
          (error) => {
            if (error.status == 400) {
              // SI HAY ERROR 400 SE VACIA VARIABLE Y BANDERAS CAMBIAN PARA QUITAR TABLA DE INTERFAZ
              this.servicioEncuesta = null;
              this.malRequestE = true;
              this.malRequestEPag = true;

              // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
              // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
              if (this.servicioEncuesta == null) {
                this.configE.totalItems = 0;
              } else {
                this.configE.totalItems = this.servicioEncuesta.length;
              }

              // POR ERROR 400 SE SETEA ELEMENTOS DE PAGINACION
              this.configE = {
                itemsPerPage: this.MAX_PAGS,
                currentPage: 1,
              };

              // SE INFORMA QUE NO SE ENCONTRARON REGISTROS
              this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
                timeOut: 6000,
              });
            }
          }
        );
    }
  }












  /** ********************************************************************************************************** **
   ** **                                          ENCUESTA INDIVIDUAL                                         ** **
   ** ********************************************************************************************************** **/

  ObtenerNombreSucursal(sucursales: any) {
    const listaSucursales = sucursales;
    let nombreSucursal = "";
    listaSucursales.forEach((elemento: any) => {
      const cod = elemento;
      if (cod == "-1") {
        nombreSucursal = "GENERALES";
        return;
      }
      const nombre = this.sucursales.find(
        (sucursal) => sucursal.empr_codigo == cod
      ).empr_nombre;
      nombreSucursal += `${nombre} `;
    });
    return nombreSucursal;
  }


  // en el controlador de Angular
  convertirObjetoACadena(objeto) {
    return objeto.toString();
  }

  ExportTOExcelEntradasSistema() {
    if (this.servicioTurnosFecha.length != 0) {
      //Mapeo de información de consulta a formato JSON para exportar a Excel
      let jsonServicio: any = [];
      for (let i = 0; i < this.servicioTurnosFecha.length; i++) {
        jsonServicio.push({
          Usuario: this.servicioTurnosFecha[i].Usuario,
          Fecha: new Date(this.servicioTurnosFecha[i].fecha_),
          Hora: this.servicioTurnosFecha[i].hora_,
        });
      }

      //Instrucción para generar excel a partir de JSON, y nombre del archivo con fecha actual
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonServicio);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
      const header = Object.keys(this.servicioTurnosFecha[0]); // NOMBRE DE CABECERAS DE COLUMNAS
      var wscols: any = [];
      for (var i = 0; i < header.length; i++) {
        // CABECERAS AÑADIDAS CON ESPACIOS
        wscols.push({ wpx: 150 });
      }
      ws["!cols"] = wscols;
      XLSX.utils.book_append_sheet(wb, ws, "Entradas");
      XLSX.writeFile(
        wb,
        "Entradas al sistema " + new Date().toLocaleString() + EXCEL_EXTENSION
      );
    }
  }






  ExportTOExcelPreguntasResumen(opcion: any) {
    let resultados: any = [];
    if (opcion === 1) {
      resultados = this.servicioEncuesta;
    }
    else {
      resultados = this.servicioResumen;
    }
    if (resultados.length != 0) {
      //Mapeo de información de consulta a formato JSON para exportar a Excel
      let jsonServicio: any = [];
      for (let i = 0; i < resultados.length; i++) {
        jsonServicio.push({
          Sucursal: resultados[i].nombre_sucursal,
          Encuesta: resultados[i].nombre_encuesta,
          Uusario: resultados[i].nombre_usuario,
          "Encuestas realizadas": resultados[i].encuestas_realizadas,
        });
      }
      //Instrucción para generar excel a partir de JSON, y nombre del archivo con fecha actual
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonServicio);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
      const header = Object.keys(resultados[0]); // NOMBRE DE CABECERAS DE COLUMNAS
      var wscols: any = [];
      for (var i = 0; i < header.length; i++) {
        // CABECERAS AÑADIDAS CON ESPACIOS
        wscols.push({ wpx: 150 });
      }
      ws["!cols"] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Respuestas");
      XLSX.writeFile(
        wb,
        "Resumen Encuestas Usuarios" + new Date().toLocaleString() + EXCEL_EXTENSION
      );
    }
  }


  validarHoras(hInicio: any, hFin: any) {
    let diaCompleto: boolean = false;

    if (hInicio == "-1" || hFin == "-1" || parseInt(hInicio) > parseInt(hFin)) {
      diaCompleto = true;
    }

    if (diaCompleto) {
      return {};
    } else {
      return {
        style: "subtitulos",
        text: "Hora desde " + hInicio + " hasta " + hFin,
      };
    }
  }

  //----GENERACION DE PDF'S----
  async generarPdfEntradasSistema(action = "open", pdf: number) {
    if (this.servicioTurnosFecha.length != 0) {
      //Seteo de rango de fechas de la consulta para impresión en PDF
      var fechaDesde = this.fromDateTurnosFecha.nativeElement.value
        .toString()
        .trim();
      var fechaHasta = this.toDateTurnosFecha.nativeElement.value
        .toString()
        .trim();

      let horaInicio = this.horaInicioTF.nativeElement.value;
      let horaFin = this.horaFinTF.nativeElement.value;

      // var cod = this.codSucursal.nativeElement.value.toString().trim();
      const pdfMake = await this.validar.ImportarPDF();

      //Definicion de funcion delegada para setear estructura del PDF
      let documentDefinition: any;
      if (pdf === 1) {
        documentDefinition = this.getDocumentturnosfecha(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin
        );
      }
      //Opciones de PDF de las cuales se usara la de open, la cual abre en nueva pestaña el PDF creado
      switch (action) {
        case "open":
          pdfMake.createPdf(documentDefinition).open();
          break;
        case "print":
          pdfMake.createPdf(documentDefinition).print();
          break;
        case "download":
          pdfMake.createPdf(documentDefinition).download();
          break;
        default:
          pdfMake.createPdf(documentDefinition).open();
          break;
      }
    }
  }

  //Funcion delegada para seteo de información
  getDocumentturnosfecha(fechaDesde, fechaHasta, horaInicio, horaFin) {
    //Se obtiene la fecha actual
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();
    // let nombreSucursal = this.obtenerNombreSucursal(this.sucursalesSeleccionadas);

    return {
      //Seteo de marca de agua y encabezado con nombre de usuario logueado
      watermark: {
        text: this.marca,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
        fontSize: 52,
      },
      header: {
        text: "Impreso por:  " + this.userDisplayName,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
      },
      //Seteo de pie de pagina, fecha de generacion de PDF con numero de paginas
      footer: function (currentPage, pageCount, fecha) {
        fecha = f.toJSON().split("T")[0];
        var timer = f.toJSON().split("T")[1].slice(0, 5);
        return [
          {
            margin: [10, 20, 10, 0],
            columns: [
              "Fecha: " + fecha + " Hora: " + timer,
              {
                text: [
                  {
                    text:
                      "© Pag " + currentPage.toString() + " of " + pageCount,
                    alignment: "right",
                    color: "blue",
                    opacity: 0.5,
                  },
                ],
              },
            ],
            fontSize: 9,
            color: "#A4B8FF",
          },
        ];
      },
      //Contenido del PDF, logo, nombre del reporte, con el renago de fechas de los datos
      content: [
        {
          columns: [
            {
              image: this.urlImagen,
              width: 90,
              height: 45,
            },
            {
              width: "*",
              alignment: "center",
              text: "Reporte - Entradas al sistema ",
              bold: true,
              fontSize: 15,
              margin: [-90, 20, 0, 0],
            },
          ],
        },
        {
          style: "subtitulos",
          text: "Periodo de " + fechaDesde + " hasta " + fechaHasta,
        },
        this.CampoDetalle(this.servicioTurnosFecha), //Definicion de funcion delegada para setear informacion de tabla del PDF
      ],
      styles: {
        tableTotal: {
          fontSize: 30,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 8, margin: [0, 3, 0, 3] },
        itemsTableInfo: { fontSize: 10, margin: [0, 5, 0, 5] },
        subtitulos: {
          fontSize: 16,
          alignment: "center",
          margin: [0, 5, 0, 10],
        },
        tableMargin: { margin: [0, 10, 0, 20], alignment: "center" },
        CabeceraTabla: {
          fontSize: 12,
          alignment: "center",
          margin: [0, 8, 0, 8],
          fillColor: this.p_color,
        },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: "blue", opacity: 0.5 },
      },
    };
  }

  //Funcion para llenar la tabla con la consulta realizada al backend
  CampoDetalle(servicio: any[]) {
    return {
      style: "tableMargin",
      table: {
        headerRows: 1,
        widths: ["*", "*"],

        body: [
          [
            { text: "Usuario", style: "tableHeader" },
            { text: "Fecha", style: "tableHeader" },
          ],
          ...servicio.map((res) => {
            return [
              { style: "itemsTable", text: res.Usuario },
              { style: "itemsTable", text: res.Fecha },
            ];
          }),
        ],
      },
      layout: {
        fillColor: function (rowIndex) {
          return rowIndex % 2 === 0 ? "#E5E7E9" : null;
        },
      },
    };
  }




































  async generarPdfPreguntasResumen(action = "open", pdf: number, opcion: any) {
    if (this.servicioResumen.length != 0) {
      //Seteo de rango de fechas de la consulta para impresión en PDF
      var fechaDesde = this.fromDateResumen.nativeElement.value.toString().trim();
      var fechaHasta = this.toDateResumen.nativeElement.value.toString().trim();

      const pdfMake = await this.validar.ImportarPDF();
      //Definicion de funcion delegada para setear estructura del PDF
      let documentDefinition: any;
      if (pdf === 1) {
        documentDefinition = this.getDocumentResumen(fechaDesde, fechaHasta, opcion);
      }
      //Opciones de PDF de las cuales se usara la de open, la cual abre en nueva pestaña el PDF creado
      switch (action) {
        case "open":
          pdfMake.createPdf(documentDefinition).open();
          break;
        case "print":
          pdfMake.createPdf(documentDefinition).print();
          break;
        case "download":
          pdfMake.createPdf(documentDefinition).download();
          break;

        default:
          pdfMake.createPdf(documentDefinition).open();
          break;
      }
    }
  }

  //Funcion delegada para seteo de información
  getDocumentResumen(fechaDesde: any, fechaHasta: any, opcion: any) {
    //Se obtiene la fecha actual
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();

    return {
      //Seteo de marca de agua y encabezado con nombre de usuario logueado
      pageSize: 'A4',
      watermark: {
        text: this.marca,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
        fontSize: 52,
      },
      header: {
        text: "Impreso por:  " + this.userDisplayName,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
      },
      //Seteo de pie de pagina, fecha de generacion de PDF con numero de paginas
      footer: function (currentPage: any, pageCount: any, fecha: any) {
        fecha = f.toJSON().split("T")[0];
        var timer = f.toJSON().split("T")[1].slice(0, 5);
        return [
          {
            margin: [10, 20, 10, 0],
            columns: [
              "Fecha: " + fecha + " Hora: " + timer,
              {
                text: [
                  {
                    text:
                      "© Pag " + currentPage.toString() + " of " + pageCount,
                    alignment: "right",
                    color: "blue",
                    opacity: 0.5,
                  },
                ],
              },
            ],
            fontSize: 9,
            color: "#A4B8FF",
          },
        ];
      },
      //Contenido del PDF, logo, nombre del reporte, con el renago de fechas de los datos
      content: [
        {
          columns: [
            {
              image: this.urlImagen,
              width: 90,
              height: 45,
            },
            {
              width: "*",
              alignment: "center",
              text: "REPORTE ENCUENTAS REALIZADAS",
              bold: true,
              fontSize: 15,
              margin: [-90, 20, 0, 0],
            },
          ],
        },
        {
          style: "subtitulos",
          text: "Periodo de " + fechaDesde + " hasta " + fechaHasta,
        },
        this.CampoDetalleResumen(opcion),
        {
          style: "subtitulos",
          text: "TOTAL DE ENCUESTAS REALIZADAS: " + this.respuestasTotal,
        }, //Definicion de funcion delegada para setear informacion de tabla del PDF
      ],
      styles: {
        tableTotal: {
          fontSize: 30,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 8, margin: [0, 3, 0, 3] },
        itemsTableInfo: { fontSize: 10, margin: [0, 5, 0, 5] },
        subtitulos: {
          fontSize: 14,
          alignment: "center",
          margin: [0, 5, 0, 10],
        },
        tableMargin: { margin: [0, 10, 0, 20], alignment: "center" },
        CabeceraTabla: {
          fontSize: 12,
          alignment: "center",
          margin: [0, 8, 0, 8],
          fillColor: this.p_color,
        },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: "blue", opacity: 0.5 },
      },
    };
  }

  //Funcion para llenar la tabla con la consulta realizada al backend
  CampoDetalleResumen(opcion: any) {
    let servicio: any = [];
    if (opcion === 1) {
      servicio = this.servicioEncuesta;
    }
    else {
      servicio = this.servicioResumen;
    }
    if (servicio.length != 0) {
      return {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            style: "tableMargin",
            table: {
              headerRows: 1,
              widths: ["auto", "*", "auto", "auto"],
              body: [
                [
                  { text: "Sucursal", style: "tableHeader" },
                  { text: "Encuesta", style: "tableHeader" },
                  { text: "Cajero", style: "tableHeader" },
                  { text: "Encuestas realizadas", style: "tableHeader" },
                ],
                ...servicio.map((res: any) => {
                  return [
                    { style: "itemsTable", text: res.nombre_sucursal },
                    { style: "itemsTable", text: res.nombre_encuesta },
                    { style: "itemsTable", text: res.nombre_usuario },
                    { style: "itemsTable", text: res.encuestas_realizadas },
                  ];
                }),
              ],
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return rowIndex % 2 === 0 ? "#E5E7E9" : null;
              },
            },
          },
          { width: '*', text: '' },
        ]
      };
    }
  }





}
