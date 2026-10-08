export class LocalStorageRepository<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${this.key} from localStorage`, e);
      return [];
    }
  }

  saveAll(items: T[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving ${this.key} to localStorage`, e);
    }
  }

  add(item: T): void {
    const items = this.getAll();
    items.push(item);
    this.saveAll(items);
  }

  update(matchFn: (item: T) => boolean, updateFn: (item: T) => T): void {
    const items = this.getAll();
    const idx = items.findIndex(matchFn);
    if (idx !== -1) {
      items[idx] = updateFn(items[idx]);
      this.saveAll(items);
    }
  }
}
