import { Component, OnInit } from "@angular/core";
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";

import { AuthenticationService } from "../../services/authentication.service";
import { ValidacionesService } from "src/app/services/validaciones/validaciones.service";
import { ServiceService } from "../../services/service.service";

@Component({
  standalone: false,
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.scss"],
})

export class UsuariosComponent implements OnInit {

  mostrar_resultado = false;

  // SERVICIOS-VARIABLES DONDE SE ALMACENARAN LAS CONSULTAS A LA BD
  sucursales: any[];
  cajerosSucursales: any = [];

  // BANDERAS PARA MOSTRAR LA TABLA CORRESPONDIENTE A LAS CONSULTAS
  todasSucursalesC: boolean = false;

  // BANDERAS PARA QUE NO SE QUEDE EN PANTALLA CONSULTAS ANTERIORES
  malRequestC: boolean = false;

  // USUARIO QUE INGRESO AL SISTEMA
  userDisplayName: any;

  // CONTROL PAGINACION
  configC: any;

  // MAXIMO DE ITEMS MOSTRADO DE TABLA EN PANTALLA
  private MAX_PAGS = 5;
  itemsPerPageOptions = [5, 10, 15, 20, 50];

  // PALABRAS DE COMPONENTE DE PAGINACION
  public labels: any = {
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
  };



  //OPCIONES MULTIPLES
  sucursalesSeleccionadas: string[] = [];
  seleccionMultiple: boolean = false;

  constructor(
    private serviceService: ServiceService,
    private toastr: ToastrService,
    private router: Router,
    private auth: AuthenticationService,
    public datePipe: DatePipe,
    public validar: ValidacionesService
  ) {

    // RESUMEN CAJEROS
    this.configC = {
      id: "usuariosR",
      itemsPerPage: this.MAX_PAGS,
      currentPage: 1,
      totalItems: this.cajerosSucursales.length,
    };
  }

  // RESUMEN CAJEROS
  pageChangedC(event: any) {
    //console.log('evento ', event)
    this.configC.currentPage = event;
  }
  // CAMBIA LA CANTIDAD DE ELEMENTOS POR PÁGINA Y REINICIA A LA PRIMERA PÁGINA
  changeItemsPerPageDE(itemsPerPage: number) {
    this.configC.itemsPerPage = itemsPerPage; // ACTUALIZA EL NUMERO DE ELEMENTOS POR PAGINA
    this.configC.currentPage = 1; // REINICIAR A LA PRIMERA PAGINA
  }


  ngOnInit(): void {
    this.getSucursales();
    this.userDisplayName = sessionStorage.getItem("loggedUser");
    this.malRequestC = true;
  }


  estadoUsuario: number = 2;

  CambiarEstado(estado: number) {
    this.mostrar_resultado = false
    this.estadoUsuario = estado;
    this.limpiar();
  }

  // OPCIONES DE SELECCION DE DATOS
  selectAll(opcion: string) {
    switch (opcion) {

      case "todasSucursales":
        this.todasSucursalesC = !this.todasSucursalesC;
        break;
      case "sucursalesSeleccionadasE":
        this.seleccionMultiple = this.sucursalesSeleccionadas.length > 1;
        break;
      default:
        break;
    }
  }

  /*
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
     */

  // CONSULATA PARA LLENAR LA LISTA DE SURCURSALES.
  getSucursales() {
    this.serviceService.getAllSucursales().subscribe((empresas: any) => {
      this.sucursales = empresas.empresas;
      //console.log("ver sucursales: ", this.sucursales)
    });
  }

  onSelectionChangeSucursal() {
    this.mostrar_resultado = false;
    if (!this.sucursalesSeleccionadas || this.sucursalesSeleccionadas.length === 0) {
      this.selectAll('sucursalesSeleccionadas');
    }
  }

  // METODO PARA LLAMAR CONSULTA DE DATOS
  limpiar() {
  }

  // SE DESLOGUEA DE LA APLICACION
  salir() {
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  buscarCajeros() {
    this.MAX_PAGS = 5;
    this.configC.itemsPerPage = this.MAX_PAGS;
    this.serviceService.getCajerosEstado(this.sucursalesSeleccionadas, this.estadoUsuario).subscribe(
      (cajeros: any) => {
        //console.log("ver resultados: ", cajeros)
        this.cajerosSucursales = cajeros.cajeros;

        this.malRequestC = false;
        // this.malRequestDistPag = false;
        // SETEO DE PAGINACION CUANDO SE HACE UNA NUEVA BUSQUEDA
        if (this.configC.currentPage > 1) {
          this.configC.currentPage = 1;
        }
        this.mostrar_resultado = true;
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.plan_multiple_ = false;
        this.cajerosEditar = [];
        this.selectionCajero.clear();
      },
      (error) => {
        if (error.status == 400) {
          this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
            timeOut: 6000,
          });
        }
      }
    );
  }


  selectionCajero = new SelectionModel<any>(true, []);

  cajerosEditar: any = [];

  isAllSelectedPag() {
    const numSelected = this.selectionCajero.selected.length;
    return numSelected === this.cajerosSucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionCajero.clear() :
      this.cajerosSucursales.forEach((row: any) => this.selectionCajero.select(row));
    //console.log("ver selectionCajero", this.selectionCajero)
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.cajerosEditar = this.selectionCajero.selected;

    ////console.log("ver cajerosEditar ", this.cajerosEditar)
    return `${this.selectionCajero.isSelected(row) ? 'deselect' : 'select'} row ${row.caje_nombre + 1}`;
  }


  // METODOS PARA LA SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;


  DesactivarCajeros() {

    const cajeCodigos = this.cajerosEditar.map(item => item.COD_US).join(',');
    //console.log("ver cajeCodigos", cajeCodigos)

    this.serviceService.actualizarEstadoCajerosSucursalEstado(cajeCodigos).subscribe(
      (cajeros: any) => {
        //console.log("ver resultados: ", cajeros)
        this.cajerosSucursales = cajeros.cajeros;
        this.mostrar_resultado = false;
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.plan_multiple_ = false;
        this.cajerosEditar = [];
        this.selectionCajero.clear();
      },
      (error) => {
        if (error.status == 400) {
          this.toastr.info("No se han encontrado registros.", "Upss !!!.", {
            timeOut: 6000,
          });
        }
      }
    );

  }
}
