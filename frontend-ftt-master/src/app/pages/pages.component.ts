import { Component, OnInit} from '@angular/core';

declare function customInitFunctions();

@Component({
  standalone: false,
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: [
  ]
})
export class PagesComponent implements OnInit {
  mostrarMenu: any = true;

  constructor() { }

  ngOnInit(): void {
    customInitFunctions();
  }

  w3_close() {
    if (screen.width < 1024) {
      const menuLateral = document.getElementById("menu-lateral");
      if (menuLateral) {
        menuLateral.style.display = "block";
      }
      //document.getElementById("menu-lateral").style.display = "block";
    } else {
      if (screen.width < 1280) {
        const menuLateral = document.getElementById("menu-lateral");
        if (menuLateral) {
          menuLateral.style.display = "block";
        }
        //document.getElementById("menu-lateral").style.display = "block";
      } else {
        const menuLateral = document.getElementById("menu-lateral");
        if (menuLateral) {
          menuLateral.style.display = "block";
        }
      }
    }
  }

}
