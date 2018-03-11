import { valueConverter } from "aurelia-binding";

@valueConverter('number')
export class N {
  fromView(v: string) {
    return parseFloat(v);
  }
}
