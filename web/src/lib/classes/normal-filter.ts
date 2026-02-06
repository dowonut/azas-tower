import {
  Filter,
  GlProgram,
  Texture,
  UniformGroup,
  type FilterOptions,
} from "pixi.js";

import vertex from "../../assets/shaders/shader.vert";
import fragment from "../../assets/shaders/shader.frag";

export type NormalFilterOptions = {
  normalTexture: Texture;
};

export class NormalFilter extends Filter {
  public static readonly DEFAULT_OPTIONS: FilterOptions = {
    clipToViewport: false,
  };

  public uniforms: {
    uLight: Float32Array;
    uFrame: Float32Array;
  };

  constructor({ normalTexture }: NormalFilterOptions) {
    // Create frame data
    const uFrame = new Float32Array([
      normalTexture.frame.x / normalTexture.source.width,
      normalTexture.frame.y / normalTexture.source.height,
      normalTexture.frame.width / normalTexture.source.width,
      normalTexture.frame.height / normalTexture.source.height,
    ]);

    // Create uniforms
    const normalUniforms = new UniformGroup({
      //   res: {
      //     value: new Float32Array([innerWidth, innerHeight]),
      //     type: "vec2<f32>",
      //   },
      uLight: { value: new Float32Array(4), type: "vec4<f32>" },
      uFrame: {
        value: uFrame,
        type: "vec4<f32>",
      },
    });

    normalUniforms.uniforms.uLight[2] = 0.0;
    normalUniforms.uniforms.uLight[3] = 1.0;

    // Create resources
    const resources = {
      normalUniforms,
      uNormalTexture: normalTexture.source,
    };

    // Create WebGL program
    const glProgram = GlProgram.from({ vertex, fragment });

    // Create Filter
    super({ glProgram, resources, ...NormalFilter.DEFAULT_OPTIONS });

    this.uniforms = this.resources.normalUniforms.uniforms;
  }
}
