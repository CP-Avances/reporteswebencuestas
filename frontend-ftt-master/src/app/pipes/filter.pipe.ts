import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    const resultPosts:any = [];
    for(const servicio1 of value){

      if(servicio1.usuario.indexOf(arg) > -1){
        resultPosts.push(servicio1);
      }

    }
    return resultPosts;



  }

}

