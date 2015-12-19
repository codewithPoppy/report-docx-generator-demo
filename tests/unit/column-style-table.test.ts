import { doesNotReject } from "assert";
import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject } from "./test-utils";
import testData from "./__mocks__/style-table/style-table.data";

describe("Column Style Table", () => {
  it("Col Width", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      { field: "NUMBER0", width: 500 },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col background ABOVE filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "NUMBER2",
        body: {
          bgColor: [
            {
              value: "#ffdf61",
              conditionType: "ABOVE",
              conditionValue: "163",
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col background UNDER filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "NUMBER2",
        body: {
          bgColor: [
            {
              value: "#ffdf61",
              conditionType: "UNDER",
              conditionValue: "165",
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col background ALL filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "TEXT0",
        body: {
          bgColor: [
            {
              value: "#ffdf61",
              conditionType: "ALL",
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col background EQUALS filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "TEXT0",
        body: {
          bgColor: [
            {
              value: "#ffdf61",
              conditionType: "EQUALS",
              conditionValue: "Other",
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col background CONAINS filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "TEXT1",
        body: {
          bgColor: [
            {
              value: "#ffdf61",
              conditionType: "CONTAINS",
              conditionValue: "ommod",
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col text color ABOVE filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "NUMBER2",
        body: {
          textColor: [
            {
              value: "#d8000c",
              conditionType: "ABOVE",
              conditionValue: "163",
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col text size UNDER filter", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "NUMBER2",
        body: {
          textSize: [
            {
              value: "45",
              conditionType: "UNDER",
              conditionValue: "700"
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Col text underline, bold and size", async () => {
    const server = new Server();
    const localtestData = cloneObject(testData);
    localtestData.reportDefinition.style[0].style.columnStyle = [
      {
        field: "TEXT0",
        body: {
          textBold: [
            {
              conditionType: "ALL"
            },
          ],
          textSize: [
            {
              value: "45",
              conditionType: "ALL"
            },
          ],
          textUnderline: [
            {
              value: "single",
              conditionType: "ALL"
            },
          ],
        },
      },
    ];
    const result: IReportResult = await server.test(localtestData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
});

