// exchange-rate.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as pako from 'pako';  // Import pako for gzip decompression
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

interface ExchangeRateResponse {
  code: string;
  message: string | null;
  data: Array<{
    adv: {
      price: string;
      tradeType: string;
    };
  }>;
  total: number;
  success: boolean;
}

@Component({
  selector: 'app-exchange-rate',
  standalone: true,  // Indicate that this is a standalone component
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
  ],
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.scss']
})
export class ExchangeRateComponent implements OnInit {
  averageBuyPrice: number | null = null;
  averageSellPrice: number | null = null;
  isLoadingBuy: boolean = true;
  isLoadingSell: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchExchangeRates();
  }

  fetchExchangeRates(): void {
    const apiUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json', // Ensure the server sends JSON
    });

    const requestBody = {
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

    console.log('Fetching BUY exchange rates...');

    // Fetch BUY prices
    this.http.post(apiUrl, requestBody, { headers, responseType: 'arraybuffer' })  // Change responseType to 'arraybuffer'
      .pipe(
        catchError(error => {
          console.error('Error fetching exchange rate (BUY):', error);
          return of(null); // Return an observable with a null value
        })
      ).subscribe((response) => {
        if (response !== null) {
          try {
            const buffer = new Uint8Array(response);

            // Check if the response is actually gzipped
            let decoded = '';
            if (this.isGzipped(buffer)) {
              decoded = pako.inflate(buffer, { to: 'string' });  // Decompress gzip
            } else {
              decoded = new TextDecoder('utf-8').decode(buffer);
            }

            const jsonResponse: ExchangeRateResponse = JSON.parse(decoded);
            if (jsonResponse && jsonResponse.success && jsonResponse.data.length > 0) {
              const buyPrices: number[] = jsonResponse.data.map((item) => parseFloat(item.adv.price));
              const averageBuy = buyPrices.reduce((sum, price) => sum + price, 0) / buyPrices.length;
              this.averageBuyPrice = parseFloat(averageBuy.toFixed(2));
              console.log('Average BUY Price:', this.averageBuyPrice);
            } else {
              console.warn('No BUY data available.');
              this.averageBuyPrice = null; // Reset to null if no data
            }
          } catch (e) {
            console.error('Error parsing BUY response:', e);
            this.averageBuyPrice = null; // Reset to null on error
          }
        }
        this.isLoadingBuy = false; // Stop loading after BUY fetch
      });

    console.log('Fetching SELL exchange rates...');

    // Fetch SELL prices
    this.http.post(apiUrl, {
      ...requestBody,
      tradeType: 'SELL' // Change trade type for SELL
    }, { headers, responseType: 'arraybuffer' })  // Change responseType to 'arraybuffer'
      .pipe(
        catchError(error => {
          console.error('Error fetching exchange rate (SELL):', error);
          return of(null); // Return an observable with a null value
        })
      ).subscribe((response) => {
        if (response !== null) {
          try {
            const buffer = new Uint8Array(response);

            // Check if the response is actually gzipped
            let decoded = '';
            if (this.isGzipped(buffer)) {
              decoded = pako.inflate(buffer, { to: 'string' });  // Decompress gzip
            } else {
              decoded = new TextDecoder('utf-8').decode(buffer);
            }

            const jsonResponse: ExchangeRateResponse = JSON.parse(decoded);
            if (jsonResponse && jsonResponse.success && jsonResponse.data.length > 0) {
              const sellPrices: number[] = jsonResponse.data.map((item) => parseFloat(item.adv.price));
              const averageSell = sellPrices.reduce((sum, price) => sum + price, 0) / sellPrices.length;
              this.averageSellPrice = parseFloat(averageSell.toFixed(2));
              console.log('Average SELL Price:', this.averageSellPrice);
            } else {
              console.warn('No SELL data available.');
              this.averageSellPrice = null; // Reset to null if no data
            }
          } catch (e) {
            console.error('Error parsing SELL response:', e);
            this.averageSellPrice = null; // Reset to null on error
          }
        }
        this.isLoadingSell = false; // Stop loading after SELL fetch
      });
  }

  // Helper method to check if the buffer is gzipped
  isGzipped(buffer: Uint8Array): boolean {
    // A simple check: gzip files start with the bytes 0x1f 0x8b
    return buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  }
}

