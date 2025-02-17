import { Component, ViewChild, ElementRef, EventEmitter, Output } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { Utils } from "../../utils/util";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { AuthenticationService } from "../../services/authentication.service";
import { ImagenesService } from "../../shared/imagenes.service";
import { ServiceService } from "../../services/service.service";

// COMPLEMENTOS PARA PDF Y EXCEL
import moment from "moment";
import { ValidacionesService } from "src/app/services/validaciones/validaciones.service";

@Component({
  standalone: false,
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.scss']
})

export class PreguntasComponent {
  // SETEO DE FECHAS PRIMER DIA DEL MES ACTUAL Y DIA ACTUAL
  fromDate: any;
  toDate: any;
  date: any;

  // CAPTURA DE ELEMENTOS DE LA INTERFAZ VISUAL PARA TRATARLOS Y CAPTURAR DATOS
  @ViewChild("fechaDesde") fechaDesde: ElementRef;
  @ViewChild("fechaHasta") fechaHasta: ElementRef;
  @ViewChild("horaInicio") horaInicio: ElementRef;
  @ViewChild("horaFin") horaFin: ElementRef;


  // SERVICIOS-VARIABLES DONDE SE ALMACENARAN LAS CONSULTAS A LA BD
  sucursales: any[];
  cajerosUsuarios: any = [];
  entradas_salidas: any = [];

  // BANDERAS PARA MOSTRAR LA TABLA CORRESPONDIENTE A LAS CONSULTAS
  todasSucursales: boolean = false;
  todosLosCajeros: boolean = false;

  // BANDERAS PARA QUE NO SE QUEDE EN PANTALLA CONSULTAS ANTERIORES
  malRequestTF: boolean = false;
  malRequestTFPag: boolean = false;

  // USUARIO QUE INGRESO AL SISTEMA
  userDisplayName: any;

  // CONTROL PAGINACION
  configTF: any;
  private MAX_PAGS = 10;

  // PALABRAS DE COMPONENTE DE PAGINACION
  public labels: any = {
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
  };

  // IMAGEN LOGO
  p_color: any = '#0077b6';
  urlImagen: string;
  nombreImagen: any[];
  private imagen: any;

  //OPCIONES MULTIPLES
  selectedItems: string[] = [];
  sucursalesSeleccionadas: string[] = [];

  // MOSTRAR CAJEROS
  mostrarCajeros: boolean = false;

  // VARIABLES DE INFORMACION
  marca: string = "";
  horas: number[] = [];

  @Output() menuMostrarOcultar: EventEmitter<any> = new EventEmitter();

