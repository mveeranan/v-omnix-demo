import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ProductAttributeApiService } from '@features/catalog/data-access/product-attribute-api.service';
import { ProductAttributeDto } from '@features/catalog/models/product-attribute.model';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { LucideAngularModule, Plus, SlidersHorizontal, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-product-attributes-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
    LucideAngularModule
  ],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Product attributes" description="Define variant attributes like Size and Color.">
      <button admin-page-actions type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add attribute</button>

      @if (formOpen()) {
        <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit attribute' : 'New attribute' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Attribute name</span>
            <input class="pf-editor-input w-full" formControlName="name" placeholder="Size" />
          </label>
          <div class="space-y-2" formArrayName="values">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium">Values</span>
              <button type="button" class="admin-action-secondary inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm" (click)="addValue()">
                <lucide-icon [img]="plusIcon" class="h-3.5 w-3.5" />
                Add value
              </button>
            </div>
            @for (ctrl of valuesArray.controls; track $index; let i = $index) {
              <div class="flex items-center gap-2">
                <input class="pf-editor-input min-w-0 flex-1" [formControlName]="i" [placeholder]="'Value ' + (i + 1)" />
                <button
                  type="button"
                  class="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                  [disabled]="valuesArray.length <= 1"
                  (click)="removeValue(i)"
                  [attr.aria-label]="'Remove value ' + (i + 1)"
                >
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
            }
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      }

      @if (!formOpen()) {
      @if (loading()) {
        <app-loading-spinner label="Loading attributes…" />
      } @else if (!attributes().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No attributes yet</p>
          <p class="mt-1 text-sm text-[var(--text-secondary)]">Create attributes used when building product variants.</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create attribute</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Attribute name</th>
                <th>Values</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (attr of attributes(); track attr.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="attributeIcon" [size]="16" [strokeWidth]="2" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ attr.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1.5">
                      @for (v of attr.values; track v.id) {
                        <span class="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                          {{ v.value }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(attr)" />
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
      }
      }
    </app-admin-page-shell>
  `
})
export class ProductAttributesListComponent implements OnInit {
  private readonly api = inject(ProductAttributeApiService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly attributeIcon = SlidersHorizontal;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly attributes = signal<ProductAttributeDto[]>([]);
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    values: this.fb.nonNullable.array([this.createValueControl()])
  });

  get valuesArray(): FormArray<FormControl<string>> {
    return this.form.controls.values;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.attributes.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createValueControl(value = ''): FormControl<string> {
    return this.fb.nonNullable.control(value, Validators.required);
  }

  setValues(values: string[]): void {
    this.valuesArray.clear();
    const list = values.length ? values : [''];
    for (const value of list) {
      this.valuesArray.push(this.createValueControl(value));
    }
  }

  addValue(): void {
    this.valuesArray.push(this.createValueControl());
  }

  removeValue(index: number): void {
    if (this.valuesArray.length <= 1) return;
    this.valuesArray.removeAt(index);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '' });
    this.setValues([]);
    this.formOpen.set(true);
  }

  openEdit(attr: ProductAttributeDto): void {
    this.editingId.set(attr.id);
    this.form.patchValue({ name: attr.name });
    this.setValues(attr.values.map((v) => v.value));
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;

    const v = this.form.getRawValue();
    const values = v.values.map((item) => item.trim()).filter(Boolean);

    if (!values.length) {
      this.notifications.error('Add at least one value');
      return;
    }

    const payload = {
      tenantId: requireTenantId(this.auth),
      name: v.name.trim(),
      values
    };

    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);

    this.saving.set(true);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.notifications.success(id ? 'Attribute updated' : 'Attribute created');
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(err?.message ?? 'Could not save attribute');
      }
    });
  }
}
