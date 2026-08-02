import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  readonly baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('AgendaFlow API configuration');

export const DEVELOPMENT_API_CONFIG = {
  baseUrl: 'http://localhost:8080/api/v1',
} as const satisfies ApiConfig;
