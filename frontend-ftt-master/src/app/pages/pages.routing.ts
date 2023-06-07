import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { MenuComponent } from './menu/menu.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AuthGuard } from '../guards/auth.guard';
import { ConfiguracionComponent } from './configuracion/configuracion.component';


const routes: Routes = [

  {
    path:'usuarios',
  component:PagesComponent,
  canActivate: [ AuthGuard ],
  children: [
    {path:'', component:UsuariosComponent, canActivate: [ AuthGuard ]},
    {path: 'configuracion', component: ConfiguracionComponent, canActivate: [ AuthGuard ]}
  ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
