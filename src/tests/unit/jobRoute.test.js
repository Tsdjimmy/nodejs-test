const request = require("supertest");
const express = require("express");
const httpStatus = require("http-status");
const jobRoutes = require("../../routes/job.routes");
const { unpaidJobs } = require("../../service/job.service");

jest.mock("../../service/job.service", () => ({
  unpaidJobs: jest.fn(),
}));

const app = express();
app.use("/jobs", jobRoutes);

describe("Jobs Route Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches unpaid jobs successfully with a valid profile ID", async () => {
    const mockUnpaidJobs = [
      {
        id: 2,
        description: "work",
        price: 201,
        paid: null,
        paymentDate: null,
        createdAt: "2024-04-15T11:46:00.099Z",
        updatedAt: "2024-04-15T11:46:00.099Z",
        ContractId: 2,
        Contract: {
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          createdAt: "2024-04-15T11:46:00.099Z",
          updatedAt: "2024-04-15T11:46:00.099Z",
          ContractorId: 6,
          ClientId: 1,
        },
      },
    ];

    unpaidJobs.mockResolvedValueOnce(mockUnpaidJobs);

    const response = await request(app)
      .get("/jobs/unpaid")
      .set("profile_id", "1")
      .expect("Content-Type", /json/)
      .expect(httpStatus.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockUnpaidJobs);
  });

  it("returns an error when Client/Contractor ID is missing", async () => {
    const mockErrorResponse = {
      code: 400,
      message: "Profile ID is missing",
    };

    unpaidJobs.mockResolvedValueOnce(mockErrorResponse);

    const response = await request(app)
      .get("/jobs/unpaid")
      .expect("Content-Type", /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual(mockErrorResponse);
  });
});
