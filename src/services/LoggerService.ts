import "colors";

export class LoggerService {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  public printSuccess(message: string) {
    console.log(`${this.module}`.bgGreen.black + " " + `${message}`.green);
  }

  public printError(message: string, error?: any) {
    console.log(`${this.module}`.bgRed.black + " " + message.red);
    error ? console.error(error) : void {};
  }

  public printInfo(message: string) {
    console.log(`${this.module}`.bgBlue.black + " " + `${message}`.blue);
  }

  public printWarning(message: string) {
    console.log(`${this.module}`.bgYellow.black + " " + `${message}`.yellow);
  }
}
