import { doesNotReject } from "assert";
import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject } from "./test-utils";
import testData from "./__mocks__/style-table/style-table.data";

describe("Table total row", () => {
  it("Avg with label", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].totalRow = [{
      field: "NUMBER0",
      type: "AVG",
      label: "Avarage is:"
    }];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Sum without label", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].totalRow = [{
      field: "NUMBER0",
      type: "SUM"
    }];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Sum and AVG", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].totalRow = [{
      field: "NUMBER0",
      type: "SUM",
      label: "Total is:"
    },
    {
      field: "NUMBER1",
      type: "AVG",
      label: "Avg is:"
    }];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
});
