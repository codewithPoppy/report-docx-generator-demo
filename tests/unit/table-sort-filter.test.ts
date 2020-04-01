import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject, getResult, saveResultAsFile } from "./test-utils";
import testData, { items } from "./__mocks__/simple-table/simple-table.data";

describe("Table sorts and filters", () => {
  it("DESC sort", async () => {
    const server = new Server();
    const result: IReportResult = await server.test(testData);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
  it("ASC sort", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].sortByDirection = "ASC";
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
  it("EQUALS filter", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].filterByFieldAndValue = [
      {
        field: "NUMBER0",
        filterType: "EQUALS",
        value: 1,
      },
    ];
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Number ABOVE filter", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].filterByFieldAndValue = [
      {
        field: "NUMBER0",
        filterType: "ABOVE",
        value: 1,
      },
    ];
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Number UNDER filter", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].filterByFieldAndValue = [
      {
        field: "NUMBER0",
        filterType: "UNDER",
        value: 2,
      },
    ];
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Text CONTAINS filter'", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].filterByFieldAndValue = [
      {
        field: "TEXTAREA",
        filterType: "CONTAINS",
        value: "are you m",
      },
    ];
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Text EQUALS filter'", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].filterByFieldAndValue = [
      {
        field: "TEXT1",
        filterType: "EQUALS",
        value: "hi all",
      },
    ];
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Text sort ASC'", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].fieldsToShow = [
      "TEXT2",
      ...testDataAsc.reportDefinition.readyComponents[0].fieldsToShow,
    ];
    testDataAsc.reportDefinition.readyComponents[0].sortByField = "TEXT2";
    testDataAsc.reportDefinition.readyComponents[0].sortByDirection = "ASC";
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });

  it("Text sort DESC'", async () => {
    const server = new Server();
    const testDataAsc = cloneObject(testData);
    testDataAsc.reportDefinition.readyComponents[0].fieldsToShow = [
      "TEXT2",
      ...testDataAsc.reportDefinition.readyComponents[0].fieldsToShow,
    ];
    testDataAsc.reportDefinition.readyComponents[0].sortByField = "TEXT2";
    testDataAsc.reportDefinition.readyComponents[0].sortByDirection = "DESC";
    const result: IReportResult = await server.test(testDataAsc);
    expect(result.valid).toBeTruthy();
    expect(result.content).toMatchSnapshot();
  });
});
