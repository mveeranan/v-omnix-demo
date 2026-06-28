import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

const RICH_TEXT_TOOLBAR = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ background: [] }, { color: [] }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ header: ['1', '2', '3', false] }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean']
];

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="rich-text-editor" [class.rich-text-editor--disabled]="isDisabled">
      <div #editor class="rich-text-editor__editor"></div>
    </div>
  `,
  styleUrl: './rich-text-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  readonly placeholder = input('Write a description…');

  @ViewChild('editor', { static: true }) private readonly editorRef!: ElementRef<HTMLDivElement>;

  private quill: Quill | null = null;
  private pendingValue = '';
  protected isDisabled = false;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngAfterViewInit(): void {
    this.quill = new Quill(this.editorRef.nativeElement, {
      theme: 'snow',
      placeholder: this.placeholder(),
      modules: {
        toolbar: RICH_TEXT_TOOLBAR
      }
    });

    this.quill.on('text-change', () => this.emitValue());
    this.quill.on('selection-change', (_range, _oldRange, source) => {
      if (source === 'user') {
        this.onTouched();
      }
    });

    if (this.pendingValue) {
      this.setEditorHtml(this.pendingValue);
    }
    this.quill.enable(!this.isDisabled);
  }

  ngOnDestroy(): void {
    this.quill = null;
  }

  writeValue(value: string | null): void {
    const html = value ?? '';
    this.pendingValue = html;
    if (this.quill) {
      this.setEditorHtml(html);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.quill?.enable(!isDisabled);
  }

  private emitValue(): void {
    if (!this.quill) return;
    const html = this.quill.root.innerHTML;
    this.onChange(this.normalizeHtml(html));
  }

  private setEditorHtml(html: string): void {
    if (!this.quill) return;
    const current = this.normalizeHtml(this.quill.root.innerHTML);
    const next = this.normalizeHtml(html);
    if (current === next) return;
    this.quill.clipboard.dangerouslyPasteHTML(html || '');
  }

  private normalizeHtml(html: string): string {
    const trimmed = html.trim();
    if (!trimmed || trimmed === '<p><br></p>' || trimmed === '<p></p>') {
      return '';
    }
    return html;
  }
}
