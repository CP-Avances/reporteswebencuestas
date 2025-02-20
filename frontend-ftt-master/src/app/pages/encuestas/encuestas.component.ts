import { Component, ViewChild, ElementRef, EventEmitter, Output } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { Utils } from "../../utils/util";
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

import { AuthenticationService } from "../../services/authentication.service";
import { ValidacionesService } from "src/app/services/validaciones/validaciones.service";
import { ImagenesService } from "../../shared/imagenes.service";
import { ServiceService } from "../../services/service.service";
import { InformacionComponent } from "../informacion/informacion.component";

const EXCEL_EXTENSION = ".xlsx";

@Component({
  standalone: false,
  selector: 'app-encuestas',
  templateUrl: './encuestas.component.html',
  styleUrls: ['./encuestas.component.scss']
})

export class EncuestasComponent {

  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private fontTitulo!: Partial<ExcelJS.Font>;

  // SETEO DE FECHAS PRIMER DIA DEL MES ACTUAL Y DIA ACTUAL
  fromDate: any;
  toDate: any;
  expansion: boolean = false;

  // CAPTURA DE ELEMENTOS DE LA INTERFAZ VISUAL PARA TRATARLOS Y CAPTURAR DATOS
  @ViewChild("fechaDesde") fechaDesde: ElementRef;
  @ViewChild("fechaHasta") fechaHasta: ElementRef;
  @ViewChild("horaInicioE") horaInicioE: ElementRef;
  @ViewChild("horaFinE") horaFinE: ElementRef;

  @ViewChild("fromDateResumen") fromDateResumen: ElementRef;
  @ViewChild("toDateResumen") toDateResumen: ElementRef;
  @ViewChild("horaInicioR") horaInicioR: ElementRef;
  @ViewChild("horaFinR") horaFinR: ElementRef;

  // SERVICIOS-VARIABLES DONDE SE ALMACENARAN LAS CONSULTAS A LA BD
  preguntas_respuestas: any = [];
  servicioEncuesta: any = [];
  servicioResumen: any = [];
  cajerosUsuarios: any = [];
  sucursales: any[];
  encuestas: any = [];
  preguntas: any = [];

  // BANDERAS PARA MOSTRAR LA TABLA CORRESPONDIENTE A LAS CONSULTAS
  todasSucursales: boolean = false;
  todasEncuestas: boolean = false;
  todosLosCajeros: boolean = false;

  // BANDERAS PARA QUE NO SE QUEDE EN PANTALLA CONSULTAS ANTERIORES
  malRequestTTF: boolean = false;
  malRequestR: boolean = false;
  malRequestTTFPag: boolean = false;
  malRequestRPag: boolean = false;

  // USUARIO QUE INGRESO AL SISTEMA
  userDisplayName: any;

  // CONTROL PAGINACION
  configTTF: any;
  configR: any;

  // FECHA CAPTURADA DEL SERVIDOR
  date: any;

  // VARIABLE USADA EN EXPORTACION A EXCEL
  p_color: any = '#0077b6';

  // MAXIMO DE ITEMS MOSTRADO DE TABLA EN PANTALLA
  private MAX_PAGS = 5;
  itemsPerPageOptions = [5, 10, 15, 20, 50];

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
  selectedEncuestas: string[] = [];
  sucursalesSeleccionadas: string[] = [];
  usuariosSeleccionados: string[] = [];
  encuestaSeleccionada: string[] = [];

  //MOSTRAR CAJEROS
  mostrarCajeros: boolean = false;
  mostrarEncuestas: boolean = false;
  mostrarPreguntas: boolean = false;
  mostrarFechas: boolean = false;

  // VARIABLES DE INFORMACION
  marca: string = "";
  horas: number[] = [];

  // TOTALES
  respuestasTotal: number;

  @Output() menuMostrarOcultar: EventEmitter<any> = new EventEmitter();

