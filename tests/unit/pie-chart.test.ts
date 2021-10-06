import { doesNotReject } from "assert";
import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject } from "./test-utils";
import testData from "./__mocks__/pie-chart/pie-chart.data";

describe("Pie chart", () => {
  it("Pie chart with style", async () => {
    jest.setTimeout(30000);
    const server = new Server();
    const localtestData = cloneObject(testData);
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
});
