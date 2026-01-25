import { Sprite, Texture, type PointData, type SpriteOptions } from "pixi.js";

/**
 * Extended Pixi.js Sprite with pixel-perfect hit detection using texture alpha
 */
export class PerfectSprite extends Sprite {
  constructor(options?: SpriteOptions | Texture) {
    super(options);
    this.generateHitmap();
  }

  containsPoint(point: PointData) {
    // Exit early if point is not within bounding box
    if (!this.bounds.containsPoint(point.x, point.y)) return false;

    return this.checkHitmap(point);
  }

  /**
   * Check the hitmap at a given point
   *
   * Returns true if the given point is valid in the hitmap
   */
  checkHitmap(point: PointData): boolean {
    const { x, y } = point;
    const texture = this.texture;
    const textureSource = texture.source;
    const resolution = textureSource.resolution;
    const hitmap = textureSource.hitmap;

    // Generate missing hitmap
    if (!hitmap && !this.generateHitmap()) {
      // Return false if hitmap fails to generate
      if (!this.generateHitmap()) return false;
    }

    // Account for texture frame offset and resolution
    const width = this._texture.orig.width;
    const height = this._texture.orig.height;
    const anchorOffsetX = -width * this.anchor.x;
    const anchorOffsetY = -height * this.anchor.y;
    const textureX = Math.floor(
      (x - anchorOffsetX + texture.frame.x) * resolution,
    );
    const textureY = Math.floor(
      (y - anchorOffsetY + texture.frame.y) * resolution,
    );

    // Calculate index in the hitmap
    const pixelIndex = textureX + textureY * textureSource.pixelWidth;
    const bitIndex = pixelIndex % 32;
    const arrayIndex = (pixelIndex / 32) | 0;

    // Check if pixel is valid
    const valid = (hitmap!?.[arrayIndex] & (1 << bitIndex)) !== 0;

    return valid;
  }

  /** Generate a hitmap containing information about pixel opacity based on some threshold */
  generateHitmap(threshold: number = 255): boolean {
    const textureSource = this.texture.source;
    if (textureSource.hitmap !== undefined) return true;
    const imageSource = textureSource.resource;

    if (!imageSource) {
      console.warn("No image source:", this.texture);
      return false;
    }

    // Initialize canvas
    let canvas: HTMLCanvasElement | null = null;
    let context: CanvasRenderingContext2D | null = null;

    // Handle canvas source
    if (imageSource instanceof HTMLCanvasElement) {
      console.info("Image source is canvas");
      canvas = imageSource;
      context = canvas.getContext("2d");
    }

    // Handle image source
    else if (
      imageSource instanceof ImageBitmap ||
      imageSource instanceof Image
    ) {
      console.info("Image source is image");
      canvas = document.createElement("canvas");
      canvas.width = imageSource.width;
      canvas.height = imageSource.height;
      context = canvas.getContext("2d");
      context?.drawImage(imageSource, 0, 0);
    }

    // Handle other source
    else {
      console.warn("Image source is other", imageSource);
      return false;
    }

    if (!context) {
      console.error("Failed to create context");
      return false;
    }

    const { width, height } = canvas;
    let imageData = context.getImageData(0, 0, width, height);
    // Create hitmap array (store pixel data using 32-bit integers)
    const hitmap = new Uint32Array(Math.ceil((width * height) / 32));
    // Populate array
    for (let i = 0; i < width * height; i++) {
      // Get index within the integer
      let bitIndex = i % 32;
      // Get index within the array
      // The 0 is used to floor the value
      let arrayIndex = (i / 32) | 0;

      // Check every 4th value of image data (alpha number; opacity of the pixel)
      // If it's visible add to the array
      if (imageData.data[i * 4 + 3] >= threshold) {
        hitmap[arrayIndex] = hitmap[arrayIndex] | (1 << bitIndex);
      }
    }

    console.log(`Finished generating hitmap for texture source`);
    textureSource.hitmap = hitmap;

    return true;
  }
}