  constructor(
    private imagenesService: ImagenesService,
    private serviceService: ServiceService,
    private toastr: ToastrService,
    private router: Router,
    private auth: AuthenticationService,
    public datePipe: DatePipe,
    public validar: ValidacionesService,
    public ventana: MatDialog,
  ) {
    // SETEO DE ITEM DE PAGINACION CUANTOS ITEMS POR PAGINA, DESDE QUE PAGINA EMPIEZA, EL TOTAL DE ITEMS RESPECTIVAMENTE
    // RESUMEN CAJEROS
    this.configTTF = {
      id: "usuariosTTF",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.preguntas_respuestas.length,
    };
    // RESUMEN PREGUNTAS
    this.configR = {
      id: "usuariosR",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.servicioResumen.length,
    };
    for (let i = 0; i <= 24; i++) {
      this.horas.push(i);
    }
  }

  // EVENTOS PARA AVANZAR O RETROCEDER EN LA PAGINACION
  // RESUMEN CAJEROS
  pageChangedTTF(event: any) {
    //console.log('evento ', event)
    this.configTTF.currentPage = event;
  }

  // RESUMEN PREGUNTAS
  pageChangedR(event: any) {
    this.configR.currentPage = event;
  }
  // CAMBIA LA CANTIDAD DE ELEMENTOS POR PÁGINA Y REINICIA A LA PRIMERA PÁGINA
  changeItemsPerPageDE(itemsPerPage: number) {
    this.configR.itemsPerPage = itemsPerPage; // ACTUALIZA EL NUMERO DE ELEMENTOS POR PAGINA
    this.configR.currentPage = 1; // REINICIAR A LA PRIMERA PAGINA
  }


