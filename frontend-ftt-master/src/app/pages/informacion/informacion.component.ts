import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.scss'
})

export class InformacionComponent implements OnInit {

  constructor(
    public ventana: MatDialogRef<InformacionComponent>,
    @Inject(MAT_DIALOG_DATA) public pregunta: any,
  ) { }

  ngOnInit(): void {
    console.log('ver ', this.pregunta)
  }

}
