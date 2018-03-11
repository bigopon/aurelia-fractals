import { select as d3select, mouse as d3mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { TaskQueue, autoinject, observable, ViewFactory } from 'aurelia-framework';
import { throttle } from './throttle';
import * as AuBinding from 'aurelia-binding'


class Queuer {

  constructor(public value: any, public obj: any, public propertyName: any) { }

  call() {
    var value = this.value;
    if (value === null || value === undefined) {
      this.obj.removeAttribute(this.propertyName);
    } else {
      this.obj.setAttribute(this.propertyName, value);
    }
  }
}


@autoinject()
export class App {

  unlimited: boolean = false;

  @observable()
  throttleValue: number = 0;

  width = Math.min(window.innerWidth, 1280);
  height = this.width * (600 / 1280);
  currentMax = 0;
  baseW = 80;
  heightFactor = 0;
  lean = 0;
  realMax = 11;

  public readonly svg: SVGSVGElement;

  constructor(
    public taskQueue: TaskQueue
  ) {
    (AuBinding as any).dataAttributeAccessor.setValue = function(value, obj, propertyName) {
      taskQueue.queueMicroTask(new Queuer(value, obj, propertyName));
    };
    // (AuBinding as any).setTaskQueue(taskQueue);
    // (taskQueue as any).microTaskQueueCapacity = 1028;
    /**
     * Override builtin queue flusher function. Ignore try catch to have more perf
     */
    (taskQueue as any)._flushQueue = (queue: any[], capacity: number): void => {
      let index = 0;
      let task;

      taskQueue.flushing = true;
      while (index < queue.length) {
        task = queue[index];
        task.call();
        index++;

        if (!this.unlimited && index > capacity) {
          for (let scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
            queue[scan] = queue[scan + index];
          }

          queue.length -= index;
          index = 0;
        }
      }
      taskQueue.flushing = false;
    }
  }

  attached() {
    this.next();
    d3select(this.svg).on('mousemove', this.onMousemove);
  }

  private next = () => {
    if (this.currentMax < this.realMax) {
      this.currentMax++;
      setTimeout(this.next, 500);
    }
  }

  private onMousemove: Function = () => {
    let [x, y] = d3mouse(this.svg);

    let scaleFactor = scaleLinear()
      .domain([this.height, 0])
      .range([0, .8]);

    let scaleLean = scaleLinear()
      .domain([0, this.width / 2, this.width])
      .range([.5, 0, -.5]);

    this.heightFactor = scaleFactor(y);
    this.lean = scaleLean(x);
  };

  throttleValueChanged(value: number) {
    if (this.svg) {
      d3select(this.svg)
        .on('mousemove', null)
        .on('mousemove',
          !value
            ? this.onMousemove
            : throttle(this.onMousemove, value)
        );
    }
  }
}
