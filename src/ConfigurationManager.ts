import { LoggerService } from "./services/LoggerService";
import { ScorePearkType } from "./services/models/ThumbnailConfig";
import { ThumbnailManager } from "./ThumbnailManager";
import { existsSync, readFileSync, writeFileSync } from "fs";

interface IConfiguration {
	scoreId: number;
	comment: string;
	pearkText: string;
	displayPeark: ScorePearkType;
	filename: string;
}

export class ConfigurationManager {
	public readonly manager;
	private readonly configurationFileName = "config.json";
	public readonly configurationFilePath = `./${this.configurationFileName}`;
	private configurationData: IConfiguration = this.getDefaultConfiguration();
	private readonly Logger = new LoggerService("ConfigurationManager");

	constructor(manager: ThumbnailManager) {
		this.manager = manager;
	}

	public load() {
		try {
			this.Logger.printInfo("Carregando configuração...");

			if (!existsSync(this.configurationFilePath))
				this.createDefaultConfigurationFile();

			const fileData: IConfiguration = JSON.parse(
				readFileSync(this.configurationFilePath, "utf8")
			);

			if (typeof fileData.scoreId != "number")
				return this.handleInvalidFileError("ScoreId Inválido");
			if (typeof fileData.comment != "string")
				return this.handleInvalidFileError("Comentário Inválido");
			if (typeof fileData.filename != "string")
				return this.handleInvalidFileError("Filename Inválido");
			if (
				typeof fileData.displayPeark != "number" &&
				![
					ScorePearkType.FC,
					ScorePearkType.MISS,
					ScorePearkType.SB,
				].includes(fileData.displayPeark)
			)
				return this.handleInvalidFileError(
					"O displayPeark deve ser: 0 = FC, 1 = Miss, 2 = SB"
				);
			if (typeof fileData.pearkText != "string")
				return this.handleInvalidFileError(
					"O pearkText deve ser uma string!"
				);

			this.configurationData.scoreId = fileData.scoreId;
			this.configurationData.comment = fileData.comment;
			this.configurationData.filename = fileData.filename;
			this.configurationData.displayPeark = fileData.displayPeark;
			this.configurationData.pearkText = fileData.pearkText;

			this.Logger.printSuccess("Configuração carregada!");
		} catch (e) {
			this.handleInvalidFileError("Arquivo não é um JSON");
		}
	}

	private handleInvalidFileError(reason: string) {
		this.Logger.printError(
			"Não foi possível carregar o arquivo de configuração:",
			reason
		);

		process.exit(1);
	}

	private createDefaultConfigurationFile() {
		this.Logger.printInfo("Gerando novo arquivo de configuração");

		writeFileSync(
			this.configurationFilePath,
			JSON.stringify(this.getDefaultConfiguration())
		);

		this.Logger.printSuccess("Novo arquivo de configuração gerado");
	}

	private getDefaultConfiguration() {
		return {
			scoreId: -1,
			comment: "Play muito foda",
			pearkText: "FC",
			displayPeark: 3,
			filename: "output.png",
		};
	}

	public getScoreId() {
		return this.configurationData.scoreId;
	}

	public getComment() {
		return this.configurationData.comment;
	}

	public getFileName() {
		return this.configurationData.filename;
	}

	public getPearkType() {
		return this.configurationData.displayPeark;
	}

	public getPearkText() {
		return this.configurationData.pearkText;
	}
}
