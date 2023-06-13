import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  usua_login: "";
  usua_password: "";
  mostrar = true;

  constructor(
    // INYECCION DE DEPENDENCIAS
    private authenticationService: AuthenticationService,
    public router: Router) { }

  ngOnInit(): void {
  }

  login2(form: NgForm, username, password) {
    if (form.invalid) { return; }

    Swal.fire({
      allowOutsideClick: false,
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    

    this.authenticationService.login(username, password)
      .subscribe(resp => {
        Swal.close();
        this.router.navigateByUrl('/usuarios');
      }, (err) => {
        Swal.fire({
          title: 'Error!',
          text: 'Usuario o password incorrecto.',
          icon: 'error'
        })
      })

  }

}
