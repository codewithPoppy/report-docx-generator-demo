import Logger from "./logger";
import axios from 'axios';

export class ResultSender {
  private accountId: any;
  private reportId: any;
  private _logger;

  constructor(accountId: any, reportId: any) {
    this.accountId = accountId;
    this.reportId = reportId;
    this._logger = new Logger("ResultSender");
  }

  updatePath(docPath: string) {
    this._logger.debug("Updating report status and path", { path: docPath });
    return this.put(this.accountId, `api/report/update-path`, {
      reportId: this.reportId,
      docPath: docPath
    });
  }

  updateStatusFailed() {
    return this.put(this.accountId, `api/report/update-status-faild`, { reportId: this.reportId });
  }

  updateStatusStarted() {
    return this.put(this.accountId, `api/report/update-status-started`, {
      reportId: this.reportId
    });
  }

  private put(accountId: any, path: any, data: any) {
    this._logger.debug("Going to send put request", { path, data });
    const strData = JSON.stringify(data);
    return new Promise((resolve, reject) => {
      axios
        .put(`${process.env.HOST_URL}/${path}`, 
        strData,
        {
          headers: {
            "Content-Length": strData.length,
            "Content-Type": "application/json",
            secret: process.env.HOST_SECRET,
            account: accountId
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
