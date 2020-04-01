import Logger from "./logger";
import axios from 'axios';

export class DataProvider {
  private accountId: any;
  private _logger;

  constructor(accountId: any) {
    this.accountId = accountId;
    this._logger = new Logger(`DataProvider${accountId}`);
  }

  getReportDefinition(reportDefinitionId: any) {
    return this.get(`api/report-definition/${reportDefinitionId}`);
  }

  getItems(projectId: any): Promise<any> {
    return this.get(`api/item/project/${projectId}`);
  }

  getReportParams(reportParamsId: any): Promise<any> {
    return this.get(`api/report-params/${reportParamsId}`);
  }

  getFields() {
    return this.get(`api/field`);
  }

  private get(path: any) {
    this._logger.debug("Going to send get request", { path });
    return new Promise((resolve, reject) => {
      axios
        .get(`${process.env.HOST_URL}/${path}`, 
        {
          headers: {
            "Content-Type": "application/json",
            secret: process.env.HOST_SECRET,
            account: this.accountId
          }
        })
        .then((res) => {
          console.log(`statusCode: ${res.statusText}`);
          resolve(res.data);
        })
        .catch((error) => {
          console.error(error);
          reject(false);
        });
    });
  }
}
