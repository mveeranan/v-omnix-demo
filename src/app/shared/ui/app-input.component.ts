import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <div class="app-field">
      @if (label()) {
        <label [for]="inputId" class="app-field__label">{{ label() }}</label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="app-input"
        [class.pf-editor-input]="useEditorClass()"
        [class.pa-input]="useAuthClass()" />
      @if (hint()) {
        <p class="app-field__hint">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="app-field__error">{{ error() }}</p>
      }
    </div>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppInputComponent), multi: true }
  ]
})
export class AppInputComponent implements ControlValueAccessor {
  readonly label = input<string | undefined>();
  readonly hint = input<string | undefined>();
  readonly error = input<string | undefined>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly useEditorClass = input(false);
  readonly useAuthClass = input(false);

  readonly inputId = `app-input-${Math.random().toString(36).slice(2, 9)}`;
  value = '';
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(): void {}

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.onChange(next);
  }
}
