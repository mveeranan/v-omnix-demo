export interface NewsletterSubscriber {
  id: string;
  tenantId: string;
  email: string;
  name?: string;
  subscribedAt: string;
  isActive: boolean;
  source?: string;
}

export function createEmptySubscriber(tenantId = 'default'): Omit<NewsletterSubscriber, 'id' | 'subscribedAt'> {
  return {
    tenantId,
    email: '',
    name: '',
    isActive: true,
    source: 'admin'
  };
}
