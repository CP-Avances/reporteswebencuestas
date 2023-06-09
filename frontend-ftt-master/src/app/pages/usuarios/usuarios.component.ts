import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { Utils } from "../../utils/util";

import { AuthenticationService } from "../../services/authentication.service";
import { ImagenesService } from "../../shared/imagenes.service";
import { ServiceService } from "../../services/service.service";

import { cajero } from "../../models/cajero";
import { turno } from "../../models/turno";

// COMPLEMENTOS PARA PDF Y EXCEL
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as XLSX from "xlsx";
import moment from "moment";

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

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
  @ViewChild("fromDateTurnosMeta") fromDateTurnosMeta: ElementRef;
  @ViewChild("toDateTurnosMeta") toDateTurnosMeta: ElementRef;
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
  @ViewChild("horaInicioTM") horaInicioTM: ElementRef;
  @ViewChild("horaFinTM") horaFinTM: ElementRef;
  @ViewChild("horaInicioTPA") horaInicioTPA: ElementRef;
  @ViewChild("horaFinTPA") horaFinTPA: ElementRef;
  @ViewChild("horaInicioTA") horaInicioTA: ElementRef;
  @ViewChild("horaFinTA") horaFinTA: ElementRef;
  @ViewChild("horaInicioAU") horaInicioAU: ElementRef;
  @ViewChild("horaFinAU") horaFinAU: ElementRef;
  @ViewChild("horaInicioES") horaInicioES: ElementRef;
  @ViewChild("horaFinES") horaFinES: ElementRef;

  // SERVICIOS-VARIABLES DONDE SE ALMACENARAN LAS CONSULTAS A LA BD
  turno: turno[];
  cajero: cajero[];
  sucursales: any[];
  cajerosUsuarios: any = [];
  encuestas: any = [];
  preguntas: any = [];
  fechas: any = [];
  servicioTurnosFecha: any = [];
  servicioTurnosTotalFecha: any = [];
  servicioTurnosMeta: any = [];
  servicioAtencionUsua: any = [];
  servicioPromAtencion: any = [];
  servicioTiempoAtencion: any = [];
  servicioEntradaSalida: any = [];

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

  // BANDERAS PARA QUE NO SE QUEDE EN PANTALLA CONSULTAS ANTERIORES
  malRequestTF: boolean = false;
  malRequestTTF: boolean = false;
  malRequestTM: boolean = false;
  malRequestTFPag: boolean = false;
  malRequestTTFPag: boolean = false;
  malRequestTMPag: boolean = false;
  malRequestTPA: boolean = false;
  malRequestTPPag: boolean = false;
  malRequestTA: boolean = false;
  malRequestTAPag: boolean = false;
  malRequestAU: boolean = false;
  malRequestAUPag: boolean = false;
  malRequestES: boolean = false;
  malRequestESPag: boolean = false;

  // USUARIO QUE INGRESO AL SISTEMA
  userDisplayName: any;

  // CONTROL PAGINACION
  configTF: any;
  configTTF: any;
  configTM: any;
  configTP: any;
  configTA: any;
  configES: any;
  configAU: any;

  // FECHA CAPTURADA DEL SERVIDOR
  date: any;

  // VARIABLE USADA EN EXPORTACION A EXCEL
  p_color: any;

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
  seleccionMultiple: boolean = false;
  seleccionMultipleE: boolean = false;
  seleccionMultipleC: boolean = false;
  encuestaSeleccionada: string;
  cajeroSeleccionado: string;

  //MOSTRAR CAJEROS
  mostrarCajeros: boolean = false;
  mostrarEncuestas: boolean = false;
  mostrarPreguntas: boolean = false;
  mostrarFechas: boolean = false;

  //Variables de informacion
  valor: number;
  marca: string = "FullTime Tickets";
  horas: number[] = [];

  @Output() menuMostrarOcultar: EventEmitter<any> = new EventEmitter();

  constructor(
    private serviceService: ServiceService,
    private toastr: ToastrService,
    private router: Router,
    private auth: AuthenticationService,
    public datePipe: DatePipe,
    private imagenesService: ImagenesService
  ) {
    // SETEO DE ITEM DE PAGINACION CUANTOS ITEMS POR PAGINA, DESDE QUE PAGINA EMPIEZA, EL TOTAL DE ITEMS RESPECTIVAMENTE
    // TURNOS POR FECHA
    this.configTF = {
      id: "usuariosTF",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioTurnosFecha.length,
    };
    // TURNOS TOTALES POR FECHA
    this.configTTF = {
      id: "usuariosTTF",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioTurnosTotalFecha.length,
    };
    // TURNOS META
    this.configTM = {
      id: "usuariosTM",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioTurnosMeta.length,
    };
    // TIEMPO PROMEDIO DE ATENCION
    this.configTP = {
      id: "usuariosTP",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioPromAtencion.length,
    };
    // TIEMPO DE ATENCION POR TURNOS
    this.configTA = {
      id: "usuariosTA",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioTiempoAtencion.length,
    };
    // ENTRADAS Y SALIDAS DEL SISTEMA
    this.configES = {
      id: "usuariosES",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioEntradaSalida.length,
    };
    // ATENCION AL USUARIO
    this.configAU = {
      id: "usuariosAU",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioAtencionUsua.length,
    };

    for (let i = 0; i <= 24; i++) {
      this.horas.push(i);
    }
  }

  // EVENTOS PARA AVANZAR O RETROCEDER EN LA PAGINACION
  // TURNOS POR FECHA
  pageChangedTF(event: any) {
    this.configTF.currentPage = event;
  }
  // TURNOS TOTAL POR FECHA
  pageChangedTTF(event: any) {
    this.configTTF.currentPage = event;
  }
  // TURNOS META
  pageChangedTM(event: any) {
    this.configTM.currentPage = event;
  }
  // TIEMPO PROMEDIO DE ATENCION
  pageChangedTP(event: any) {
    this.configTP.currentPage = event;
  }
  // TIEMPO DE ATENCION POR TURNOS
  pageChangedTA(event: any) {
    this.configTA.currentPage = event;
  }
  // ENTRADAS Y SALIDAS AL SISTEMA
  pageChangedES(event: any) {
    this.configES.currentPage = event;
  }
  // ATENCION AL USUARIO
  pageChangedAU(event: any) {
    this.configAU.currentPage = event;
  }

  ngOnInit(): void {
    var f = moment();
    this.date = f.format("YYYY-MM-DD");

    // CARGAMOS COMPONENTES SELECTS HTML
    this.getlastday();
    this.getSucursales();
    // this.getMeta();
    this.getMarca();
    this.getCajeros("-1");

    // CARGAMOS NOMBRE DE USUARIO LOGUEADO
    this.userDisplayName = sessionStorage.getItem("loggedUser");

    // SETEO DE BANDERAS CUANDO EL RESULTADO DE LA PETICION HTTP NO ES 200 OK
    this.malRequestTFPag = true;
    this.malRequestTTFPag = true;
    this.malRequestTMPag = true;
    this.malRequestTPPag = true;
    this.malRequestTAPag = true;
    this.malRequestESPag = true;
    this.malRequestAUPag = true;

    // CARGAR LOGO PARA LOS REPORTES
    this.imagenesService
      .cargarImagen()
      .then((result: string) => {
        this.urlImagen = result;
      })
      .catch((error) => {
        Utils.getImageDataUrlFromLocalPath1("assets/images/logo.png").then(
          (result) => (this.urlImagen = result)
        );
      });
  }

  selectAll(opcion: string) {
    switch (opcion) {
      case "allSelected":
        this.allSelected = !this.allSelected;
        break;
      case "todasSucursalesTF":
        this.todasSucursalesTF = !this.todasSucursalesTF;
        this.todasSucursalesTF
          ? this.getCajeros(this.sucursalesSeleccionadas)
          : null;
        break;
      case "todasSucursalesTTF":
        this.todasSucursalesTTF = !this.todasSucursalesTTF;
        this.todasSucursalesTTF
          ? this.getEncuestas(this.sucursalesSeleccionadas)
          : null;
        break;
      case "todasEncuestas":
        this.todasEncuestas = !this.todasEncuestas;
        this.todasEncuestas ? this.getPreguntas(this.selectedEncuestas) : null;
        break;
      case "todasSucursalesTM":
        this.todasSucursalesTM = !this.todasSucursalesTM;
        this.todasSucursalesTM
          ? this.getCajeros(this.sucursalesSeleccionadas)
          : null;
        break;
      case "todasSucursalesES":
        this.todasSucursalesES = !this.todasSucursalesES;
        break;
      case "todasSucursalesTPA":
        this.todasSucursalesTPA = !this.todasSucursalesTPA;
        this.todasSucursalesTPA
          ? this.getCajeros(this.sucursalesSeleccionadas)
          : null;
        break;
      case "todasSucursalesTA":
        this.todasSucursalesTA = !this.todasSucursalesTA;
        this.todasSucursalesTA
          ? this.getCajeros(this.sucursalesSeleccionadas)
          : null;
        break;
      case "todasSucursalesAU":
        this.todasSucursalesAU = !this.todasSucursalesAU;
        this.todasSucursalesAU
          ? this.getCajeros(this.sucursalesSeleccionadas)
          : null;
        break;
      case "sucursalesSeleccionadas":
        this.seleccionMultiple = this.sucursalesSeleccionadas.length > 1;
        this.sucursalesSeleccionadas.length > 0
          ? this.getCajeros(this.sucursalesSeleccionadas)
          : null;
        break;
      case "sucursalesSeleccionadasE":
        this.seleccionMultiple = this.sucursalesSeleccionadas.length > 1;
        this.sucursalesSeleccionadas.length > 0
          ? this.getEncuestas(this.sucursalesSeleccionadas)
          : null;
        break;
      case "encuestasSeleccionadas":
        this.seleccionMultipleE = this.selectedEncuestas.length > 1;
        this.selectedEncuestas.length > 0
          ? this.getPreguntas(this.selectedEncuestas)
          : null;
        break;
      case "encuestasSeleccionadasI":
        this.getFechas(this.cajeroSeleccionado, this.encuestaSeleccionada);
        break;
      case "cajerosSeleccionados":
        this.getEncuestas("-1");
        break;
      default:
        break;
    }
  }

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
  getCajeros(sucursal: any) {
    this.serviceService.getAllCajerosS(sucursal).subscribe(
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

  getEncuestas(sucursal: any) {
    this.serviceService.getAllEncuestas(sucursal).subscribe(
      (cajeros: any) => {
        this.encuestas = cajeros.cajeros;
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

  getFechas(cajero: any, encuesta: any) {
    var fechaDesde = this.fromDateTurnosMeta.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.toDateTurnosMeta.nativeElement.value
      .toString()
      .trim();

    let horaInicio = this.horaInicioTM.nativeElement.value;
    let horaFin = this.horaFinTM.nativeElement.value;

    this.serviceService
      .getAllFechas(
        cajero,
        encuesta,
        fechaDesde,
        fechaHasta,
        horaInicio,
        horaFin
      )
      .subscribe(
        (cajeros: any) => {
          this.fechas = cajeros.cajeros;
          this.mostrarFechas = true;
        },
        (error) => {
          if (error.status == 400) {
            this.fechas = [];
            this.mostrarFechas = false;
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
    // this.cajerosUsuarios = [];
    // this.mostrarCajeros = false;
    this.selectedItems = [];
    this.allSelected = false;
    this.todasSucursalesTPA = false;
    this.todasSucursalesTA = false;
    this.todasSucursalesTF = false;
    this.todasSucursalesTTF = false;
    this.todasSucursalesTM = false;
    this.todasSucursalesES = false;
    this.todasSucursalesAU = false;
    this.seleccionMultiple = false;
    this.seleccionMultipleE = false;
    this.sucursalesSeleccionadas = [];
    this.selectedEncuestas = [];
    this.selectedPreguntas = [];
    this.selectedFechas = [];
    this.mostrarEncuestas = false;
    this.encuestas = [];
    this.encuestaSeleccionada = null;
    this.cajeroSeleccionado = null;
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
        .getfiltroturnosfechas(
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

    if (this.sucursalesSeleccionadas.length !== 0) {
      this.serviceService
        .getturnostotalfechas(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.sucursalesSeleccionadas,
          this.selectedEncuestas,
          this.selectedPreguntas
        )
        .subscribe(
          (servicio: any) => {
            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
            this.servicioTurnosTotalFecha = servicio.turnos;
            this.malRequestTTF = false;
            this.malRequestTTFPag = false;

            // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
            if (this.configTTF.currentPage > 1) {
              this.configTTF.currentPage = 1;
            }
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
   ** **                                          ENCUESTA INDIVIDUAL                                         ** **
   ** ********************************************************************************************************** **/

  buscarEncuestaIndividual() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fromDateTurnosMeta.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.toDateTurnosMeta.nativeElement.value
      .toString()
      .trim();

    let horaInicio = this.horaInicioTM.nativeElement.value;
    let horaFin = this.horaFinTM.nativeElement.value;

    this.serviceService
      .getturnosMeta(
        fechaDesde,
        fechaHasta,
        horaInicio,
        horaFin,
        this.cajeroSeleccionado,
        this.encuestaSeleccionada,
        this.selectedFechas
      )
      .subscribe(
        (servicio: any) => {
          // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
          this.servicioTurnosMeta = servicio.turnos;
          this.malRequestTM = false;
          this.malRequestTMPag = false;

          // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
          if (this.configTM.currentPage > 1) {
            this.configTM.currentPage = 1;
          }
        },
        (error) => {
          if (error.status == 400) {
            // SI HAY ERROR 400 SE VACIA VARIABLE Y BANDERAS CAMBIAN PARA QUITAR TABLA DE INTERFAZ
            this.servicioTurnosMeta = null;
            this.malRequestTM = true;
            this.malRequestTMPag = true;

            // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
            // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
            if (this.servicioTurnosMeta == null) {
              this.configTM.totalItems = 0;
            } else {
              this.configTM.totalItems = this.servicioTurnosMeta.length;
            }

            // POR ERROR 400 SE SETEA ELEMENTOS DE PAGINACION
            this.configTM = {
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


  // en el controlador de Angular
  convertirObjetoACadena(objeto) {
    return objeto.toString();
  }

  ExportTOExcelEntradasSistema() {
    //Mapeo de información de consulta a formato JSON para exportar a Excel
    let jsonServicio = [];
    for (let i = 0; i < this.servicioTurnosFecha.length; i++) {
      jsonServicio.push({
        Usuario: this.servicioTurnosFecha[i].Usuario,
        Fecha: new Date(this.servicioTurnosFecha[i].Fecha),
      });
    }

    //Instrucción para generar excel a partir de JSON, y nombre del archivo con fecha actual
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonServicio);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.servicioTurnosFecha[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
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

  ExportTOExcelPreguntasRespuestas() {
    //Mapeo de información de consulta a formato JSON para exportar a Excel
    let jsonServicio = [];
    if (this.todasSucursalesTTF || this.seleccionMultiple) {
      for (let i = 0; i < this.servicioTurnosTotalFecha.length; i++) {
        jsonServicio.push({
          Sucursal: this.servicioTurnosTotalFecha[i].sucursal,
          Encuesta: this.servicioTurnosTotalFecha[i].encuesta,
          Fecha: new Date(this.servicioTurnosTotalFecha[i].fecha),
          Titulo: this.servicioTurnosTotalFecha[i].titulo,
          Pregunta: this.servicioTurnosTotalFecha[i].pregunta,
          Respuesta: this.servicioTurnosTotalFecha[i].respuesta,
        });
      }
    } else {
      for (let i = 0; i < this.servicioTurnosTotalFecha.length; i++) {
        jsonServicio.push({
          Encuesta: this.servicioTurnosTotalFecha[i].encuesta,
          Fecha: new Date(this.servicioTurnosTotalFecha[i].fecha),
          Titulo: this.servicioTurnosTotalFecha[i].titulo,
          Pregunta: this.servicioTurnosTotalFecha[i].pregunta,
          Respuesta: this.servicioTurnosTotalFecha[i].respuesta,
        });
      }
    }
    //Instrucción para generar excel a partir de JSON, y nombre del archivo con fecha actual
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonServicio);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.servicioTurnosTotalFecha[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
    for (var i = 0; i < header.length; i++) {
      // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 150 });
    }
    ws["!cols"] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");
    XLSX.writeFile(
      wb,
      "Preguntas y respuestas " +
        new Date().toLocaleString() +
        EXCEL_EXTENSION
    );
  }

  ExportTOExcelEncuesta() {
    //Mapeo de información de consulta a formato JSON para exportar a Excel
    let jsonServicio = [];
    for (let i = 0; i < this.servicioTurnosMeta.length; i++) {
      jsonServicio.push({
        Fecha: new Date(this.servicioTurnosMeta[i].fecha),
        Usuario: this.servicioTurnosMeta[i].usuario_NOM_US,
        Titulo: this.servicioTurnosMeta[i].pregunta_SEC_PR,
        Pregunta: this.servicioTurnosMeta[i].pregunta_PREG_PR,
        Respuesta: this.servicioTurnosMeta[i].respuesta,
      });
    }
    //Instrucción para generar excel a partir de JSON, y nombre del archivo con fecha actual
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonServicio);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.servicioTurnosMeta[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
    for (var i = 0; i < header.length; i++) {
      // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 150 });
    }
    ws["!cols"] = wscols;
    XLSX.utils.book_append_sheet(wb, ws, "Encuesta");
    XLSX.writeFile(
      wb,
      "Encuesta individual " + new Date().toLocaleString() + EXCEL_EXTENSION
    );
  }


  validarHoras(hInicio, hFin) {
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
  generarPdfEntradasSistema(action = "open", pdf: number) {
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

    //Definicion de funcion delegada para setear estructura del PDF
    let documentDefinition;
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

  generarPdfPreguntasRespuestas(action = "open", pdf: number) {
    //Seteo de rango de fechas de la consulta para impresión en PDF
    var fechaDesde = this.fromDateTurnosTotalFecha.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.toDateTurnosTotalFecha.nativeElement.value
      .toString()
      .trim();

    //Definicion de funcion delegada para setear estructura del PDF
    let documentDefinition;
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

  //Funcion delegada para seteo de información
  getDocumentturnosTotalfecha(fechaDesde, fechaHasta) {
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
              text: "Reporte - Preguntas y respuestas ",
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
        this.CampoDetalleTotal(this.servicioTurnosTotalFecha), //Definicion de funcion delegada para setear informacion de tabla del PDF
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
  CampoDetalleTotal(servicio: any[]) {
    if (this.todasSucursalesTTF) {
      return {
        style: "tableMargin",
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "*", "*"],

          body: [
            [
              { text: "Sucursal", style: "tableHeader" },
              { text: "Encuesta", style: "tableHeader" },
              { text: "Fecha", style: "tableHeader" },
              { text: "Titulo", style: "tableHeader" },
              { text: "Pregunta", style: "tableHeader" },
              { text: "Respuesta", style: "tableHeader" },
            ],
            ...servicio.map((res) => {
              return [
                { style: "itemsTable", text: res.sucursal },
                { style: "itemsTable", text: res.encuesta },
                { style: "itemsTable", text: res.fecha },
                { style: "itemsTable", text: res.titulo },
                { style: "itemsTable", text: res.pregunta },
                { style: "itemsTable", text: res.respuesta },
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
    } else {
      return {
        style: "tableMargin",
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "*", "*"],

          body: [
            [
              { text: "Encuesta", style: "tableHeader" },
              { text: "Fecha", style: "tableHeader" },
              { text: "Titulo", style: "tableHeader" },
              { text: "Pregunta", style: "tableHeader" },
              { text: "Respuesta", style: "tableHeader" },
            ],
            ...servicio.map((res) => {
              return [
                { style: "itemsTable", text: res.encuesta },
                { style: "itemsTable", text: res.fecha },
                { style: "itemsTable", text: res.titulo },
                { style: "itemsTable", text: res.pregunta },
                { style: "itemsTable", text: res.respuesta },
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
  }

  generarPdfEncuesta(action = "open", pdf: number) {
    //Seteo de rango de fechas de la consulta para impresión en PDF
    var fechaDesde = this.fromDateTurnosMeta.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.toDateTurnosMeta.nativeElement.value
      .toString()
      .trim();

    //Definicion de funcion delegada para setear estructura del PDF
    let documentDefinition;
    if (pdf === 1) {
      documentDefinition = this.getDocumentturnosMeta(fechaDesde, fechaHasta);
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

  //Funcion delegada para seteo de información
  getDocumentturnosMeta(fechaDesde, fechaHasta) {
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
              text: "Reporte - Encuesta individual ",
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
        this.CampoDetalleMeta(this.servicioTurnosMeta), //Definicion de funcion delegada para setear informacion de tabla del PDF
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
  CampoDetalleMeta(servicio: any[]) {
    return {
      style: "tableMargin",
      table: {
        headerRows: 1,
        widths: ["auto", "auto", "auto", "*", "*"],

        body: [
          [
            { text: "Fecha", style: "tableHeader" },
            { text: "Usuario", style: "tableHeader" },
            { text: "Titulo", style: "tableHeader" },
            { text: "Pregunta", style: "tableHeader" },
            { text: "Respuesta", style: "tableHeader" },
          ],
          ...servicio.map((res) => {
            return [
              { style: "itemsTable", text: res.fecha },
              { style: "itemsTable", text: res.usuario_NOM_US },
              { style: "itemsTable", text: res.pregunta_SEC_PR },
              { style: "itemsTable", text: res.pregunta_PREG_PR },
              { style: "itemsTable", text: res.respuesta },
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
}
