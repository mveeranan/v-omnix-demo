import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../app/shared/forms/validators/password-match.validator';
import { LoggerService } from '../../app/core/logging/logger.service';

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sample.component.html',
  styleUrl: './sample.component.scss'
})
export class SampleComponent implements OnInit  {
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);

  readonly userInfoForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    },
    { validators: [passwordMatchValidator('password', 'confirmPassword')] }
  );
  readonly formData: Array<{ name: string; email: string; password: string; confirmPassword: string }> = [];

  ngOnInit(): void {
  }

  userformSubmit(): void {
    if (!this.userInfoForm.valid) {
      this.userInfoForm.markAllAsTouched();
      return;
    }

    this.formData.push(this.userInfoForm.getRawValue());
    this.logger.info('Sample form submitted.', this.formData);
    this.userInfoForm.reset();
  }

}
