import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ImagenesService } from "../../shared/imagenes.service";
import { AuthenticationService } from '../../services/authentication.service';
import { ToastrService } from "ngx-toastr";
import { Router } from '@angular/router';
import { Utils } from "../../utils/util";

declare function customSidebar();


@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  isMenuOpen = true;
  mostrarLogo = false;
  urlImagen: string;
  nombreImagen: any[];

  @Output() menuMostrarOcultar: EventEmitter<any> = new EventEmitter();


  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private imagenesService: ImagenesService,
  ) { }

  ngOnInit(): void {
    customSidebar();
    this.imagenesService.cargarImagen().then((result: any) => {
      this.urlImagen = result;
      this.mostrarLogo = true;
    }).catch((error) => {
      // SE INFORMA QUE NO SE PUDO CARGAR LA IMAGEN
      this.toastr.info("Error al cargar el logo, se utilizará la imagen por defecto", "Upss !!!.", {
        timeOut: 6000,
      });
      Utils.getImageDataUrlFromLocalPath1("assets/images/logo.png").then(
        (result) => (this.urlImagen = result, this.mostrarLogo = true)
      );
    });
  }

  salir() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  mostrarMenu() {
    this.menuMostrarOcultar.emit(true);
  }

  ocultarMenu() {
    this.menuMostrarOcultar.emit(false);
  }

  w3_open() {
    const menu_lateral = document.getElementById("menu-lateral");
    if(menu_lateral){
      menu_lateral.style.display = "block";
    }
    //document.getElementById("menu-lateral").style.display = "block";
  }

  w3_close() {
    const mySidebar = document.getElementById("mySidebar");
    if(mySidebar){
      mySidebar.style.display = "none";
    }
    //document.getElementById("mySidebar").style.display = "none";
  }

}
