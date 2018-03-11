import { customElement, bindable, containerless, processContent, DOM, ViewCompiler, ViewResources, autoinject, TaskQueue, viewEngineHooks } from "aurelia-framework";
import { interpolateViridis as vivid } from 'd3-scale';

// @containerless()
@customElement('pythagoras')
export class Pythagoras {

  @bindable()
  w: number;

  @bindable()
  x: number;

  @bindable()
  y: number;

  @bindable()
  heightFactor: number

  @bindable()
  lean: number;

  @bindable()
  left: number;

  @bindable()
  right: number;

  @bindable()
  lvl: number;

  @bindable()
  maxlvl: number;

  shouldRender: boolean;

  nextRight: number = 0;
  nextLeft: number = 0;
  A: number = 0;
  B: number = 0;

  constructor(
    // public taskQueue: TaskQueue
  ) {

  }


  bind() {
    this.calculate();
  }

  interpolateViridis(val: number) {
    return vivid(val);
  }

  propertyChanged() {
    this.calculate();
  }

  call() {
    this.calculate();
  }

  calculate = () => {
    const calc = memoizedCalc({
      w: this.w,
      heightFactor: this.heightFactor,
      lean: this.lean
    });
    this.nextRight = calc.nextRight;
    this.nextLeft = calc.nextLeft;
    this.A = calc.A;
    this.B = calc.B;
  };

  getTransform(x: number, y: number, w: number, A: number, B: number) {
    return `translate(${this.x} ${this.y}) ${
      this.left
        ? `rotate(${-A} 0 ${w})`
        : this.right
          ? `rotate(${B} ${w} ${w})`
          : ''
      }`;
  }
}

@viewEngineHooks()
export class RemoveSvg {
  beforeCompile(fragment: DocumentFragment) {
    let svg = fragment.querySelector('svg');
    if (svg) {
      let remove = svg.hasAttribute('remove');
      if (remove) {
        while (svg.childElementCount) {
          (svg.parentNode as Element).insertBefore(svg.firstElementChild, svg);
        }
        (svg.parentNode as Element).removeChild(svg);
      }
    }
  }
}

interface ICalcResult {
  nextRight: number;
  nextLeft: number;
  A: number;
  B: number;
}

interface ICalcParams {
  w: number;
  heightFactor: number;
  lean: number;
}

const memo: Record<string, ICalcResult> = {};
const rad2Deg = radians => radians * (180 / Math.PI);
const key = ({ w, heightFactor, lean }: ICalcParams) => `${w}-${heightFactor}-${lean}`;
const memoizedCalc = (args: ICalcParams) => {
  const memoKey = key(args);

  if (memoKey in memo) {
    return memo[memoKey];
  } else {
    const { w, heightFactor, lean } = args;
    const trigH = heightFactor * w;

    const result = {
      nextRight: Math.sqrt(trigH ** 2 + (w * (0.5 + lean)) ** 2),
      nextLeft: Math.sqrt(trigH ** 2 + (w * (0.5 - lean)) ** 2),
      A: rad2Deg(Math.atan(trigH / ((0.5 - lean) * w))),
      B: rad2Deg(Math.atan(trigH / ((0.5 + lean) * w)))
    };

    memo[memoKey] = result;
    return result
  }
}
