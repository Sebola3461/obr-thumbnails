import { CanvasRenderingContext2D, ImageData } from "canvas";

interface IBlurParameters {
	imageData: ImageData;
	x: number;
	y: number;
	width: number;
	height: number;
	sigma: number;
	kernelSize: number;
}

type GaussianKernel = number[][];

export class GaussianBlurFilter {
	public readonly ctx;
	public readonly imageData;
	public readonly x;
	public readonly y;
	public readonly width;
	public readonly height;
	public readonly kernelSize;
	public readonly sigma;
	private readonly kernel: GaussianKernel;

	constructor(
		ctx: CanvasRenderingContext2D,
		{ imageData, x, y, width, height, kernelSize, sigma }: IBlurParameters
	) {
		this.ctx = ctx;
		this.imageData = imageData;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.kernelSize = kernelSize;
		this.sigma = sigma;
		this.kernel = this.getGaussianKernel({
			size: this.kernelSize,
			sigma: this.sigma,
		});
	}

	// Gaussian blur kernel
	private getGaussianKernel({
		size,
		sigma,
	}: {
		size: number;
		sigma: number;
	}): GaussianKernel {
		const kernel: number[][] = [];
		const mean = size / 2;
		let sum = 0.0; // For accumulating the kernel values

		for (let x = 0; x < size; x++) {
			kernel[x] = [];
			for (let y = 0; y < size; y++) {
				kernel[x][y] =
					Math.exp(
						-0.5 *
							(Math.pow((x - mean) / sigma, 2.0) +
								Math.pow((y - mean) / sigma, 2.0))
					) /
					(2 * Math.PI * sigma * sigma);
				sum += kernel[x][y];
			}
		}

		// Normalize the kernel
		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				kernel[x][y] /= sum;
			}
		}

		return kernel;
	}

	public apply() {
		const data = this.imageData.data;
		const canvasWidth = this.imageData.width;
		const canvasHeight = this.imageData.height;
		const blurredData = new Uint8ClampedArray(data.length);
		const kernelSize = this.kernel.length;
		const halfKernel = Math.floor(kernelSize / 2);

		for (let cy = this.y; cy < this.y + this.height; cy++) {
			for (let cx = this.x; cx < this.x + this.width; cx++) {
				let r = 0,
					g = 0,
					b = 0,
					a = 0;
				for (let ky = 0; ky < kernelSize; ky++) {
					for (let kx = 0; kx < kernelSize; kx++) {
						const ix = Math.min(
							canvasWidth - 1,
							Math.max(0, cx + kx - halfKernel)
						);
						const iy = Math.min(
							canvasHeight - 1,
							Math.max(0, cy + ky - halfKernel)
						);
						const index = (iy * canvasWidth + ix) * 4;
						const weight = this.kernel[kx][ky];
						r += data[index] * weight;
						g += data[index + 1] * weight;
						b += data[index + 2] * weight;
						a += data[index + 3] * weight;
					}
				}
				const index = (cy * canvasWidth + cx) * 4;
				blurredData[index] = r;
				blurredData[index + 1] = g;
				blurredData[index + 2] = b;
				blurredData[index + 3] = a;
			}
		}

		// Copy the blurred data back to the original image data
		for (let cy = this.y; cy < this.y + this.height; cy++) {
			for (let cx = this.x; cx < this.x + this.width; cx++) {
				const index = (cy * canvasWidth + cx) * 4;
				data[index] = blurredData[index];
				data[index + 1] = blurredData[index + 1];
				data[index + 2] = blurredData[index + 2];
				data[index + 3] = blurredData[index + 3];
			}
		}

		this.ctx.putImageData(this.imageData, this.x, this.y);
	}
}
