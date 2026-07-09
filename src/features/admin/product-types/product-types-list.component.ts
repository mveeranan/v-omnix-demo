import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ProductTypeApiService } from '@features/catalog/data-access/product-type-api.service';
import { ProductAttributeDataType, ProductTypeDto } from '@features/catalog/models/product-type.model';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { LucideAngularModule, Plus, Shapes, Trash2 } from 'lucide-angular';

interface AttributeFormGroup {
  id: FormControl<string | null>;
  name: FormControl<string>;
  dataType: FormControl<ProductAttributeDataType>;
  isRequired: FormControl<boolean>;
  possibleValuesText: FormControl<string>;
}

@Component({
  selector: 'app-product-types-list',
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
    <app-admin-page-shell
      eyebrow="Catalog"
      title="Product types"
      description="Define product categories like Shoes or Electronics, each with their own variant attributes (Size, Color, RAM, etc.)."
    >
      <button admin-page-actions type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add product type</button>

      @if (formOpen()) {
        <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit product type' : 'New product type' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Name</span>
            <input class="pf-editor-input w-full" formControlName="name" placeholder="Shoes" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Description</span>
            <input class="pf-editor-input w-full" formControlName="description" placeholder="Optional" />
          </label>

          <div class="space-y-2" formArrayName="attributes">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium">Attributes</span>
              <button type="button" class="admin-action-secondary inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm" (click)="addAttribute()">
                <lucide-icon [img]="plusIcon" class="h-3.5 w-3.5" />
                Add attribute
              </button>
            </div>
            @for (ctrl of attributesArray.controls; track $index; let i = $index) {
              <div class="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1.5fr_1fr_auto_auto]" [formGroupName]="i">
                <input class="pf-editor-input" formControlName="name" placeholder="Attribute name (Size)" />
                <select class="pf-editor-input" formControlName="dataType">
                  <option [ngValue]="1">Text</option>
                  <option [ngValue]="2">Number</option>
                  <option [ngValue]="3">Dropdown</option>
                </select>
                <label class="flex items-center gap-1.5 whitespace-nowrap text-sm">
                  <input type="checkbox" formControlName="isRequired" /> Required
                </label>
                <button
                  type="button"
                  class="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-rose-50 hover:text-rose-600"
                  (click)="removeAttribute(i)"
                  [attr.aria-label]="'Remove attribute ' + (i + 1)"
                >
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
                @if (ctrl.controls.dataType.value === 3) {
                  <div class="sm:col-span-4">
                    <input class="pf-editor-input w-full" formControlName="possibleValuesText" placeholder="Comma-separated values: 8GB, 16GB, 32GB" />
                  </div>
                }
              </div>
            }
            @if (!attributesArray.length) {
              <p class="text-sm text-[var(--text-muted)]">No attributes yet — a simple product type with no variants is fine too.</p>
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
        <app-loading-spinner label="Loading product types…" />
      } @else if (!productTypes().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No product types yet</p>
          <p class="mt-1 text-sm text-[var(--text-secondary)]">Create a type for each kind of product you sell — Shoes, Electronics, Furniture, etc.</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create product type</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Name</th>
                <th>Attributes</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (t of productTypes(); track t.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="typeIcon" [size]="16" [strokeWidth]="2" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ t.name }}</div>
                        @if (t.description) {
                          <div class="admin-data-table__entity-subtitle">{{ t.description }}</div>
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1.5">
                      @for (a of t.attributes; track a.id) {
                        <span class="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                          {{ a.name }}{{ a.isRequired ? ' *' : '' }}
                        </span>
                      }
                      @if (!t.attributes.length) {
                        <span class="text-xs text-[var(--text-muted)]">No attributes</span>
                      }
                    </div>
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(t)" />
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
export class ProductTypesListComponent implements OnInit {
  private readonly api = inject(ProductTypeApiService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly typeIcon = Shapes;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly productTypes = signal<ProductTypeDto[]>([]);
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    attributes: this.fb.array<FormGroup<AttributeFormGroup>>([])
  });

  get attributesArray(): FormArray<FormGroup<AttributeFormGroup>> {
    return this.form.controls.attributes;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.productTypes.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createAttributeGroup(init?: {
    id?: string;
    name?: string;
    dataType?: ProductAttributeDataType;
    isRequired?: boolean;
    possibleValues?: string[];
  }): FormGroup<AttributeFormGroup> {
    return this.fb.group({
      id: this.fb.control<string | null>(init?.id ?? null),
      name: this.fb.nonNullable.control(init?.name ?? '', Validators.required),
      dataType: this.fb.nonNullable.control<ProductAttributeDataType>(init?.dataType ?? ProductAttributeDataType.Text),
      isRequired: this.fb.nonNullable.control(init?.isRequired ?? false),
      possibleValuesText: this.fb.nonNullable.control((init?.possibleValues ?? []).join(', '))
    });
  }

  addAttribute(): void {
    this.attributesArray.push(this.createAttributeGroup());
  }

  removeAttribute(index: number): void {
    this.attributesArray.removeAt(index);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '' });
    this.attributesArray.clear();
    this.formOpen.set(true);
  }

  openEdit(type: ProductTypeDto): void {
    this.editingId.set(type.id);
    this.form.patchValue({ name: type.name, description: type.description ?? '' });
    this.attributesArray.clear();
    for (const attr of type.attributes) {
      this.attributesArray.push(
        this.createAttributeGroup({
          id: attr.id,
          name: attr.name,
          dataType: attr.dataType,
          isRequired: attr.isRequired,
          possibleValues: attr.possibleValues
        })
      );
    }
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;

    const v = this.form.getRawValue();
    const payload = {
      tenantId: requireTenantId(this.auth),
      name: v.name.trim(),
      description: v.description?.trim() || null,
      attributes: v.attributes.map((a, index) => ({
        id: a.id,
        name: a.name.trim(),
        dataType: a.dataType,
        isRequired: a.isRequired,
        displayOrder: index,
        possibleValues: a.possibleValuesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }))
    };

    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);

    this.saving.set(true);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.notifications.success(id ? 'Product type updated' : 'Product type created');
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.errorFromApi(err, 'Could not save product type');
      }
    });
  }
}
