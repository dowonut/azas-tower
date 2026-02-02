import {
  Viewport,
  type IClampOptions,
  type IClampZoomOptions,
  type IDecelerateOptions,
  type IDragOptions,
  type IPinchOptions,
  type IViewportOptions,
  type IWheelOptions,
} from "pixi-viewport";

type CustomViewportOptions = IViewportOptions & {
  decelerate?: true | IDecelerateOptions;
  drag?: true | IDragOptions;
  pinch?: true | IPinchOptions;
  wheel?: true | IWheelOptions;
  clamp?: true | IClampOptions;
  clampZoom?: IClampZoomOptions;
};

export class CustomViewport extends Viewport {
  constructor(options: CustomViewportOptions) {
    const { decelerate, drag, pinch, wheel, clamp, clampZoom, ...rest } =
      options;
    super(rest);

    // Can either pass `true` for these or specific props to control behaviour
    if (decelerate) {
      if (typeof decelerate === "boolean") {
        this.decelerate();
      } else {
        this.decelerate(decelerate);
      }
    }
    if (drag) {
      if (typeof drag === "boolean") {
        this.drag();
      } else {
        this.drag(drag);
      }
    }
    if (pinch) {
      if (typeof pinch === "boolean") {
        this.pinch();
      } else {
        this.pinch(pinch);
      }
    }
    if (wheel) {
      if (typeof wheel === "boolean") {
        this.wheel();
      } else {
        this.wheel(wheel);
      }
    }
    if (clamp) {
      if (typeof clamp === "boolean") {
        this.clamp();
      } else {
        this.clamp(clamp);
      }
    }
    if (clampZoom) {
      this.clampZoom(clampZoom);
    }
  }
}
