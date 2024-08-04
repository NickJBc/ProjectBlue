// src/app/exchange-rate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ExchangeRateResponse {
  code: string;
  message: string | null;
  data: Array<{
    adv: {
      price: string;
      tradeMethods: Array<{
        tradeMethodName: string;
      }>
    }
  }>;
  total: number;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  private apiUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

  constructor(private http: HttpClient) {}

  getExchangeRate(): Observable<ExchangeRateResponse> {
    const payload = {
      fiat: 'BOB',
      page: 1,
      rows: 10,
      tradeType: 'BUY',
      asset: 'USDT',
      countries: ['BO'],
      proMerchantAds: false,
      shieldMerchantAds: false,
      filterType: 'all',
      periods: [],
      additionalKycVerifyFilter: 0,
      publisherType: null,
      payTypes: [],
      classifies: ['mass', 'profession', 'fiat_trade']
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    return this.http.post<ExchangeRateResponse>(this.apiUrl, payload, { headers });
  }
}
