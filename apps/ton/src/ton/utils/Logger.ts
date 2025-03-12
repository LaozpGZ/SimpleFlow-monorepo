export class Logger {
  private constructor(private name: string) {}

  public debug(...args: unknown[]) {
    console.debug(`%c[${this.name}]`, 'color: blue;font-weight: bold;', ...args)
  }

  static getLogger(name: string) {
    return new Logger(name)
  }
}
