import { PaymentTransaction } from '../models/payment.model';

class PaymentStore {
  private transactions: PaymentTransaction[] = [];

  getAll(): PaymentTransaction[] {
    return this.transactions.map((t) => structuredClone(t));
  }

  add(txn: PaymentTransaction): PaymentTransaction {
    this.transactions.unshift(structuredClone(txn));
    return structuredClone(txn);
  }

  getById(id: string): PaymentTransaction | undefined {
    const t = this.transactions.find((x) => x.id === id || x.transactionId === id);
    return t ? structuredClone(t) : undefined;
  }

  update(id: string, patch: Partial<PaymentTransaction>): PaymentTransaction | null {
    const idx = this.transactions.findIndex((t) => t.id === id || t.transactionId === id);
    if (idx < 0) return null;
    this.transactions[idx] = { ...this.transactions[idx], ...patch };
    return structuredClone(this.transactions[idx]);
  }
}

export const paymentStore = new PaymentStore();
