import AWS from "aws-sdk";
import Logger from "./logger";

export class FilesProvider {
  private _logger;
  constructor() {
    this._logger = new Logger("FilesProvider");
  }
  async getFile(fileName: string) {
    return await this.getFromS3(process.env.PARAMS_BUCKET, fileName);
  }

  getFromS3(bucket: any, key: any) {
    this._logger.debug("Getting file from S3", { key, bucket });
    return new Promise<{ key: string; content: any }>((resolve, reject) => {
      const s3 = new AWS.S3();
      s3.getObject({ Bucket: bucket, Key: key })
        .promise()
        .then((file) => {
          resolve({ key: key, content: file.Body });
        })
        .catch((err) => {
          this._logger.error("Error getting from S3", { error: err });
          reject(err);
        });
    });
  }
}
