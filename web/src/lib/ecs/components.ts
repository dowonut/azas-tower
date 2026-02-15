// import type { PointData, ViewContainer } from "pixi.js";
import { EntityAnimationState, Heading as HeadingEnum } from "../types/enums";

import { Component, ECSComponent } from "@esengine/ecs-framework";
import type { PointData, ViewContainer } from "pixi.js";

// export const Position = [] as PointData[];

// export const DesiredPosition = [] as PointData[];

// export const Layer = [] as number[];

// export const Name = [] as string[];

// export const ConnectionId = [] as string[];

// export const Render = [] as ViewContainer[];

// export const IsSelf = [];

// export const Heading = [] as HeadingEnum[];

// export const AnimationState = [] as EntityAnimationState[];

@ECSComponent("Position")
export class Position extends Component {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }

  set(point: PointData) {
    this.x = point.x;
    this.y = point.y;
  }
}

@ECSComponent("DesiredPosition")
export class DesiredPosition extends Component {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

@ECSComponent("Layer")
export class Layer extends Component {
  value = 0;
}

@ECSComponent("Name")
export class Name extends Component {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}

@ECSComponent("ConnectionId")
export class ConnectionId extends Component {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}

@ECSComponent("Render")
export class Render extends Component {
  container: ViewContainer;

  constructor(container: ViewContainer) {
    super();
    this.container = container;
  }
}

@ECSComponent("IsSelf")
export class IsSelf extends Component {}

@ECSComponent("Heading")
export class Heading extends Component {
  value: HeadingEnum = HeadingEnum.S;
}

@ECSComponent("AnimationState")
export class AnimationState extends Component {
  value: EntityAnimationState = EntityAnimationState.Idle;
}
