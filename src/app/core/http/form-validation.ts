import { AbstractControl } from '@angular/forms';

export function formErrorMessage(
  control: AbstractControl,
  label: string,
  serverError?: string,
): string | null {
  if (serverError) return serverError;
  if (!control.touched || !control.errors) return null;
  if (control.hasError('required')) return `${label} is required.`;
  if (control.hasError('email')) return `Enter a valid ${label.toLowerCase()}.`;
  if (control.hasError('maxlength')) {
    return `${label} must contain no more than ${control.getError('maxlength').requiredLength} characters.`;
  }
  if (control.hasError('minlength')) {
    return `${label} must contain ${control.getError('minlength').requiredLength} characters.`;
  }
  if (control.hasError('min')) return `${label} is below the allowed value.`;
  if (control.hasError('max')) return `${label} exceeds the allowed value.`;
  if (control.hasError('pattern')) return `${label} has an invalid format.`;
  return `${label} is invalid.`;
}
