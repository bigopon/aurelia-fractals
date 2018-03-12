import { customElement, bindable, containerless, processContent, DOM, ViewCompiler, ViewResources, autoinject, TaskQueue, viewEngineHooks } from "aurelia-framework";
import { interpolateViridis as vivid } from 'd3-scale';

export interface IPythagorasProps {
  w: number;
  x: number;
  y: number;
  heightFactor: number;
  lean: number;
  lvl: number;
  maxlvl: number;
}

// @containerless()
@customElement('pythagoras')
export class Pythagoras implements IPythagorasProps {

  @bindable({ changeHandler: 'calculate' })
  w: number;

  @bindable()
  x: number;

  @bindable()
  y: number;

  @bindable({ changeHandler: 'calculate' })
  heightFactor: number

  @bindable({ changeHandler: 'calculate' })
  lean: number;

  @bindable()
  lvl: number;

  @bindable()
  maxlvl: number;

  @bindable()
  left: boolean;

  @bindable()
  right: boolean;

  shouldRender: boolean;

  nextRight: number = 0;
  nextLeft: number = 0;
  A: number = 0;
  B: number = 0;

  attached() {
    this.calculate();
  }

  interpolateViridis = vivid;

  calculate() {
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
    return `translate(${x} ${y}) ${
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

const memoizedCalc = (() => {
  const memo: Record<string, ICalcResult> = {};
  const rad2Deg = radians => radians * (180 / Math.PI);
  const key = ({ w, heightFactor, lean }: ICalcParams) => `${w}-${heightFactor}-${lean}`;
  return (args: ICalcParams) => {
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
})();
