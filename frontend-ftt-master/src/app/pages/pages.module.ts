import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { MenuComponent } from './menu/menu.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


import { NgxPaginationModule } from 'ngx-pagination';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

@NgModule({
  declarations: [
    MenuComponent,
    UsuariosComponent,
    PagesComponent,
    ConfiguracionComponent,
  ],
  exports: [
    MenuComponent,
    UsuariosComponent,
    PagesComponent,
    ConfiguracionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ]
})
export class PagesModule { }
