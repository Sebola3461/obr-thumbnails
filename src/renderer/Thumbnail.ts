import { createCanvas, Image, loadImage } from "canvas";
import { BeatmapBackground } from "../http/BeatmapBackground";
import {
	ScorePearkType,
	ThumbnailConfig,
} from "../services/models/ThumbnailConfig";
import { writeFileSync } from "fs";
import { GaussianBlurFilter } from "./GaussianBlurFilter";
import { extractColors } from "extract-colors";
import path from "path";
import { ImageRecolorFilter } from "./ImageRecolorFilter";
import { hexToRgb } from "../helpers/hexToRgb";
import { ScoreService } from "../services/models/ScoreService";
import { meshRgb } from "../helpers/meshRgb";
import { rgbToHex } from "../helpers/rgbToHex";
import { calculateRank } from "../helpers/calculateRank";
import { PlayerAvatarFetchRequest } from "../http/PlayerAvatarFetchRequest";
import { PlayerFetchRequest } from "../http/PlayerFetchRequest";
import { ScoreCalculationRequest } from "../pp/ScoreCalculationRequest";
import { StandardModCombination } from "osu-standard-stable";

export class Thumbnail {
	private canvas = createCanvas(1280, 720);
	private ctx = this.canvas.getContext("2d");
	private accentColour: string = "#000000";
	private readonly cornerDecorationImagePath = path.resolve(
		"./assets/corner.svg"
	);
	private readonly starImagePath = path.resolve("./assets/star.svg");
	public readonly config: ThumbnailConfig;
	public readonly score: ScoreService;

	constructor(score: ScoreService, config: ThumbnailConfig) {
		this.config = config;
		this.score = score;
	}

	private async renderBackground() {
		const image = await this.config.background.load();

		const backgroundImage = await loadImage(image);

		this.renderAndCenterImageX(backgroundImage, 0, 720);

		const dominantColors = await extractColors(
			this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
		);

		this.accentColour = dominantColors[3].hex;
	}

	private blurBackground() {
		const blurY = 100;

		const blur = new GaussianBlurFilter(this.ctx, {
			x: 0,
			y: blurY,
			width: 1280,
			height: 720,
			imageData: this.ctx.getImageData(0, blurY, 1280, 720),
			kernelSize: 30,
			sigma: 7,
		});

		blur.apply();
	}

