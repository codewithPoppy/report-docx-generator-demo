import {config} from "aws-sdk";

import * as dotenv from "dotenv";
import { FilesProvider } from "./files-provider";
import { IReportResult, ReportGenerator } from "./report-generator";
import { DataProvider } from "./data-provider";
import { ResultSender } from "./result-sender";
import { Context } from "./context";

dotenv.config();
export class Server {
  async start() {
    console.log(process.env);
    const { ACCOUNT_ID, REPORT_ID, REPORT_PARAMS_ID } = process.env;
    config.update({
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    });
    const reportGenerator = new ReportGenerator(
      new DataProvider(ACCOUNT_ID),
      new FilesProvider(),
      new ResultSender(ACCOUNT_ID, REPORT_ID),
      new Context(new Date())
    );

    const result: IReportResult = await reportGenerator.generate(REPORT_PARAMS_ID);
    return result;

  }

  async test(testData) {
    const reportGenerator = new ReportGenerator(null, null, null, new Context(new Date()),testData);
    const result: IReportResult = await reportGenerator.generate(null);
    return result;
  }
}

// new Server().start();