  ngOnInit(): void {
    // CARGAMOS COMPONENTES SELECTS HTML
    this.getMarca();
    this.getlastday();
    this.getSucursales();
    // CARGAMOS NOMBRE DE USUARIO LOGUEADO
    this.userDisplayName = sessionStorage.getItem("loggedUser");
    // SETEO DE BANDERAS CUANDO EL RESULTADO DE LA PETICION HTTP NO ES 200 OK
    this.malRequestTTFPag = true;
    this.malRequestRPag = true;
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
    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };
    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };
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

  // CONSULATA PARA LLENAR LA LISTA DE SURCURSALES.
  getSucursales() {
    this.serviceService.getAllSucursales().subscribe((empresas: any) => {
      this.sucursales = empresas.empresas;
    });
  }

  // CONSULTA DE LISTA DE CAJEROS
  getCajeros(sucursal: any) {
    this.serviceService.getCajerosEstado(sucursal, this.estadoCajero).subscribe(
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
        (sucursal) => sucursal.COD_SUC == cod
      ).NOM_SUC;
      nombreSucursal += `${nombre} `;
    });
    return nombreSucursal;
  }

  // OPCIONES DE SELECCION DE DATOS
  selectAll(opcion: string) {
    switch (opcion) {
      case "todasSucursales":
        this.todasSucursales = !this.todasSucursales;
        if (this.todasSucursales) {
          this.getCajeros(this.sucursalesSeleccionadas);
          this.getEncuestas(this.sucursalesSeleccionadas);
        } else {
          if (this.sucursalesSeleccionadas.length != 0) {
            this.getCajeros(this.sucursalesSeleccionadas);
            this.getEncuestas(this.sucursalesSeleccionadas);
          }
          // LIMPIAR FORMULARIO
          this.encuestaSeleccionada = [];
          this.usuariosSeleccionados = [];
          this.cajerosUsuarios = [];
          this.encuestas = [];
          this.preguntas = [];
          this.respuestas = [];
          this.mostrarCajeros = false;
          this.todosLosCajeros = false;
          this.todasEncuestas = false;
          this.mostrarEncuestas = false;
        }
        break;

      case 'sucursalesSeleccionadas':
        if (this.sucursalesSeleccionadas.length > 0) {
          this.getCajeros(this.sucursalesSeleccionadas);
          this.getEncuestas(this.sucursalesSeleccionadas);
        } else {
          // LIMPIAR FORMULARIO
          this.encuestaSeleccionada = [];
          this.usuariosSeleccionados = [];
          this.cajerosUsuarios = [];
          this.respuestas = [];
          this.encuestas = [];
          this.preguntas = [];
          this.mostrarCajeros = false;
          this.todosLosCajeros = false;
          this.todasEncuestas = false;
          this.mostrarEncuestas = false;
        }
        break;

      case 'todosCajeros':
        this.todosLosCajeros = !this.todosLosCajeros;
        if (!this.todosLosCajeros) {
          this.usuariosSeleccionados = [];
        }
        break;

      case 'cajerosSeleccionados':
        break;

      case "todasEncuestas":
        this.todasEncuestas = !this.todasEncuestas;
        if (!this.todasEncuestas) {
          this.encuestaSeleccionada = [];
          this.preguntas = [];
          this.respuestas = [];
        }
        break;

      case "encuestasSeleccionadas":
        if (this.encuestaSeleccionada.length != 0) {
        }
        else {
          this.preguntas = [];
          this.respuestas = [];
        }
        break;

      default:
        break;
    }
  }

  // METODO PARA SELECCIONAR ESTADO DE USUARIOS
  estadoCajero: number = 2;

  CambiarEstado(estado: number) {
    this.mostrar_resultado = false

    this.estadoCajero = estado;
    this.limpiar();
  }

  LimpiarFormularios() {
    this.mostrar_resultado = false;
    this.limpiar();
    this.estadoCajero = 2;
    const activo = document.getElementById('activo') as HTMLInputElement;
    activo.checked = true;
  }


  // METODO PARA LLAMAR CONSULTA DE DATOS
  limpiar() {
    this.todasSucursales = false;
    this.todosLosCajeros = false;
    this.todasEncuestas = false;
    this.sucursalesSeleccionadas = [];
    this.usuariosSeleccionados = [];
    this.selectedEncuestas = [];
    this.mostrarEncuestas = false;
    this.encuestas = [];
    this.encuestaSeleccionada = [];
    this.servicioResumen = [];
    this.servicioEncuesta = [];
    this.respuestasTotal = 0;
    this.cajerosUsuarios = [];
    this.mostrarCajeros = false;
    this.preguntas = [];
    this.respuestas = [];
    this.preguntas_respuestas = [];
    this.listaPreguntas = [];
  }

  // SE DESLOGUEA DE LA APLICACION
  salir() {
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  /** ********************************************************************************************************** **
   ** **                                    PREGUNTAS Y RESPUESTAS                                             ** **
   ** ********************************************************************************************************** **/

  // CONSULTA DE DATOS DE PREGUNTAS
  ObtenerPreguntas() {
    if (this.encuestaSeleccionada.length != 0) {
      this.serviceService.getAllPreguntas(this.encuestaSeleccionada).subscribe(
        (res: any) => {
          this.preguntas = res.preguntas;
          //console.log('preguntas ', this.preguntas)
          this.ObtenerRespuestas();
        },
        (error) => {
          if (error.status == 400) {
            this.preguntas = [];
            this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
              timeOut: 6000,
            });
          }
        }
      );
    }
    else {
      this.toastr.info("No ha seleccionado datos.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }

  respuestas: any = [];
  ObtenerRespuestas() {
    this.serviceService.getRespuestasEncuesta(this.sucursalesSeleccionadas).subscribe(
      (res: any) => {
        this.respuestas = res.respuestas;
        this.BuscarPreguntasRespuestas();
      },
      (error) => {
        if (error.status == 400) {
          this.respuestas = [];
          this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
            timeOut: 6000,
          });
        }
      }
    );
  }

  /** ******************************************************************************************** **
   ** **                    CONSULTA DE ENCUESTAS - PREGUNTAS Y RESPUESTAS                      ** **
   ** ******************************************************************************************** **/

  listaPreguntas: any = [];
  BuscarPreguntasRespuestas() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fechaDesde.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.fechaHasta.nativeElement.value
      .toString()
      .trim();

    let horaInicio = this.horaInicioE.nativeElement.value;
    let horaFin = this.horaFinE.nativeElement.value;

    if (this.encuestaSeleccionada.length != 0 &&
      this.usuariosSeleccionados.length != 0 &&
      this.encuestaSeleccionada.length != 0) {
      this.serviceService
        .getCodigosRespuestas(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.encuestaSeleccionada,
          this.sucursalesSeleccionadas.length === 0 ? '-1' : this.sucursalesSeleccionadas,
          this.usuariosSeleccionados.length === 0 ? '-2' : this.usuariosSeleccionados,
          this.estadoCajero
        )
        .subscribe(
          (servicio: any) => {
            this.mostrar_resultado = true;
            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
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

            // ASOCIAR APLICADAS (CAJEROS QUE RESPONDIERON LA ENCUESTA)
            procesar.forEach((encuesta: any) => {
              let auxiliar: any[] = [];
              respuesta.forEach((aplicadas: any) => {
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

              // ORDENAR PREGUNTAS POR CODIGO
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

            this.preguntas_respuestas = procesar.map(encuesta => {
              // ORDENAR LAS APLICACIONES DENTRO DE CADA ENCUESTA POR LA FECHA DE MAYOR A MENOR
              encuesta.aplicadas.sort((a: any, b: any) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                return fechaB.getTime() - fechaA.getTime(); // ORDENAR DE MAYOR A MENOR
              });
              return encuesta;
            });

            //console.log('datos ...', this.preguntas_respuestas);

            // LISTA DE PREGUNTAS DE LAS ENCUESTAS
            let preguntasUnicas: any[] = [];
            listaEncuestas.forEach((encuesta: any) => {
              let preguntasEncuesta = new Set(); // PARA EVITAR PREGUNTAS DUPLICADAS EN CADA ENCUESTA
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
                encuesta: encuesta.encuesta,
                COD_EN: encuesta.COD_EN,
                sucursal: encuesta.sucursal,
                preguntas: preguntasFiltradas
              });
            });

            this.listaPreguntas = preguntasUnicas;

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
              this.preguntas_respuestas = [];
              this.malRequestTTF = true;
              this.malRequestTTFPag = true;

              // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
              // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
              if (this.preguntas_respuestas.length === 0) {
                this.configTTF.totalItems = 0;
              } else {
                this.configTTF.totalItems =
                  this.preguntas_respuestas.length;
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
    else {
      this.toastr.info("No ha seleccionado datos.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }


  // GENERAR ARCHIVO DE EXCEL
  ExportExcelEncuestas() {
    if (this.preguntas_respuestas.length != 0) {

      let workbook = new ExcelJS.Workbook();
      let imagen = workbook.addImage({
        base64: this.urlImagen,
        extension: 'png',
      });

      let contador: number = 1;
      // ITERAR SOBRE LAS ENCUESTAS PARA CREAR UNA HOJA POR CADA UNA
      this.preguntas_respuestas.forEach((encuesta: any) => {
        // CREAR HOJA POR CADA ENCUESTA
        const sheet = workbook.addWorksheet('ENCUESTA ' + contador++);

        // AGREGAR LA IMAGEN EN CADA HOJA
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
        var fechaDesde = this.fechaDesde.nativeElement.value
          .toString()
          .trim();
        var fechaHasta = this.fechaHasta.nativeElement.value
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

        // ESTABLECER LAS CABECERAS DE LA TABLA (SUCURSAL, CAJERO, FECHA Y PREGUNTAS)
        const header = ['SUCURSAL', 'CAJERO', 'FECHA', ...encuesta.aplicadas[0]?.preguntas.map((pregunta: any) => pregunta.identificador)];
        sheet.addRow(header);

        // AGREGAR COMENTARIOS A LAS CABECERAS EN LA FILA 6 CON EL VALOR DE LA PREGUNTA
        header.forEach((headerItem, index) => {
          const rowNumber = 6;  // CAMBIAR A FILA 6
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
    else {
      this.toastr.info("No ha seleccionado datos.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }

  // FUNCION PARA CREAR EL PDF
  async generarPdfPreguntasRespuestas(action = "open", pdf: number) {
    if (this.preguntas_respuestas.length != 0) {
      // RANGO DE FECHAS DE LA CONSULTA PARA IMPRESION EN PDF
      var fechaDesde = this.fechaDesde.nativeElement.value.toString().trim();
      var fechaHasta = this.fechaHasta.nativeElement.value.toString().trim();
      const pdfMake = await this.validar.ImportarPDF();
      let documentDefinition: any;
      if (pdf === 1) {
        documentDefinition = this.DocumentarPreguntasRespuestas(fechaDesde, fechaHasta);
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
    else {
      this.toastr.info("No ha seleccionado datos.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }

  // FUNCION DELEGADA PARA LA ESTRUCTURA DEL DOCUMENTO PDF
  DocumentarPreguntasRespuestas(fechaDesde: any, fechaHasta: any) {
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();
    let nombreSucursal = this.ObtenerNombreSucursal(this.sucursalesSeleccionadas);
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
        { text: nombreSucursal?.toUpperCase(), bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        { text: `PERIODO DEL ${fechaDesde} HASTA ${fechaHasta}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        this.EstructurarDatosPDF(this.preguntas_respuestas),
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

        // SECCION DE PREGUNTAS Y RESPUESTAS
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
    this.MAX_PAGS = 5;
    this.configR.itemsPerPage = this.MAX_PAGS; 
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fromDateResumen.nativeElement.value.toString().trim();
    var fechaHasta = this.toDateResumen.nativeElement.value.toString().trim();

    let horaInicio = this.horaInicioR.nativeElement.value;
    let horaFin = this.horaFinR.nativeElement.value;

    var datoCajero: any = '0N';
    //console.log("ver cajeros seleccionados: ", this.usuariosSeleccionados)
    if (this.usuariosSeleccionados.length != 0) {
      datoCajero = this.usuariosSeleccionados;
    }

    //console.log("ver datoCajero: ", datoCajero)
    if (this.selectedEncuestas.length !== 0) {
      this.serviceService
        .getEncuestasCajero(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin,
          this.sucursalesSeleccionadas.length === 0 ? '-1' : this.sucursalesSeleccionadas,
          this.selectedEncuestas,
          datoCajero,
          this.verFecha,
          this.estadoCajero
        )
        .subscribe(
          (servicio: any) => {
            this.mostrar_resultado = true;

            // SI SE CONSULTA CORRECTAMENTE SE GUARDA EN VARIABLE Y SETEA BANDERAS DE TABLAS
            this.servicioResumen = servicio.resumen;
            //console.log('resumen ', this.servicioResumen)
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
    } else {
      this.toastr.info("Debe seleccionar Encuestas.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }

  async ExportTOExcelPreguntasResumen() {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Resumen Encuestas");
    this.imagen = workbook.addImage({
      base64: this.urlImagen,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    let nombreSucursal = this.ObtenerNombreSucursal(this.sucursalesSeleccionadas);
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:H1");
    worksheet.mergeCells("B2:H2");
    worksheet.mergeCells("B3:H3");
    worksheet.mergeCells("B4:H4");
    worksheet.mergeCells("B5:H5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = 'REPORTE - ENCUESTAS REALIZADAS'.toUpperCase();
    worksheet.getCell("B2").value = nombreSucursal.toUpperCase();

    var fechaDesde = this.fromDateResumen.nativeElement.value.toString().trim();
    var fechaHasta = this.toDateResumen.nativeElement.value.toString().trim();
    worksheet.getCell("B3").value = "Periodo de " + fechaDesde + " hasta " + fechaHasta;
    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2", "B3"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });

    let incluirCajero = this.usuariosSeleccionados.length != 0
    //console.log("ver incluirCajero ", incluirCajero)
    // MAPEO DE INFORMACIÓN DE CONSULTA A FORMATO JSON PARA EXPORTAR A EXCEL
    let jsonServicio: any = [];


    let resultados: any = [];
    resultados = this.servicioResumen;

    if (resultados.length != 0) {
      let columnas: any = []

      if (this.verFecha == '1') {
        for (let i = 0; i < resultados.length; i++) {
          let fila = [
            resultados[i].nombre_sucursal,
            resultados[i].nombre_usuario,
            resultados[i].Fecha,
            resultados[i].encuestas_realizadas,
          ]

          if (incluirCajero) {
            fila.splice(1, 0, resultados[i].nombre_encuesta); // Insertar "CAJERO" en la segunda posición
          }
          jsonServicio.push(fila);

        }


        if (incluirCajero) {
          worksheet.columns = [
            { key: "sucursal", width: 50 },
            { key: "encuesta", width: 50 },
            { key: "usuario", width: 50 },
            { key: "fecha", width: 50 },
            { key: "total", width: 50 },
          ]
        } else {
          worksheet.columns = [
            { key: "sucursal", width: 50 },
            { key: "encuesta", width: 20 },
            { key: "fecha", width: 50 },
            { key: "total", width: 50 },
          ]
        }

        columnas = [
          { name: "SUCURSAL", totalsRowLabel: "Total:", filterButton: false },
          { name: "ENCUESTA", totalsRowLabel: "", filterButton: true },
          { name: "FECHA", totalsRowLabel: "", filterButton: true },
          { name: "ENCUESTAS REALIZADAS", totalsRowLabel: "", filterButton: true },
        ]

        if (incluirCajero) {
          columnas.splice(1, 0, { name: "CAJERO", totalsRowLabel: "Total:", filterButton: true }); // Insertar "CAJERO" en la segunda posición
        }

      } else {
        for (let i = 0; i < resultados.length; i++) {
          let fila = [
            resultados[i].nombre_sucursal,
            resultados[i].nombre_usuario,
            resultados[i].encuestas_realizadas,
          ]

          if (incluirCajero) {
            fila.splice(1, 0, resultados[i].nombre_encuesta); // Insertar "CAJERO" en la segunda posición
          }
          jsonServicio.push(fila);

        }


        if (incluirCajero) {
          worksheet.columns = [
            { key: "sucursal", width: 50 },
            { key: "encuesta", width: 20 },
            { key: "usuario", width: 50 },
            { key: "total", width: 50 },
          ]
        } else {
          worksheet.columns = [
            { key: "sucursal", width: 50 },
            { key: "encuesta", width: 20 },
            { key: "total", width: 50 },
          ]
        }

        columnas = [
          { name: "SUCURSAL", totalsRowLabel: "Total:", filterButton: false },
          { name: "ENCUESTA", totalsRowLabel: "", filterButton: true },
          { name: "ENCUESTAS REALIZADAS", totalsRowLabel: "", filterButton: true },
        ]

        if (incluirCajero) {
          columnas.splice(1, 0, { name: "CAJERO", totalsRowLabel: "Total:", filterButton: true }); // Insertar "CAJERO" en la segunda posición
        }

      }

      worksheet.addTable({
        name: "turnostotales",
        ref: "A6",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleMedium16",
          showRowStripes: true,
        },
        columns: columnas,
        rows: jsonServicio,
      });


      const numeroFilas = jsonServicio.length;
      let tamanioC = 0;
      for (let i = 0; i <= numeroFilas; i++) {
        if (this.verFecha == '1') {
          incluirCajero ? tamanioC = 5 : tamanioC = 4
        } else {
          incluirCajero ? tamanioC = 4 : tamanioC = 3
        }
        for (let j = 1; j <= tamanioC; j++) {
          const cell = worksheet.getRow(i + 6).getCell(j);
          if (i === 0) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            cell.alignment = {
              vertical: "middle",
              horizontal: this.obtenerAlineacionHorizontal(j),
            };
          }
          cell.border = this.bordeCompleto;
        }
      }
      worksheet.getRow(6).font = this.fontTitulo;

      try {
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, "Resumen Encuestas Usuarios" + new Date().toLocaleString() + EXCEL_EXTENSION);
      } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
      }
    }
  }

  private obtenerAlineacionHorizontal(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
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

  // FUNCION DELEGADA PARA SETEO DE INFORMACION
  getDocumentResumen(fechaDesde: any, fechaHasta: any, opcion: any) {
    // SE OBTIENE LA FECHA ACTUAL
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();
    let nombreSucursal = this.ObtenerNombreSucursal(this.sucursalesSeleccionadas);
    return {
      // SETEO DE MARCA DE AGUA Y ENCABEZADO CON NOMBRE DE USUARIO LOGUEADO
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 40],
      watermark: { text: this.marca, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.userDisplayName, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // SETEO DE PIE DE PAGINA, FECHA DE GENERACION DE PDF CON NUMERO DE PAGINAS
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
      // CONTENIDO DEL PDF, LOGO, NOMBRE DEL REPORTE, CON EL RENAGO DE FECHAS DE LOS DATOS
      content: [
        { image: this.urlImagen, width: 100, margin: [10, -25, 0, 5] },
        { text: `LISTA DE ENCUESTAS APLICADAS`, bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: nombreSucursal?.toUpperCase(), bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        { text: `PERIODO DEL ${fechaDesde} HASTA ${fechaHasta}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        this.CampoDetalleResumen(opcion),
        {
          style: "subtitulos",
          text: "TOTAL DE ENCUESTAS REALIZADAS: " + this.respuestasTotal,
        }, //Definicion de funcion delegada para setear informacion de tabla del PDF
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        principal: { fontSize: 8, bold: true, alignment: 'center', fillColor: "#aafdc3" },
        itemsTable: { fontSize: 8 },
        tableMargin: { margin: [0, 0, 0, 0] },
        subtitulos: { fontSize: 10, bold: true, alignment: "center", margin: [0, 5, 0, 10], },
      },
    };
  }

  //Funcion para llenar la tabla con la consulta realizada al backend
  CampoDetalleResumen(opcion: any) {
    let incluirCajero = this.usuariosSeleccionados.length != 0

    let servicio: any = [];
    if (opcion === 1) {
      servicio = this.servicioEncuesta;
    }
    else {
      servicio = this.servicioResumen;
    }
    if (servicio.length != 0) {
      if (this.verFecha == '1') {
        if (incluirCajero) {
          return {
            columns: [
              { width: '*', text: '' },
              {
                width: 'auto',
                style: "tableMargin",
                table: {
                  headerRows: 1,
                  widths: ["auto", "*", "auto", "auto", "auto"],
                  body: [
                    [
                      { text: "Sucursal", style: "tableHeader" },
                      { text: "Encuesta", style: "tableHeader" },
                      { text: "Cajero", style: "tableHeader" },
                      { text: "Fecha", style: "tableHeader" },
                      { text: "Encuestas realizadas", style: "tableHeader" },
                    ],
                    ...servicio.map((res: any) => {
                      return [
                        { style: "itemsTable", text: res.nombre_sucursal },
                        { style: "itemsTable", text: res.nombre_encuesta },
                        { style: "itemsTable", text: res.nombre_usuario },
                        { style: "itemsTable", text: res.Fecha },
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

        } else {
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
                      { text: "Fecha", style: "tableHeader" },
                      { text: "Encuestas realizadas", style: "tableHeader" },
                    ],
                    ...servicio.map((res: any) => {
                      return [
                        { style: "itemsTable", text: res.nombre_sucursal },
                        { style: "itemsTable", text: res.nombre_encuesta },
                        { style: "itemsTable", text: res.Fecha },
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
      } else {
        if (incluirCajero) {
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

        } else {
          return {
            columns: [
              { width: '*', text: '' },
              {
                width: 'auto',
                style: "tableMargin",
                table: {
                  headerRows: 1,
                  widths: ["auto", "*", "auto"],
                  body: [
                    [
                      { text: "Sucursal", style: "tableHeader" },
                      { text: "Encuesta", style: "tableHeader" },
                      { text: "Encuestas realizadas", style: "tableHeader" },
                    ],
                    ...servicio.map((res: any) => {
                      return [
                        { style: "itemsTable", text: res.nombre_sucursal },
                        { style: "itemsTable", text: res.nombre_encuesta },
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
  }

  verFecha: string = '1';
  mostrar_resultado = false;
  CambiarFecha(opcion: string) {
    this.verFecha = opcion;
    this.mostrar_resultado = false
  }

  // ABRIR VENTANA PARA VER PREGUNTA
  AbrirVentana(pregunta: any): void {
    this.ventana.open(InformacionComponent, {
      width: '400px',
      data: { informacion: pregunta }
    });
  }


}
