import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';


import { NgxPaginationModule } from 'ngx-pagination';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { EncuestasComponent } from './encuestas/encuestas.component';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { InformacionComponent } from './informacion/informacion.component';

@NgModule({
  declarations: [
    UsuariosComponent,
    PagesComponent,
    ConfiguracionComponent,
    EncuestasComponent,
    PreguntasComponent,
    InformacionComponent
  ],
  exports: [

    UsuariosComponent,
    PagesComponent,
    ConfiguracionComponent,
    EncuestasComponent,
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
    MatIconModule,
    MatExpansionModule
  ]
  ,
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PagesModule { }
