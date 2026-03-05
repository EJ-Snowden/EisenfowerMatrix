import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {ReactiveFormsModule, Validators, FormBuilder, FormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mode: 'signin' | 'signup' = 'signin';
  error: string | null = null;
  loading = false;

  form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
  });

  switchMode(): void {
    this.mode = this.mode === 'signin' ? 'signup' : 'signin';
    this.error = null;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

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
      this.error = this.prettyError(e);
    } finally {
      this.loading = false;
    }
  }

  private prettyError(e: any): string {
    const msg = String(e?.message ?? e ?? '');
    if (msg.includes('auth/invalid-credential')) return 'Invalid email or password';
    if (msg.includes('auth/email-already-in-use')) return 'Email already in use';
    if (msg.includes('auth/weak-password')) return 'Password is too weak';
    return msg || 'Unknown error';
  }
}
