import { InputDataNotProvided, TemapltePathIsRequired } from "../../src/error-messages";
import { IReportResult } from "../../src/report-generator";
import { Server } from "../../src/server";
import testData from "./__mocks__/false-cases.data";

describe("False cases", () => {
    it("Empty params should be invalid", async () =>  {
        const server = new Server();
        const result: IReportResult = await server.test(testData);
        expect(result.valid).toBeFalsy();
        expect(result.errorMessage).toMatch(TemapltePathIsRequired)
    });
    it("Undefiend params should be invalid", async () =>  {
        const server = new Server();
        const result: IReportResult = await server.test(null);
        expect(result.valid).toBeFalsy();
        expect(result.errorMessage).toMatch(InputDataNotProvided)
    });
});