  constructor(
    private imagenesService: ImagenesService,
    private serviceService: ServiceService,
    private toastr: ToastrService,
    private router: Router,
    private auth: AuthenticationService,
    public datePipe: DatePipe,
    public validar: ValidacionesService
  ) {
    // SETEO DE ITEM DE PAGINACION CUANTOS ITEMS POR PAGINA, DESDE QUE PAGINA EMPIEZA, EL TOTAL DE ITEMS RESPECTIVAMENTE
    // ENTRADAS AL SISTEMA
    this.configTF = {
      id: "usuariosTF",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.entradas_salidas.length,
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

  ngOnInit(): void {
    var f = moment();
    this.date = f.format("YYYY-MM-DD");

    // CARGAMOS COMPONENTES SELECTS HTML
    this.getMarca();
    this.getlastday();
    this.getSucursales();

    // CARGAMOS NOMBRE DE USUARIO LOGUEADO
    this.userDisplayName = sessionStorage.getItem("loggedUser");

    // SETEO DE BANDERAS CUANDO EL RESULTADO DE LA PETICION HTTP NO ES 200 OK
    this.malRequestTFPag = true;

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
      case "todasSucursales":
        this.todasSucursales = !this.todasSucursales;
        if (this.todasSucursales) {
          this.getCajeros(this.sucursalesSeleccionadas);
        } else {
          if (this.sucursalesSeleccionadas.length != 0) {
            this.getCajeros(this.sucursalesSeleccionadas);
          }
        }
        // LIMPIAR FORMULARIO
        this.entradas_salidas = [];
        this.cajerosUsuarios = [];
        this.selectedItems = [];
        this.mostrarCajeros = false;
        this.todosLosCajeros = false;
        break;

      case "sucursalesSeleccionadas":
        if (this.sucursalesSeleccionadas.length > 0) {
          this.getCajeros(this.sucursalesSeleccionadas);
        } else {
          // LIMPIAR FORMULARIO
          this.entradas_salidas = [];
          this.cajerosUsuarios = [];
          this.selectedItems = [];
          this.mostrarCajeros = false;
          this.todosLosCajeros = false;
        }
        break;

      case "todosCajeros":
        this.todosLosCajeros = !this.todosLosCajeros;
        if (!this.todosLosCajeros) {
          this.entradas_salidas = [];
          this.selectedItems = [];
        }
        break;

      case "cajerosSeleccionados":
        this.entradas_salidas = [];
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

  // METODO PARA SELCCIONAR ESTADO DE USUARIOS
  estadoCajero: number = 2;
  CambiarEstado(estado: number) {
    this.estadoCajero = estado;
    this.limpiar();
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
    this.todasSucursales = false;
    this.todosLosCajeros = false;
    this.mostrarCajeros = false;
    this.sucursalesSeleccionadas = [];
    this.cajerosUsuarios = [];
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

  BuscarEntradas() {
    // CAPTURA DE FECHAS PARA PROCEDER CON LA BUSQUEDA
    var fechaDesde = this.fechaDesde.nativeElement.value
      .toString()
      .trim();
    var fechaHasta = this.fechaHasta.nativeElement.value
      .toString()
      .trim();

    let horaInicio = this.horaInicio.nativeElement.value;
    let horaFin = this.horaFin.nativeElement.value;

    if (this.sucursalesSeleccionadas.length != 0 && this.selectedItems.length != 0) {
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
            this.entradas_salidas = servicio.turnos;
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
              this.entradas_salidas = null;
              this.malRequestTF = true;
              this.malRequestTFPag = true;

              // COMPROBACION DE QUE SI VARIABLE ESTA VACIA PUES SE SETEA LA PAGINACION CON 0 ITEMS
              // CASO CONTRARIO SE SETEA LA CANTIDAD DE ELEMENTOS
              if (this.entradas_salidas == null) {
                this.configTF.totalItems = 0;
              } else {
                this.configTF.totalItems = this.entradas_salidas.length;
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
    else {
      // NO SE HA SELECCIONADO DATOS
      this.toastr.info("Seleccione los datos de búsqueda.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
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

  GenerarExcelEntradas() {
    if (this.entradas_salidas.length != 0) {
      let workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet("Entradas Sistema");
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
      worksheet.mergeCells("B1:E1");
      worksheet.mergeCells("B2:E2");
      worksheet.mergeCells("B3:E3");
      worksheet.mergeCells("B4:E4");
      worksheet.mergeCells("B5:E5");

      // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
      worksheet.getCell("B1").value = 'ENTRADAS AL SISTEMA'.toUpperCase();
      worksheet.getCell("B2").value = nombreSucursal.toUpperCase();
      var fechaDesde = this.fechaDesde.nativeElement.value
        .toString()
        .trim();
      var fechaHasta = this.fechaHasta.nativeElement.value
        .toString()
        .trim();
      worksheet.getCell("B3").value = "PERIODO DE " + fechaDesde + " HASTA " + fechaHasta;
      // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
      ["B1", "B2", "B3"].forEach((cell) => {
        worksheet.getCell(cell).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        worksheet.getCell(cell).font = { bold: true, size: 14 };
      });

      // DEFINIR ENCABEZADOS DINAMICAMENTE
      let headers = ["No."];
      headers.push("SUCURSAL", "CAJERO", "FECHA", "HORA");

      // AGREGAR ENCABEZADOS A LA HOJA
      let headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };

      // APLICAR BORDES A LOS ENCABEZADOS
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // AGREGAR DATOS DINAMICOS
      this.entradas_salidas.forEach((res: any, index: number) => {
        let row = [index + 1];
        row.push(res.NOM_SUC, res.Usuario, res.fecha_, res.hora_);
        // AGREGAR LA FILA A LA HOJA
        let newRow = worksheet.addRow(row);
        // APLICAR BORDES A CADA CELDA DE LA FILA
        newRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
        // APLICAR ESTILO CEBRA (ALTERNANDO FONDO)
        if (index % 2 === 0) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F2F2F2" }, // COLOR GRIS CLARO PARA FILAS IMPARES
            };
          });
        } else {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFF" }, // COLOR BLANCO PARA FILAS PARES
            };
          });
        }
      });

      // AJUSTAR EL ANCHO DE LAS COLUMNAS AUTOMATICAMENTE
      worksheet.columns.forEach(column => {
        column.width = 30;
      });

      // ESTILOS DE ENCABEZADO
      worksheet.getRow(6).eachCell((cell, colNumber) => {
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
        worksheet.autoFilter = {
          from: { row: 6, column: 1 },  // INICIO DEL FILTRO (FILA 6, COLUMNA 1)
          to: { row: 6, column: worksheet.columnCount } // FIN DEL FILTRO (ÚLTIMA COLUMNA)
        };
      });


      // GENERAR ARCHIVO EXCEL Y DESCARGARLO
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "EntradasSistema.xlsx");
      });

    }
    else {
      // NO SE HA SELECCIONADO DATOS
      this.toastr.info("Seleccione los datos de búsqueda.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }

  // GENERACION DE PDF'S 
  async generarPdfEntradasSistema(action = "open", pdf: number) {
    if (this.entradas_salidas.length != 0) {
      // SETEO DE RANGO DE FECHAS DE LA CONSULTA PARA IMPRESION EN PDF
      var fechaDesde = this.fechaDesde.nativeElement.value
        .toString()
        .trim();
      var fechaHasta = this.fechaHasta.nativeElement.value
        .toString()
        .trim();

      let horaInicio = this.horaInicio.nativeElement.value;
      let horaFin = this.horaFin.nativeElement.value;

      const pdfMake = await this.validar.ImportarPDF();

      let documentDefinition: any;
      if (pdf === 1) {
        documentDefinition = this.getDocumentturnosfecha(
          fechaDesde,
          fechaHasta,
          horaInicio,
          horaFin
        );
      }

      // OPCIONES DE PDF DE LAS CUALES SE USARA LA DE OPEN, LA CUAL ABRE EN NUEVA PESTAÑA EL PDF CREADO
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
      // NO SE HA SELECCIONADO DATOS
      this.toastr.info("Seleccione los datos de búsqueda.", "Upss !!!.", {
        timeOut: 6000,
      });
    }
  }

  // FUNCION DELEGADA PARA SETEO DE INFORMACION
  getDocumentturnosfecha(fechaDesde, fechaHasta, horaInicio, horaFin) {
    // SE OBTIENE LA FECHA ACTUAL
    let f = new Date();
    f.setUTCHours(f.getHours());
    this.date = f.toJSON();
    let nombreSucursal = this.ObtenerNombreSucursal(this.sucursalesSeleccionadas);
    return {
      pageSize: 'A4',
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
        { text: `ENTRADAS Y SALIDAS DEL SISTEMA`, bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: nombreSucursal?.toUpperCase(), bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        { text: `PERIODO DEL ${fechaDesde} HASTA ${fechaHasta}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5], },
        this.TratamientoInformacionEntradas(this.entradas_salidas),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center' },
      }
    };
  }

  // FUNCION PARA LLENAR LA TABLA CON LA CONSULTA REALIZADA AL BACKEND
  TratamientoInformacionEntradas(servicio: any[]) {
    return {
      style: "tableMargin",
      table: {
        headerRows: 1,
        widths: ["*", "*", "*", "*"],

        body: [
          [
            { text: "Sucursal", style: "tableHeader" },
            { text: "Cajero", style: "tableHeader" },
            { text: "Fecha", style: "tableHeader" },
            { text: "Hora", style: "tableHeader" },
          ],
          ...servicio.map((res) => {
            return [
              { style: "itemsTable", text: res.NOM_SUC },
              { style: "itemsTable", text: res.Usuario },
              { style: "itemsTable", text: res.fecha_ },
              { style: "itemsTable", text: res.hora_ },
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
