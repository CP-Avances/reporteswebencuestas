import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseChartDirective } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';

// PAGINACION
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from './pipes/filter.pipe';
import { PagesModule } from './pages/pages.module';
import { AuthModule } from './auth/auth.module';
import { DatePipe } from '@angular/common';
// MOSTRAR NUMEROS EN GRAFICOS
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// SEGURIDAD
import { AuthGuard } from "./guards/auth.guard";
import { TokenInterceptorService } from './services/token-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    BaseChartDirective ,
    FormsModule,
    PagesModule,
    AuthModule,
    ToastrModule.forRoot(),
    NgSelectModule,
    NgxPaginationModule
  ],
  providers: [
    AuthGuard,
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]

})
export class AppModule { }
