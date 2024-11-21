import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ValidacionesService {

    /** ********************************************************************************* **
   ** **                     IMPORTAR SCRIPT DE ARCHIVOS DE PDF                      ** **
   ** ********************************************************************************* **/
  
  async ImportarPDF() {
    const pdfMake = await import('src/assets/build/pdfmake.js');
    const pdfFonts = await import('src/assets/build/vfs_fonts.js');
    pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs;
    return pdfMake.default;
  }
  
}