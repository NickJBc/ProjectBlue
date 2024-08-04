// src/app/routes.ts
import { Routes } from '@angular/router';
import { ExchangeRateComponent } from './components/exchange-rate/exchange-rate.component';

export const routes: Routes = [
  { path: '', redirectTo: '/exchange-rate', pathMatch: 'full' },
  { path: 'exchange-rate', component: ExchangeRateComponent },
];
