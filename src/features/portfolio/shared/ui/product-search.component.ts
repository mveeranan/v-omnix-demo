import {
  Component,
  OnInit,
  inject,
  output,
  signal,
  effect,
  ViewChild,
  ElementRef,
  HostListener,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Search, X, Loader } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { ProductAdminService } from '@features/admin/products/data-access/product-admin.service';
import { ProductListItemDto } from '@features/catalog/models/product-admin.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="product-search-container">
      <div #searchWrapper class="search-input-wrapper">
        <lucide-icon [img]="searchIcon" class="search-icon" />
        <input
          #searchInput
          type="text"
          class="search-input"
          [placeholder]="placeholder()"
          [value]="searchTerm()"
          (input)="onSearch($event)"
          (focus)="onInputFocus()"
          aria-label="Search products"
          autocomplete="off"
        />
        @if (isLoading()) {
          <div class="search-spinner">
            <lucide-icon [img]="loaderIcon" class="h-4 w-4 animate-spin"></lucide-icon>
          </div>
        } @else if (searchTerm()) {
          <button
            type="button"
            class="search-clear-btn"
            (click)="clearSearch()"
            aria-label="Clear search"
          >
            <lucide-icon [img]="clearIcon" class="h-4 w-4"></lucide-icon>
          </button>
        }
      </div>

      @if (showDropdown() && (searchTerm() || results().length > 0)) {
        <div class="search-dropdown" [style]="dropdownStyle()">
          @if (isLoading()) {
            <div class="search-loading">
              <lucide-icon [img]="loaderIcon" class="h-5 w-5 animate-spin"></lucide-icon>
              <span>Searching...</span>
            </div>
          } @else if (results().length > 0) {
            <div class="search-results">
              @for (product of results(); track product.id) {
                <button
                  type="button"
                  class="search-result-item"
                  (click)="selectProduct(product)"
                  (keydown.enter)="selectProduct(product)"
                >
                  @if (product.primaryImageUrl) {
                    <img
                      [src]="product.primaryImageUrl"
                      [alt]="product.name"
                      class="result-thumbnail"
                    />
                  } @else {
                    <div class="result-thumbnail result-thumbnail--empty">
                      <span class="text-xs">No image</span>
                    </div>
                  }
                  <div class="result-info">
                    <div class="result-name">{{ product.name }}</div>
                    @if (product.sku) {
                      <div class="result-sku">SKU: {{ product.sku }}</div>
                    }
                  </div>
                </button>
              }
            </div>
          } @else if (searchTerm()) {
            <div class="search-empty">
              <p>No products found matching "{{ searchTerm() }}"</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .product-search-container {
      position: relative;
      width: 100%;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      width: 1rem;
      height: 1rem;
      color: rgb(100 116 139);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 2.5rem 0.625rem 2.25rem;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      background: rgb(255 255 255);
      color: rgb(51 65 85);
      font-size: 0.875rem;
      line-height: 1.5;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      font-family: inherit;
    }

    :host-context(.dark) .search-input {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
      color: rgb(212 212 216);
    }

    :host-context(.dark) .search-icon {
      color: rgb(161 161 170);
    }

    .search-input:focus {
      outline: none;
      border-color: rgb(124 58 237);
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
    }

    :host-context(.dark) .search-input:focus {
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    }

    .search-input::placeholder {
      color: rgb(148 163 184);
    }

    :host-context(.dark) .search-input::placeholder {
      color: rgb(113 113 122);
    }

    .search-spinner,
    .search-clear-btn {
      position: absolute;
      right: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 1.5rem;
      width: 1.5rem;
      flex-shrink: 0;
      background: none;
      border: none;
      color: rgb(100 116 139);
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    :host-context(.dark) .search-spinner,
    :host-context(.dark) .search-clear-btn {
      color: rgb(161 161 170);
    }

    .search-clear-btn:hover {
      color: rgb(51 65 85);
    }

    :host-context(.dark) .search-clear-btn:hover {
      color: rgb(212 212 216);
    }

    .search-dropdown {
      position: fixed;
      background: rgb(255 255 255);
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      max-height: 20rem;
      overflow-y: auto;
    }

    :host-context(.dark) .search-dropdown {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }

    .search-loading,
    .search-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      text-align: center;
      color: rgb(100 116 139);
      font-size: 0.875rem;
    }

    :host-context(.dark) .search-loading,
    :host-context(.dark) .search-empty {
      color: rgb(161 161 170);
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      color: inherit;
      text-align: left;
      transition: background-color 0.15s ease;
      font-family: inherit;
      font-size: 0.875rem;
    }

    .search-result-item:hover {
      background: rgb(241 245 249);
    }

    :host-context(.dark) .search-result-item:hover {
      background: rgb(52 52 58);
    }

    .search-result-item:focus {
      outline: none;
      background: rgb(248 250 252);
    }

    :host-context(.dark) .search-result-item:focus {
      background: rgb(63 63 70);
    }

    .result-thumbnail {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.25rem;
      object-fit: cover;
      background: rgb(241 245 249);
    }

    :host-context(.dark) .result-thumbnail {
      background: rgb(52 52 58);
    }

    .result-thumbnail--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgb(148 163 184);
      font-size: 0.7rem;
    }

    :host-context(.dark) .result-thumbnail--empty {
      color: rgb(113 113 122);
    }

    .result-info {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .result-name {
      font-weight: 500;
      color: rgb(51 65 85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host-context(.dark) .result-name {
      color: rgb(212 212 216);
    }

    .result-sku {
      font-size: 0.75rem;
      color: rgb(100 116 139);
    }

    :host-context(.dark) .result-sku {
      color: rgb(161 161 170);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `
})
export class ProductSearchComponent implements OnInit {
  private readonly productApi = inject(ProductAdminService);
  private readonly searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('searchWrapper') searchWrapper?: ElementRef<HTMLElement>;

  readonly placeholder = input('Search by product name or SKU...');
  readonly productSelected = output<ProductListItemDto>();

  readonly searchTerm = signal('');
  readonly results = signal<ProductListItemDto[]>([]);
  readonly isLoading = signal(false);
  readonly showDropdown = signal(false);
  readonly dropdownStyle = signal<string>('');

  readonly searchIcon = Search;
  readonly clearIcon = X;
  readonly loaderIcon = Loader;

  constructor() {
    effect(() => {
      const query = this.searchTerm();
      if (query && query.length > 0) {
        this.showDropdown.set(true);
      }
    });
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        if (!term.trim()) {
          this.results.set([]);
          this.isLoading.set(false);
          return;
        }
        this.performSearch(term);
      });
  }

  onInputFocus(): void {
    this.updateDropdownPosition();
    this.showDropdown.set(true);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.searchSubject.next(value);
    if (value) this.updateDropdownPosition();
  }

  private updateDropdownPosition(): void {
    const el = this.searchWrapper?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.dropdownStyle.set(
      `top:${rect.bottom + 4}px;left:${rect.left}px;width:${rect.width}px`
    );
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.results.set([]);
    this.showDropdown.set(false);
  }

  selectProduct(product: ProductListItemDto): void {
    this.productSelected.emit(product);
    this.clearSearch();
    this.showDropdown.set(false);
    this.searchInput?.nativeElement.blur();
  }

  private performSearch(term: string): void {
    this.isLoading.set(true);
    this.productApi.list({ search: term, pageSize: 50 }).subscribe({
      next: (response) => {
        this.results.set(response.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.isLoading.set(false);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const container = target.closest('.product-search-container');
    if (!container) {
      this.showDropdown.set(false);
    }
  }
}
