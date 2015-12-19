import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import { getResult, saveResultAsFile } from "./test-utils";
import testData from "./__mocks__/empty-report/empty-report.data";

describe("Empty positive reports", () => {
    it("Empty params produce empty report", async () =>  {
        const server = new Server();
        const result: IReportResult = await server.test(testData);
        expect(result.valid).toBeTruthy();
        expect(result.content).toMatchSnapshot();
    });
});