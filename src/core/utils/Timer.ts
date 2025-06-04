export class Timer {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  stop(): number {
    return performance.now() - this.startTime;
  }
}
