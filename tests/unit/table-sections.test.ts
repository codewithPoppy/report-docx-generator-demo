import { doesNotReject } from "assert";
import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject } from "./test-utils";
import testData from "./__mocks__/style-table/style-table.data";

describe("Table sections", () => {
  it("Section with label", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].sections = {
      field: "TEXT0",
      showFieldLabel: true
    };
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Section without label", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].sections = {
      field: "TEXT0",
      showFieldLabel: false
    };
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Section with label style", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].sections = {
      field: "TEXT0",
      showFieldLabel: true,
      labelStyle: {
        bgColor: [{
          value: "#fddfdf",
          conditionType: "ALL"
        }],
        textBold: [{
          value: 'a',
          conditionType: "ALL"
        }],
        textSize: [{
          value: '40',
          conditionType: "ALL"
        }]
      }
    };
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Section with value style", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.readyComponents[0].sections = {
      field: "TEXT0",
      showFieldLabel: true,
      valueStyle: {
        bgColor: [{
          value: "green",
          conditionType: "ALL"
        }],
        textBold: [{
          value: 'a',
          conditionType: "ALL"
        }],
        textSize: [{
          value: '60',
          conditionType: "EQUALS",
          conditionValue: "Inside"
        }]
      }
    };
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
});
