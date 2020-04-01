import { Placeholders } from "./data/Placeholders";
import { ProjectFields } from "./data/ProjectFields";
import { ItemsStruct } from "./data/ItemsStruct";
import { ReadyComponents } from "./data/ReadyComponents";
import { Items } from "./data/Items";
import { StyleFields } from "./data/Style";
import path from "path";
import { FilesProvider } from "./files-provider";
import { TemplateDownloader } from "./templates-downloader";
import { dirSync } from "tmp";
import { Context } from "./context";
import { DataProvider } from "./data-provider";
import { ResultSender } from "./result-sender";
import fs from "fs";
import { S3 } from "aws-sdk";
import Logger from "./logger";
import { Formulas } from "./data/Formulas";
import { InputDataNotProvided, TemapltePathIsRequired } from "./error-messages";

const INPUT_FOLDER = "simple-table";

export interface IReportResult {
  valid: boolean;
  reportId?: string;
  filename?: string;
  content?: String;
  errorMessage?: string;
}

export class ReportGenerator {
  private dataProvider: DataProvider;
  private filesProvider: FilesProvider;
  private resultSender: ResultSender;
  private _context: Context;
  private _logger;
  private testData;

  constructor(
    dataProvider: DataProvider,
    filesProvider: FilesProvider,
    resultSender: ResultSender,
    context: Context,
    testData?
  ) {
    this.dataProvider = dataProvider;
    this.filesProvider = filesProvider;
    this.resultSender = resultSender;
    this._context = context;
    this._logger = new Logger("ReportGenerator");
    this.testData = testData;
  }

  async generate(reportParamsId: any): Promise<IReportResult> {
    if (reportParamsId) {
      const tmpDir = dirSync();
      this._context.getRelativeFileFinder().setFolder(tmpDir.name);
      this._logger.debug(tmpDir.name);
    } else {
      this._context
        .getRelativeFileFinder()
        .setFolder(path.normalize(__dirname + `/../tests/unit/__mocks__/${this.testData?.templatesPath}`));
    }

    const data = await this.prepareData(reportParamsId);
    let items, reportParams, reportDefinition, itemFieldsStruct;
    if (data) {
      items = data.items;
      reportParams = data.reportParams;
      reportDefinition = data.reportDefinition;
      itemFieldsStruct = data.itemFieldsStruct;
    } else {
      return { valid: false, errorMessage: InputDataNotProvided };
    }
    /* Read the template metadata from JSON files */
    this._context.getTemplater().imgPath =
      path.resolve(this._context.getRelativeFileFinder().getFolder(), "efs-images/optimized") || "";
    /* Load JSON template data */
    StyleFields.loadData(this._context, reportDefinition["style"]);
    Placeholders.loadData(this._context, reportDefinition["placeholderMetadata"]);

    // Data
    if (reportParams["projectFields"]) {
      ProjectFields.loadData(this._context, reportParams["projectFields"]);
    }

    ItemsStruct.loadData(this._context, itemFieldsStruct);
    ReadyComponents.loadData(this._context, reportDefinition["readyComponents"]);
    Formulas.loadData(this._context, reportDefinition["formulas"]);

    Items.loadData(this._context, items);

    if(!reportDefinition["general"] || !reportDefinition["general"].templatePath) {
      return { valid: false, errorMessage: TemapltePathIsRequired };
    }
    /* Create the new document from the template */
    this._context
      .getTemplater()
      .create(
        reportDefinition["general"]?.templatePath,
        reportParams["attachments"] || [],
        reportDefinition["attachments"] || [],
        reportParams["conditionalPart"] || [],
        reportDefinition["settings"] || {}
      );

    /* Replace each markup for the real content */
    let docXmlText = "";
    try {
      docXmlText = this._context.getTemplater().replace();

    } catch (error) {
      const e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties
      };
      this._logger.error("Error replazing markups", e);
      this.handleError(reportParamsId);
      return { valid: false };
    }

    /* Save the new document */
    const saveParams = this._context.getTemplater().getSaveParams();
    this.saveFile(reportParamsId, saveParams.fileName, saveParams.buffer);
    return { valid: true, reportId: reportParamsId, filename: saveParams.fileName, content: docXmlText };
  }

  handleError(reportParamsId: any) {
    if (reportParamsId) {
      this.resultSender.updateStatusFailed();
    }
  }

  saveFile(reportParamsId: any, fileName: any, buffer: any) {
    if (reportParamsId) {
      const s3 = new S3();
      const params = {
        Bucket: process.env.RESULTS_BUCKET,
        Key: fileName,
        Body: buffer
      };
      s3.upload(params, (err: any, data: any) => {
        if (err) {
          this._logger.error(err);
          throw err;
        }
        this.resultSender.updatePath(data.Location).then(() => {
          this._logger.debug("File uploaded successfully.", { location: data.Location });
        });
      });
    } else if(process.env.WRITE_LOCAL_TEST_FILE) {
        fs.writeFileSync(__dirname + "/../test/output/" + fileName, buffer);
    }
  }

  async prepareData(reportParamsId: any) {
    if (reportParamsId) {
      return await this.fetchData(reportParamsId);
    }

    return await this.testData;
  }

  private async fetchData(reportParamsId: any) {
    this.resultSender.updateStatusStarted();
    this._logger.debug("Starting to generate new report", { id: reportParamsId });
    const reportParams = await this.dataProvider.getReportParams(reportParamsId);
    if (
      !reportParams ||
      !reportParams.projectId ||
      !reportParams.accountId ||
      !reportParams.reportDefinitionId
    ) {
      this._logger.error("Report Data was not found or invalid", { error: reportParams });
      this.resultSender.updateStatusFailed();
      return undefined;
    }

    this._logger.debug("Getting data from remote server");
    const reportDefinition = await this.dataProvider.getReportDefinition(
      reportParams.reportDefinitionId
    );
    const items = await this.dataProvider.getItems(reportParams.projectId);
    const itemFieldsStruct = await this.dataProvider.getFields();
    this._logger.debug("Done getting data from remote server");

    /* get definition */
    if (!reportDefinition) {
      this._logger.error("Definition was not found");
      this.resultSender.updateStatusFailed();
      return undefined;
    }

    await new TemplateDownloader(this.filesProvider).download(
      reportDefinition,
      this._context.getRelativeFileFinder().getFolder()
    );
    return { items, reportParams, itemFieldsStruct, reportDefinition };
  }
}
