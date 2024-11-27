import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { Utils } from "../../utils/util";
import { DateTime } from 'luxon';

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
          ? this.getPreguntas(this.encuestaSeleccionada)
          : null;
        break;
      case "encuestasSeleccionadasI":
        this.seleccionMultipleI = this.encuestaSeleccionada.length > 1;
        this.encuestaSeleccionada.length > 0
          ? this.getPreguntas(this.encuestaSeleccionada)
          : null;
        break;
      case "todasSucursales":
        this.todasSucursalesTTF = !this.todasSucursalesTTF;
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
          ? this.getPreguntas(this.selectedEncuestas)
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

  // CONSULTA DE DATOS DE PREGUNTAS
  getPreguntas(sucursal: any) {
    this.serviceService.getAllPreguntas(sucursal).subscribe(
      (cajeros: any) => {
        this.preguntas = cajeros.cajeros;
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
  preguntas_respuestas: any = [];
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
        .getListaPreguntasRespuestas(
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
            this.servicioTurnosTotalFecha = servicio.resumen;
            console.log(' datos ...', this.servicioTurnosTotalFecha)
            let auxiliar = servicio.resumen;
            let usuario_encuesta = auxiliar.filter(
              (valor: any, indice: any, self: any) =>
                self.findIndex((v: any) => v.CODIGO_RESPUESTA === valor.CODIGO_RESPUESTA) === indice
            );
            //console.log(' valores usuario ', usuario_encuesta)
            this.preguntas_respuestas = usuario_encuesta;
            this.preguntas_respuestas.forEach((usu: any) => {
              let nuevo: any = [];
              auxiliar.forEach((preg: any) => {
                if (preg.CODIGO_RESPUESTA === usu.CODIGO_RESPUESTA) {
                  const fecha = DateTime.fromISO(preg.fecha_hora, { zone: 'utc' });
                  let data = {
                    codigo_pregunta: preg.codigo_pregunta,
                    titulo: preg.titulo,
                    pregunta: preg.pregunta,
                    respuesta: preg.respuesta,
                    fecha_hora: preg.fecha_hora,
                    fecha: fecha.toFormat('dd/MM/yyyy'),
                    hora: fecha.toFormat('HH:mm:ss'),
                  }
                  nuevo.push(data);
                }
              })
              nuevo.sort((a: any, b: any) => a.codigo_pregunta - b.codigo_pregunta);
              usu.informacion = nuevo;
            })
            //console.log(' ver general ', this.preguntas_respuestas)
            this.malRequestTTF = false;
            this.malRequestTTFPag = false;
            // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
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


  // en el controlador de Angular
  convertirObjetoACadena(objeto) {
    return objeto.toString();
  }

  ExportTOExcelEntradasSistema() {
    if (this.servicioTurnosFecha.length != 0) {
      //Mapeo de información de consulta a formato JSON para exportar a Excel
      let jsonServicio:any = [];
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
      var wscols:any = [];
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

  ExportTOExcelPreguntasRespuestas() {
    if (this.preguntas_respuestas.length != 0) {
      //Mapeo de información de consulta a formato JSON para exportar a Excel
      let jsonServicio:any = [];
      let nuevo: Array<any> = [];
      let c = 0;
      this.preguntas_respuestas.forEach((preg) => {
        preg.informacion.forEach((inf: any) => {
          c = c + 1;
          let ele = {
            'N°': c,
            Sucursal: preg.sucursal,
            Cajero: preg.NOM_US,
            Encuesta: preg.encuesta,
            'Código encuesta': preg.CODIGO_RESPUESTA,
            Titulo: inf.titulo,
            pregunta: inf.pregunta,
            respuesta: inf.respuesta,
            fecha: inf.fecha,
            hora: inf.hora,
          };
          nuevo.push(ele);
        });
      });
      jsonServicio = nuevo;
      //Instrucción para generar excel a partir de JSON, y nombre del archivo con fecha actual
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonServicio);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
      const header = Object.keys(this.servicioTurnosTotalFecha[0]); // NOMBRE DE CABECERAS DE COLUMNAS
      var wscols:any = [];
      for (var i = 0; i < header.length; i++) {
        // CABECERAS AÑADIDAS CON ESPACIOS
        wscols.push({ wpx: 150 });
      }
      ws["!cols"] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "LISTA ENCUESTAS");
      XLSX.writeFile(
        wb,
        "LISTA ENCUESTAS " + new Date().toLocaleString() + EXCEL_EXTENSION
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
      let jsonServicio:any = [];
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
      var wscols:any = [];
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

  async generarPdfPreguntasRespuestas(action = "open", pdf: number) {
    if (this.preguntas_respuestas.length != 0) {
      //Seteo de rango de fechas de la consulta para impresión en PDF
      var fechaDesde = this.fromDateTurnosTotalFecha.nativeElement.value
        .toString()
        .trim();
      var fechaHasta = this.toDateTurnosTotalFecha.nativeElement.value
        .toString()
        .trim();

      const pdfMake = await this.validar.ImportarPDF();
      //Definicion de funcion delegada para setear estructura del PDF
      let documentDefinition: any;
      if (pdf === 1) {
        documentDefinition = this.getDocumentturnosTotalfecha(
          fechaDesde,
          fechaHasta
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
  getDocumentturnosTotalfecha(fechaDesde: any, fechaHasta: any) {
    //Se obtiene la fecha actual
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();

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
              text: "LISTA DE ENCUESTAS",
              bold: true,
              fontSize: 15,
              margin: [-90, 20, 0, 0],
            },
          ],
        },
        {
          style: "subtitulos",
          text: "Período de " + fechaDesde + " hasta " + fechaHasta,
        },
        this.EstructurarDatosPDF(this.preguntas_respuestas),
        {
          style: "subtitulos",
          text: "TOTAL DE ENCUESTAS: " + this.respuestasTotalC,
        }, //Definicion de funcion delegada para setear informacion de tabla del PDF
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#0096c7' },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.p_color, alignment: 'rigth' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: this.p_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableTotal: {
          fontSize: 30,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        CabeceraTabla: {
          fontSize: 12,
          alignment: "center",
          margin: [0, 8, 0, 8],
          fillColor: this.p_color,
        },
        subtitulos: {
          fontSize: 14,
          alignment: "center",
          margin: [0, 5, 0, 10],
        },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: "blue", opacity: 0.5 },
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



  EstructurarDatosPDF(data: any[]): Array<any> {
    console.log('ver pdf ', data)
    let n: any = [];
    data.forEach((selec: any) => {
      //let reg = this.validar.SumarRegistros(arr_reg)
      // PRESENTACION DE LA INFORMACION
      n.push({
        style: 'tableMarginCabeceraEmpleado',
        table: {
          widths: ['*', '*'],
          headerRows: 2,
          body: [
            [
              {
                border: [true, true, false, false],
                text: 'SUCURSAL: ' + selec.sucursal,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [true, true, true, false],
                text: 'ENCUESTA: ' + selec.encuesta,
                style: 'itemsTableInfoEmpleado'
              },
            ],
            [
              {
                border: [true, false, false, false],
                text: 'CAJERO: ' + selec.NOM_US,
                style: 'itemsTableInfoEmpleado',
              },
              {
                border: [true, false, true, false],
                text: 'N° Preguntas: ' + selec.informacion.length,
                style: 'itemsTableInfoEmpleado',
              },

            ],
          ],
        },
      });
      n.push({
        style: 'tableMargin',
        table: {
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              { text: 'N°', style: 'tableHeader' },
              { text: 'TÍTULO', style: 'tableHeader' },
              { text: 'PREGUNTA', style: 'tableHeader' },
              { text: 'RESPUESTA', style: 'tableHeader' },
              { text: 'FECHA', style: 'tableHeader' },
              { text: 'HORA', style: 'tableHeader' },
            ],
            ...selec.informacion.map((inf: any) => {
              const fecha = DateTime.fromISO(inf.fecha_hora, { zone: 'utc' });
              return [
                {
                  style: 'itemsTableCentrado',
                  text: selec.informacion.indexOf(inf) + 1,
                },
                { style: 'itemsTableCentrado', text: inf.titulo },
                { style: 'itemsTable', text: inf.pregunta },
                { style: 'itemsTableCentrado', text: inf.respuesta },
                { style: 'itemsTableCentrado', text: fecha.toFormat('dd/MM/yyyy') },
                { style: 'itemsTableCentrado', text: fecha.toFormat('HH:mm:ss') },
              ];
            }),
          ],
        },
        layout: {
          fillColor: function (rowIndex: any) {
            // #E5E7E9
            return rowIndex % 2 === 0 ? '#caf0f8' : null;
          },
        },
      });
    });
    return n;
  }

}
