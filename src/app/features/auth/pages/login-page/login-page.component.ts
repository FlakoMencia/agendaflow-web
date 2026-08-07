import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { LoginRequest } from '../../../../core/security/auth.models';
import { safeReturnUrl } from '../../../../core/security/safe-return-url';

@Component({
  selector: 'app-login-page',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    organizationId: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  submit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: LoginRequest = {
      email: value.email.trim(),
      password: value.password,
      organizationId: value.organizationId!,
    };

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.auth
      .login(request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          const fallback = this.auth.preferredAuthenticatedRoute();
          const returnUrl = safeReturnUrl(
            this.route.snapshot.queryParamMap.get('returnUrl'),
            fallback,
          );
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => {
          this.form.controls.password.reset('');
          this.errorMessage.set(loginErrorMessage(error));
        },
      });
  }

  showFieldError(field: 'email' | 'password' | 'organizationId'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }
}

function loginErrorMessage(error: unknown): string {
  const status = readStatus(error);
  if (status === 401) return 'Email, password or organization ID is invalid.';
  if (status === 423) return 'This account cannot sign in right now. Contact an administrator.';
  if (status === 0) return 'The AgendaFlow API is unavailable. Check the connection and try again.';
  return 'Sign in could not be completed. Try again later.';
}

function readStatus(error: unknown): number | null {
  return typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
    ? error.status
    : null;
}
