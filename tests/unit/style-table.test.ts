import { doesNotReject } from "assert";
import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject } from "./test-utils";
import testData from "./__mocks__/style-table/style-table.data";

describe("Table style", () => {
  it("Repeat header", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.repeatHeader = true;
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
  
  it("Align right and fixed width", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.align = "right";
    localtestData.reportDefinition.style[0].style.fixedWidth = "300";
    localtestData.reportDefinition.readyComponents[0].fieldsToShow = [
      "NUMBER0",
      "TEXT1",
      "NUMBER1",
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Align center and fixed width", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.align = "center";
    localtestData.reportDefinition.style[0].style.fixedWidth = "400";
    localtestData.reportDefinition.readyComponents[0].fieldsToShow = [
      "NUMBER0",
      "TEXT1",
      "NUMBER1",
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Align left and fixed width", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.align = "left";
    localtestData.reportDefinition.style[0].style.fixedWidth = "200";
    localtestData.reportDefinition.readyComponents[0].fieldsToShow = [
      "NUMBER0",
      "TEXT1",
      "NUMBER1",
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Global row height 50", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.rowHeight = "50";
    localtestData.reportDefinition.readyComponents[0].fieldsToShow = [
      "NUMBER0",
      "TEXT1",
      "NUMBER1",
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Table border", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.tableBorder = [
      { type: "ALL", width: 4, color: "#e1e1e1" },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Cell border", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.cellBorder = [
      {
        width: 2,
        color: "yellow",
        condition: {
          field: "NUMBER2",
          type: "ALL",
        },
      },
      {
        width: 2,
        color: "red",
        condition: {
          field: "NUMBER2",
          type: "ABOVE",
          value: 99,
        },
      },
      {
        width: 2,
        color: "blue",
        condition: {
          field: "NUMBER2",
          type: "UNDER",
          value: 100,
        },
      },
      {
        width: 2,
        color: "pink",
        condition: {
          field: "NUMBER2",
          type: "EQUALS",
          value: 164,
        },
      },
      {
        width: 2,
        color: "pink",
        condition: {
          field: "NUMBER2",
          type: "EQUALS",
          value: 711,
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
});
