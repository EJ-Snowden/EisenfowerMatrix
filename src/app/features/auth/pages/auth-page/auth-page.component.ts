import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { TPipe } from '../../../../core/i18n/t.pipe';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  mode: 'signin' | 'signup' = 'signin';
  errorKey: string | null = null;
  loading = false;

  form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
  });

  switchMode(): void {
    this.mode = this.mode === 'signin' ? 'signup' : 'signin';
    this.errorKey = null;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorKey = null;
    this.cdr.detectChanges();

    const email = String(this.form.value.email ?? '').trim();
    const password = String(this.form.value.password ?? '');

    try {
      if (this.mode === 'signup') {
        await this.auth.signUp(email, password);
      } else {
        await this.auth.signIn(email, password);
      }

      await this.router.navigateByUrl('/tasks');
    } catch (e: any) {
      this.zone.run(() => {
        this.errorKey = this.prettyErrorKey(e);
        this.cdr.detectChanges();
      });
    } finally {
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  private prettyErrorKey(e: any): string {
    const code = String(e?.code ?? e?.message ?? e ?? '');

    if (
      code.includes('auth/invalid-credential') ||
      code.includes('auth/invalid-login-credentials')
    ) {
      return 'auth.err.invalidCredential';
    }

    if (code.includes('auth/email-already-in-use')) {
      return 'auth.err.emailInUse';
    }

    if (code.includes('auth/weak-password')) {
      return 'auth.err.weakPassword';
    }

    return 'auth.err.unknown';
  }
}
