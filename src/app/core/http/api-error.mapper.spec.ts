import { HttpErrorResponse } from '@angular/common/http';

import { mapApiError } from './api-error.mapper';

describe('mapApiError', () => {
  it('translates a known backend error and preserves field errors', () => {
    const result = mapApiError(
      new HttpErrorResponse({
        status: 409,
        error: {
          timestamp: '2026-08-03T10:00:00Z',
          status: 409,
          code: 'ORGANIZATION_TAX_IDENTIFIER_EXISTS',
          message: 'Internal safe backend message',
          path: '/api/v1/organizations',
          fieldErrors: { taxIdentifier: 'Already exists' },
        },
      }),
    );

    expect(result.message).toContain('tax identifier');
    expect(result.fieldErrors?.['taxIdentifier']).toBe('Already exists');
  });

  it('returns a clear message for a network failure', () => {
    const result = mapApiError(
      new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }),
    );
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toContain('unavailable');
  });

  it('does not expose an HTML server response', () => {
    const result = mapApiError(
      new HttpErrorResponse({ status: 500, error: '<html>failure</html>' }),
    );
    expect(result.message).not.toContain('html');
    expect(result.code).toBe('UNEXPECTED_ERROR');
  });
});
