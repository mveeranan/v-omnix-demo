import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'v-omnix-theme';
  private userPreference = false;

  readonly isDark = signal(false);

  constructor() {
    this.initialize();
  }

  toggle(): void {
    this.userPreference = true;
    this.isDark.update((value) => !value);
    this.persistAndApply(this.isDark());
  }

  setDark(isDark: boolean): void {
    this.userPreference = true;
    this.isDark.set(isDark);
    this.persistAndApply(isDark);
  }

  private initialize(): void {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.userPreference = true;
      const isDark = savedTheme === 'dark';
      this.isDark.set(isDark);
      this.applyTheme(isDark);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark.set(prefersDark);
    this.applyTheme(prefersDark);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (this.userPreference) {
        return;
      }
      this.isDark.set(event.matches);
      this.applyTheme(event.matches);
    });
  }

  private persistAndApply(isDark: boolean): void {
    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
  }
}
