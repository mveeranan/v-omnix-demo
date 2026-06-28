import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, map, switchMap, tap } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { PortfolioTenantStateService } from '../../portfolio/data-access/portfolio-tenant-state.service';
import { UserDto, UserUpdateRequest } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AdminUserStateService {
  private readonly userService = inject(UserService);
  private readonly tenantState = inject(PortfolioTenantStateService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly user = computed(() => this.tenantState.user());
  readonly loading = computed(() => this.tenantState.loading());
  readonly saving = signal(false);
  readonly lastSavedAt = signal<Date | null>(null);
  readonly loadError = computed(() => {
    if (!this.authService.resolveTenantId()) {
      return 'No tenant selected. Please log in and select a workspace.';
    }
    if (this.tenantState.loadError()) {
      return 'Could not load user details.';
    }
    if (!this.tenantState.loading() && this.tenantState.loaded() && !this.tenantState.user()) {
      return 'Could not load user details.';
    }
    return null;
  });

  constructor() {
    effect(() => {
      const user = this.tenantState.user();
      if (user) {
        this.syncAuthFromUser(user);
      }
    });
  }

  load(): void {
    this.tenantState.ensureLoaded();
  }

  saveProfile(payload: UserUpdateRequest): Observable<UserDto> {
    if (this.saving()) {
      return EMPTY;
    }

    this.saving.set(true);
    return this.userService.update(payload).pipe(
      switchMap((updated) =>
        this.tenantState.refresh().pipe(map((result) => result.user ?? updated))
      ),
      tap({
        next: (user) => {
          this.syncAuthFromUser(user);
          this.saving.set(false);
          this.lastSavedAt.set(new Date());
          this.notifications.success('Personal info saved');
        },
        error: (err) => {
          this.saving.set(false);
          this.notifications.errorFromApi(err, 'Could not save personal info');
        }
      })
    );
  }

  private syncAuthFromUser(user: UserDto): void {
    this.authService.updateLocalUserProfile({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobileNumber,
      email: user.email,
      profileImageUrl: user.profileImageUrl ?? null
    });
  }
}
