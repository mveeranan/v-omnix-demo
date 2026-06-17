import { NewsletterSubscriber } from '../models/newsletter-subscriber.model';

const SEED: NewsletterSubscriber[] = [
  {
    id: 'nl-1',
    tenantId: 'default',
    email: 'sarah@example.com',
    name: 'Sarah Mitchell',
    subscribedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isActive: true,
    source: 'checkout'
  },
  {
    id: 'nl-2',
    tenantId: 'default',
    email: 'james@example.com',
    name: 'James Chen',
    subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isActive: true,
    source: 'footer'
  },
  {
    id: 'nl-3',
    tenantId: 'default',
    email: 'newsletter@example.com',
    name: '',
    subscribedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isActive: false,
    source: 'popup'
  }
];

class NewsletterSubscriberStore {
  private subscribers = structuredClone(SEED);

  getAll(): NewsletterSubscriber[] {
    return [...this.subscribers].sort(
      (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
    );
  }

  getById(id: string): NewsletterSubscriber | undefined {
    return this.subscribers.find((s) => s.id === id);
  }

  create(input: Omit<NewsletterSubscriber, 'id' | 'subscribedAt'>): NewsletterSubscriber {
    const item: NewsletterSubscriber = {
      ...input,
      id: `nl-${crypto.randomUUID().slice(0, 8)}`,
      subscribedAt: new Date().toISOString()
    };
    this.subscribers.push(item);
    return item;
  }

  update(id: string, patch: Partial<NewsletterSubscriber>): NewsletterSubscriber | null {
    const idx = this.subscribers.findIndex((s) => s.id === id);
    if (idx < 0) return null;
    this.subscribers[idx] = { ...this.subscribers[idx], ...patch };
    return this.subscribers[idx];
  }

  delete(id: string): boolean {
    const before = this.subscribers.length;
    this.subscribers = this.subscribers.filter((s) => s.id !== id);
    return this.subscribers.length < before;
  }

  subscribe(email: string, name = ''): NewsletterSubscriber {
    const existing = this.subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.isActive = true;
      return existing;
    }
    return this.create({
      tenantId: 'default',
      email,
      name,
      isActive: true,
      source: 'website'
    });
  }

  replaceAll(items: NewsletterSubscriber[]): void {
    this.subscribers = structuredClone(items);
  }
}

export const newsletterSubscriberStore = new NewsletterSubscriberStore();
