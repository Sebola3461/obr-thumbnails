import {
	Canvas,
	CanvasRenderingContext2D,
	createCanvas,
	Image,
	ImageData,
} from "canvas";

interface ISetColorParameters {
	r: number;
	g: number;
	b: number;
}

export class ImageRecolorFilter {
	private readonly image: Image;
	private context!: CanvasRenderingContext2D;
	private canvas!: Canvas;
	private rendered = false;
	private _color: number[] = [255, 255, 255];

	constructor(image: Image) {
		this.image = image;
	}

	public get color() {
		return this._color;
	}

	public setColor({ r, g, b }: ISetColorParameters) {
		this._color = [r, g, b];

		return this;
	}

	public generateRecolorImageData() {
		this.context.drawImage(this.image, 0, 0);

		let result = this.context.getImageData(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		for (let i = 0; i < result.data.length; i += 4) {
			if (result.data[i + 3] != 0) {
				result.data[i] = this._color[0];
				result.data[i + 1] = this._color[1];
				result.data[i + 2] = this._color[2];
			}
		}

		return result;
	}

	private createOffscreenCanvas() {
		this.canvas = createCanvas(this.image.width, this.image.height);
		this.context = this.canvas.getContext("2d", { alpha: true });
	}

	public generateOutputCanvas() {
		if (this.rendered) return this.canvas;

		this.createOffscreenCanvas();

		this.context.putImageData(this.generateRecolorImageData(), 0, 0);

		this.rendered = true;

		return this.canvas;
	}

	public render(context: CanvasRenderingContext2D, x: number, y: number) {
		if (!this.rendered) {
			this.createOffscreenCanvas();

			this.context.putImageData(this.generateRecolorImageData(), 0, 0);
		}

		context.drawImage(this.canvas, x, y);
	}
}
