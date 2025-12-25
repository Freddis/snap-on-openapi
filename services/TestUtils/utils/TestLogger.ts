import {Logger} from '../../Logger/Logger';

export class TestLogger extends Logger {
  private messages: {message: string, level: string, data?: object}[] = [];

  public popMessage() {
    return this.messages.pop();
  }
  public shiftMessage() {
    return this.messages.shift();
  }
  protected override log(message: string, level: string, data?: object): void {
    this.messages.push({message, level, data});
  }

}