	private renderBackgroundDim() {
		this.ctx.fillStyle = "rgba(0,0,0, 0.75)";
		this.ctx.fillRect(0, 200, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = "rgba(0,0,0, 0.45)";
		this.ctx.fillRect(0, 0, this.canvas.width, 200);
	}

	private async drawOverlayDecoration() {
		const barHeight = 10;

		this.ctx.fillStyle = this.accentColour;

		this.applyShadowEffect({
			color: this.accentColour,
			blur: 20,
			offsetY: -5,
		});
		this.ctx.fillRect(
			0,
			this.canvas.height - barHeight,
			this.canvas.width,
			barHeight
		);

		this.revertShadow();

		this.ctx.fillRect(0, 200 - barHeight, this.canvas.width, barHeight);

		const cornerImage = await loadImage(this.cornerDecorationImagePath);
		const recoloredCornerImage = new ImageRecolorFilter(
			cornerImage
		).setColor(hexToRgb(this.accentColour) || { r: 255, g: 255, b: 255 });

		recoloredCornerImage.render(this.ctx, 0, 0);

		this.ctx.scale(-1, 1);
		this.ctx.translate(-this.canvas.width, 0);
		this.ctx.drawImage(recoloredCornerImage.generateOutputCanvas(), 0, 0);

		this.ctx.resetTransform();
		this.ctx.restore();
	}

	private renderAndCenterImageX(
		image: Image,
		y: number,
		targetHeight: number
	) {
		const scale = Math.max(
			this.canvas.width / image.width,
			targetHeight / image.height
		);

		this.ctx.drawImage(
			image,
			this.canvas.width / 2 - (image.width * scale) / 2,
			y,
			image.width * scale,
			targetHeight
		);
	}

	public drawBeatmapTitle() {
		const maxTextSize = this.canvas.width - 100;

		this.ctx.font = "80px Calibri";

		let textMeasure = this.ctx.measureText(this.score.beatmapData.title);
		let textWidth = 0;

		const textContent = this.cropTextToFit(
			this.score.beatmapData.title,
			maxTextSize
		);

		textMeasure = this.ctx.measureText(textContent);

		textWidth = textMeasure.width;

		const textHeight =
			Math.abs(textMeasure.actualBoundingBoxAscent) +
			Math.abs(textMeasure.actualBoundingBoxDescent);

		const textY = (300 - textHeight) / 2;
		const textX = () => {
			return (this.canvas.width - textWidth) / 2;
		};

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(textContent, textX(), textY);
		this.ctx.fillText(textContent, textX(), textY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({ color: "black" });
		this.ctx.fillText(textContent, textX(), textY);

		this.revertShadow();
	}

	private drawDiffname() {
		const maxTextSize = this.canvas.width - 150;
		this.ctx.font = "60px Calibri";

		const textContent = this.cropTextToFit(
			this.score.beatmapData.version,
			maxTextSize
		);

		let textMeasure = this.ctx.measureText(textContent);
		let textWidth = textMeasure.width;
		const textHeight =
			Math.abs(textMeasure.actualBoundingBoxAscent) +
			Math.abs(textMeasure.actualBoundingBoxDescent);

		const textX = (this.canvas.width - textWidth) / 2;
		const textY = 200 - textHeight / 2;

		const padding = 20;
		const lineDecorationHeight = 5;

		const relativePositionX = textX - padding;
		const relativePositionY = textY - padding + lineDecorationHeight;

		const initialColourAccent = hexToRgb(this.accentColour) || {
			r: 255,
			g: 255,
			b: 255,
		};

		const darkerColourAccent = meshRgb({
			r: initialColourAccent.r,
			g: initialColourAccent.g,
			b: initialColourAccent.b,
			percentage: 0.25,
		});

		this.ctx.beginPath();
		this.ctx.fillStyle = this.accentColour;

		this.ctx.roundRect(
			relativePositionX - 5,
			relativePositionY - 5,
			textWidth + padding + 10,
			textHeight + padding + 10,
			10
		);
		this.ctx.closePath();

		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.fillStyle = `rgb(${Math.round(
			darkerColourAccent.r
		)} ${Math.round(darkerColourAccent.g)} ${Math.round(
			darkerColourAccent.b
		)})`;

		this.ctx.roundRect(
			relativePositionX,
			relativePositionY,
			textWidth + padding,
			textHeight + padding,
			10
		);
		this.ctx.closePath();

		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.fillStyle = "white";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";

		this.applyShadowEffect({});

		this.ctx.closePath();

		this.ctx.fillText(
			textContent,
			relativePositionX + padding / 2,
			relativePositionY + lineDecorationHeight / 2
		);

		this.revertShadow();
	}

	private revertShadow() {
		this.ctx.shadowColor = "none";
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.shadowBlur = 0;
	}

	private async drawRank() {
		const scoreRank = calculateRank(this.score.scoreData);

		const rankingImage = await loadImage(
			this.getRankingImagePath(scoreRank)
		);
		const rankingImageWidth = rankingImage.width * 0.6;
		const rankingImageHeight = rankingImage.height * 0.6;
		const rankingImageX = 0;
		const rankingImageY =
			(this.canvas.height - rankingImageHeight) / 2 + 100;

		this.ctx.drawImage(
			rankingImage,
			rankingImageX,
			rankingImageY,
			rankingImageWidth,
			rankingImageHeight
		);
	}

	private async drawScoreData() {
		this.ctx.font = "70px Calibri";
		this.ctx.fillStyle = "white";

		const darkerColourAccent = meshRgb({
			r: hexToRgb(this.accentColour)?.r || 255,
			g: hexToRgb(this.accentColour)?.g || 255,
			b: hexToRgb(this.accentColour)?.b || 255,
			percentage: 0.25,
		});

		// ============ player name =======
		const playerName = this.score.scoreData.username;

		const playerNameMeasure = this.ctx.measureText(playerName);
		const playerNameMeasureTextWidth = playerNameMeasure.width;
		const playerNameMeasureTextHeight =
			Math.abs(playerNameMeasure.actualBoundingBoxAscent) +
			Math.abs(playerNameMeasure.actualBoundingBoxDescent);

		const playerNameTextX =
			(this.canvas.width - playerNameMeasureTextWidth) / 2;
		const playerNameTextY = 200 + 72 - playerNameMeasureTextHeight / 2;

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(playerName, playerNameTextX, playerNameTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(playerName, playerNameTextX, playerNameTextY);

		this.revertShadow();

		// ============ Middle square =======

		const baseSquareWidth = 280;
		const baseSquareHeight = 280;
		const baseSquareX = (this.canvas.width - baseSquareWidth) / 2;
		const baseSquareY = (this.canvas.height - baseSquareHeight) / 2 + 100;
		const outlineWidth = 10;

		this.ctx.beginPath();
		this.ctx.fillStyle = this.accentColour;

		this.ctx.roundRect(
			baseSquareX - outlineWidth / 2,
			baseSquareY - outlineWidth / 2,
			baseSquareWidth + outlineWidth,
			baseSquareHeight + outlineWidth,
			20
		);
		this.ctx.closePath();

		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.fillStyle = `rgb(${Math.round(
			darkerColourAccent.r
		)} ${Math.round(darkerColourAccent.g)} ${Math.round(
			darkerColourAccent.b
		)})`;

		this.ctx.roundRect(
			baseSquareX,
			baseSquareY,
			baseSquareWidth,
			baseSquareHeight,
			20
		);
		this.ctx.closePath();

		this.ctx.fill();

		// ============ player name and avatar =======

		const playerData = await new PlayerFetchRequest(
			this.score.scoreData.username
		).perform();

		const playerAvatarImageBuffer = await new PlayerAvatarFetchRequest(
			playerData.user_id
		).perform();

		const playerAvatarImage = await loadImage(playerAvatarImageBuffer);

		this.drawRoundedImage(
			playerAvatarImage,
			baseSquareX,
			baseSquareY,
			baseSquareWidth,
			baseSquareHeight,
			20
		);

		// ============ Score statistics =======
		this.ctx.font = "60px Calibri";

		const leftTextInitialX = baseSquareX;
		const leftTextInitialY = baseSquareY + 10;
		const leftTextSpacing = 30;

		// ---------- accuracy text
		const accuracyText = (this.score.scoreData.accuracy * 100)
			.toFixed(2)
			.concat("%")
			.replace(".00", "");
		const accuracyTextMeasure = this.ctx.measureText(accuracyText);

		const accuracyTextX =
			leftTextInitialX - accuracyTextMeasure.width - leftTextSpacing;
		const accuracyTextY =
			leftTextInitialY +
			Math.abs(accuracyTextMeasure.actualBoundingBoxAscent) +
			Math.abs(accuracyTextMeasure.actualBoundingBoxDescent);

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(accuracyText, accuracyTextX, accuracyTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(accuracyText, accuracyTextX, accuracyTextY);

		// ---------- pp text

		const totalPerformance = await new ScoreCalculationRequest(
			this.score.scoreData,
			this.score.beatmapData.beatmap_id
		).perform();

		const performanceText = `${totalPerformance.toFixed(0)}pp`;
		const performanceTextMeasure = this.ctx.measureText(performanceText);

		const performanceTextX =
			leftTextInitialX - performanceTextMeasure.width - leftTextSpacing;
		const performanceTextY =
			accuracyTextY +
			Math.abs(performanceTextMeasure.actualBoundingBoxAscent) +
			Math.abs(performanceTextMeasure.actualBoundingBoxDescent) +
			leftTextSpacing;

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(performanceText, performanceTextX, performanceTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(performanceText, performanceTextX, performanceTextY);

		// ---------- mods text

		const rightTextSpacing = 30;
		const rightTextInitialX =
			baseSquareX + baseSquareWidth + rightTextSpacing;
		const rightTextInitialY = accuracyTextY;

		const modsText = this.getModsText();

		const modsTextX = rightTextInitialX;
		const modsTextY = rightTextInitialY;

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(modsText, modsTextX, modsTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(modsText, modsTextX, modsTextY);

		// ---------- score peark text

		const scorePearkText = this.config.scorePearkText;
		const scorePearkTextMeasure = this.ctx.measureText(scorePearkText);
		const scorePearkTextX = rightTextInitialX;
		const scorePearkTextY = performanceTextY;
		const scorePearkHighlightStyle = this.getPearkHighlightStyle();

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect(scorePearkHighlightStyle);
		this.ctx.fillText(scorePearkText, scorePearkTextX, scorePearkTextY);

		this.ctx.fillStyle = scorePearkHighlightStyle.color;
		this.applyShadowEffect({});
		this.ctx.fillText(scorePearkText, scorePearkTextX, scorePearkTextY);
	}

	private getPearkHighlightStyle() {
		if (this.config.scorePearkType == ScorePearkType.FC)
			return {
				color: "#FFDF40",
				blur: 20,
			};

		if (this.config.scorePearkType == ScorePearkType.MISS)
			return {
				color: "#FF4040",
				blur: 20,
			};

		if (this.config.scorePearkType == ScorePearkType.SB)
			return {
				color: "#ACBFBF",
				blur: 20,
			};

		return {
			color: "white",
			blur: 20,
		};
	}

	private async drawBeatmapStatistics() {
		const panelWidth = 200;
		const panelHeight = 120;
		const panelPositionX = this.canvas.width - panelWidth + 20;
		const panelPositionY = 270;

		const darkerColourAccent = meshRgb({
			r: hexToRgb(this.accentColour)?.r || 255,
			g: hexToRgb(this.accentColour)?.g || 255,
			b: hexToRgb(this.accentColour)?.b || 255,
			percentage: 0.45,
		});

		this.ctx.beginPath();

		this.ctx.fillStyle = `rgb(${Math.round(
			darkerColourAccent.r
		)} ${Math.round(darkerColourAccent.g)} ${Math.round(
			darkerColourAccent.b
		)})`;

		this.ctx.shadowColor = this.accentColour;
		this.ctx.shadowBlur = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.shadowOffsetX = -5;

		this.ctx.roundRect(
			panelPositionX,
			panelPositionY,
			panelWidth,
			panelHeight,
			20
		);

		this.ctx.closePath();

		this.ctx.fill();

		const starIcon = await loadImage(this.starImagePath);
		const starIconWidth = 30;
		const starIconHeight = starIconWidth;
		const starIconX = this.canvas.width - starIconWidth - 10;
		const starIconY = panelPositionY + starIconHeight - 5;

		this.revertShadow();

		this.ctx.drawImage(
			starIcon,
			starIconX,
			starIconY,
			starIconWidth,
			starIconHeight
		);

		this.ctx.font = "500 40px Calibri";

		// -------- star rating text
		const starRatingText = this.score.beatmapData.difficultyrating
			.toFixed(2)
			.replace(".00", "");
		const starRatingTextMeasure = this.ctx.measureText(starRatingText);
		const starRatingTextX = starIconX - starRatingTextMeasure.width - 10;
		const starRatingTextY = starIconY;

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(starRatingText, starRatingTextX, starRatingTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(starRatingText, starRatingTextX, starRatingTextY);

		// --------- combo text

		const comboText = this.score.scoreData.maxCombo.toString().concat("x");
		const comboTextMeasure = this.ctx.measureText(comboText);
		const comboTextHeight =
			Math.abs(comboTextMeasure.actualBoundingBoxAscent) +
			Math.abs(comboTextMeasure.actualBoundingBoxDescent);
		const comboTextX = this.canvas.width - comboTextMeasure.width - 10;
		const comboTextY = starIconY + comboTextHeight / 2 + 25;

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(comboText, comboTextX, comboTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(comboText, comboTextX, comboTextY);
	}

	private getModsText() {
		let result = "+";

		if (this.score.scoreData.rawMods == 0) return "+NM";

		const mods = new StandardModCombination(this.score.scoreData.rawMods)
			.acronyms;

		return result.concat(mods.join(""));
	}

	private drawComment() {
		if (!this.config.comment.trim()) return;

		this.ctx.font = "500 70px Calibri";

		const commentText = this.config.comment;
		const commentTextMeasure = this.ctx.measureText(commentText);
		const commentTextX = (this.canvas.width - commentTextMeasure.width) / 2;
		const commentTextY = this.canvas.height - 100;

		this.ctx.fillStyle = "transparent";
		this.applyShadowEffect({ color: "white", blur: 20 });
		this.ctx.fillText(commentText, commentTextX, commentTextY);

		this.ctx.fillStyle = "white";
		this.applyShadowEffect({});
		this.ctx.fillText(commentText, commentTextX, commentTextY);
	}

	private drawRoundedImage(
		image: Image,
		x: number,
		y: number,
		w: number,
		h: number,
		radius: number
	) {
		this.ctx.save();

		this.ctx.beginPath();
		this.ctx.moveTo(x + radius, y);
		this.ctx.lineTo(x + w - radius, y);
		this.ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
		this.ctx.lineTo(x + w, y + h - radius);
		this.ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
		this.ctx.lineTo(x + radius, y + h);
		this.ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
		this.ctx.lineTo(x, y + radius);
		this.ctx.quadraticCurveTo(x, y, x + radius, y);
		this.ctx.closePath();

		this.ctx.clip();

		this.ctx.drawImage(image, x, y, w, h);

		this.ctx.restore();
	}

	private getRankingImagePath(
		rank: "F" | "D" | "C" | "B" | "A" | "S" | "SH" | "X" | "XH"
	) {
		return path.resolve(`./assets/${rank.replace("F", "D")}.png`);
	}

	private applyShadowEffect({
		color,
		offsetX,
		offsetY,
		blur,
	}: {
		color?: string;
		offsetX?: number;
		offsetY?: number;
		blur?: number;
	}) {
		this.ctx.shadowColor = color || "black";
		this.ctx.shadowOffsetX = offsetX || 3;
		this.ctx.shadowOffsetY = offsetY || 3;
		this.ctx.shadowBlur = blur || 4;
	}

	private cropTextToFit(text: string, maxWidth: number) {
		let croppedText = "";
		let currentWidth = 0;

		for (let i = 0; i < text.length; i++) {
			const charWidth = this.ctx.measureText(text[i]).width;
			if (currentWidth + charWidth <= maxWidth) {
				croppedText += text[i];
				currentWidth += charWidth;
			} else {
				break;
			}
		}

		croppedText = croppedText.trim();

		if (croppedText != text)
			return croppedText.slice(0, croppedText.length - 3).concat("...");

		return text;
	}

	public async render() {
		await this.renderBackground();
		this.blurBackground();
		this.renderBackgroundDim();
		await this.drawOverlayDecoration();
		this.drawBeatmapTitle();
		this.drawDiffname();
		await this.drawRank();
		await this.drawScoreData();
		await this.drawBeatmapStatistics();
		this.drawComment();

		writeFileSync(this.config.outputFileName, this.canvas.toBuffer());
	}
}
