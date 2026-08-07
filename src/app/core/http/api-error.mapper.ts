import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from './api-error.model';

const KNOWN_MESSAGES: Readonly<Record<string, string>> = {
  ORGANIZATION_NOT_FOUND: 'The organization could not be found.',
  BRANCH_NOT_FOUND: 'The branch could not be found in this organization.',
  ORGANIZATION_TAX_IDENTIFIER_EXISTS: 'Another organization already uses this tax identifier.',
  BRANCH_NAME_EXISTS: 'A branch with this name already exists in the organization.',
  BRANCH_CODE_EXISTS: 'A branch with this code already exists in the organization.',
  VALIDATION_ERROR: 'Review the highlighted fields and try again.',
  DATA_INTEGRITY_CONFLICT: 'The change conflicts with existing information.',
  INTERNAL_ERROR: 'The service could not complete the request. Try again later.',
  TOKEN_EXPIRED: 'Your session has ended. Sign in again.',
  INVALID_TOKEN: 'Your session is no longer valid. Sign in again.',
  ACCESS_DENIED: 'You do not have permission to complete this action.',
  ACCOUNT_LOCKED: 'This account cannot complete the request right now.',
};

export function mapApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return unexpectedError();
  }

  if (error.status === 0) {
    return {
      timestamp: null,
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'The AgendaFlow API is unavailable. Check the connection and try again.',
      path: null,
    };
  }

  const response = readErrorBody(error.error);
  const code = response?.code ?? statusCode(error.status);

  return {
    timestamp: response?.timestamp ?? null,
    status: error.status,
    code,
    message: KNOWN_MESSAGES[code] ?? fallbackMessage(error.status),
    path: response?.path ?? null,
    fieldErrors: response?.fieldErrors,
  };
}

function readErrorBody(value: unknown): ApiError | null {
  if (!isRecord(value) || typeof value['code'] !== 'string') {
    return null;
  }

  const fieldErrors = isStringRecord(value['fieldErrors']) ? value['fieldErrors'] : undefined;

  return {
    timestamp: typeof value['timestamp'] === 'string' ? value['timestamp'] : null,
    status: typeof value['status'] === 'number' ? value['status'] : 0,
    code: value['code'],
    message: typeof value['message'] === 'string' ? value['message'] : '',
    path: typeof value['path'] === 'string' ? value['path'] : null,
    fieldErrors,
  };
}

function statusCode(status: number): string {
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) return 'AUTHENTICATION_REQUIRED';
  if (status === 403) return 'ACCESS_DENIED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'DATA_INTEGRITY_CONFLICT';
  if (status === 423) return 'ACCOUNT_LOCKED';
  return 'UNEXPECTED_ERROR';
}

function fallbackMessage(status: number): string {
  if (status === 400) return KNOWN_MESSAGES['VALIDATION_ERROR'];
  if (status === 401) return 'Your session has ended. Sign in again.';
  if (status === 403) return KNOWN_MESSAGES['ACCESS_DENIED'];
  if (status === 404) return 'The requested information could not be found.';
  if (status === 409) return KNOWN_MESSAGES['DATA_INTEGRITY_CONFLICT'];
  if (status === 423) return KNOWN_MESSAGES['ACCOUNT_LOCKED'];
  return 'An unexpected error occurred. Try again later.';
}

function unexpectedError(): ApiError {
  return {
    timestamp: null,
    status: 0,
    code: 'UNEXPECTED_ERROR',
    message: 'An unexpected error occurred. Try again later.',
    path: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}
