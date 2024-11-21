import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { NgModule } from '@angular/core';

import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PagesComponent } from './pages.component';
import { EncuestasComponent } from './encuestas/encuestas.component';


const routes: Routes = [

  {
    path: 'usuarios',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: UsuariosComponent, canActivate: [AuthGuard] },
      { path: 'encuestas', component: EncuestasComponent, canActivate: [AuthGuard] },
      { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard] },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PagesRoutingModule { }
