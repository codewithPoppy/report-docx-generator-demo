import { FilesProvider } from "./files-provider";
import * as fs from "fs";
import Logger from "./logger";

export class TemplateDownloader {
  private filesProvider: FilesProvider;
  private _logger;

  constructor(filesProvider: FilesProvider) {
    this.filesProvider = filesProvider;
    this._logger = new Logger("TemplateDownloader");
  }

  async download(definitions: any, tmpDirName: any) {
    return new Promise((resolve, reject) => {
      const promises: Promise<{ key: string; content: any }>[] = [];
      const fileNames: string[] = [];

      let templatePromise = this.filesProvider.getFile(definitions.general.templatePath);
      promises.push(templatePromise);
      fileNames.push(definitions.general.templatePath);

      if (definitions.settings.header) {
        templatePromise = this.filesProvider.getFile(definitions.settings.header.path);
        promises.push(templatePromise);
        fileNames.push(definitions.settings.header.path);
      }

      if (definitions.settings.footer) {
        templatePromise = this.filesProvider.getFile(definitions.settings.footer.path);
        promises.push(templatePromise);
        fileNames.push(definitions.settings.footer.path);
      }

      definitions.readyComponents?.forEach((readyComponent: any) => {
        if (readyComponent.templateName && !fileNames.includes(readyComponent.templateName)) {
          templatePromise = this.filesProvider.getFile(readyComponent.templateName);
          promises.push(templatePromise);
          fileNames.push(readyComponent.templateName);
        }
      });
      definitions.attachments?.forEach((attachment: any) => {
        if (attachment.path && !fileNames.includes(attachment.path)) {
          templatePromise = this.filesProvider.getFile(attachment.path);
          promises.push(templatePromise);
          fileNames.push(attachment.path);
        }
      });
      Promise.all(promises)
        .then((values) => {
          values.forEach((file) => {
            fs.writeFileSync(tmpDirName + "/" + file.key, file.content);
            this._logger.debug("done downloding", { key: file.key });
          });
          this._logger.debug("Templates downloaded", { templates: values });
          resolve(values);
        })
        .catch((error) => {
          this._logger.error("Error dowloading templates", { error: error });
          reject(error);
        });
    });
  }
}
