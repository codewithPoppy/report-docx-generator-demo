import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { cloneObject } from "./test-utils";
import testData from "./__mocks__/grouped-table/grouped-table.data";

describe("Grouped Table", () => {
    it("AVG, SUM, LIST, COUNT", async () =>  {
        const server = new Server();
        const testDataCloned = cloneObject(testData);
        const result: IReportResult = await server.test(testDataCloned);
        expect(result.valid).toBeTruthy();
        expect(result.content).toMatchSnapshot();
    });

    it("Total row", async () =>  {
        const server = new Server();
        const testDataCloned = cloneObject(testData);
        testDataCloned.reportDefinition.readyComponents[0].totalRow = [{
            field: "sumAllNumber",
            type: "AVG",
            label: "Avarage is:"
          },
          {
            field: "avgOfNumbers",
            type: "SUM"
          }];
        const result: IReportResult = await server.test(testDataCloned);
        expect(result.valid).toBeTruthy();
        expect(result.content).toMatchSnapshot();
    });

    it("Sort AVG desc", async () =>  {
        const server = new Server();
        const testDataCloned = cloneObject(testData);
        testDataCloned.reportDefinition.readyComponents[0].sortByField = "avgOfNumbers";
        testDataCloned.reportDefinition.readyComponents[0].sortByDirection = "DESC";
        const result: IReportResult = await server.test(testDataCloned);
        expect(result.valid).toBeTruthy();
        expect(result.content).toMatchSnapshot();
    });

    it("Sort SUM asc", async () =>  {
        const server = new Server();
        const testDataCloned = cloneObject(testData);
        testDataCloned.reportDefinition.readyComponents[0].sortByField = "sumAllNumber";
        testDataCloned.reportDefinition.readyComponents[0].sortByDirection = "ASC";
        const result: IReportResult = await server.test(testDataCloned);
        expect(result.valid).toBeTruthy();
        expect(result.content).toMatchSnapshot();
    });
});