import { randomInt } from 'crypto';

export class Die {
  private spot: number = 1;
  private _pinned: boolean = false;

  roll(): void {
    if (!this._pinned) {
      this.spot = randomInt(1, 7);
    }
  }

  togglePin(): void {
    this._pinned = !this._pinned;
  }

  unpin(): void {
    this._pinned = false;
  }

  get value(): number {
    return this.spot;
  }

  get pinned(): boolean {
    return this._pinned;
  }
}
