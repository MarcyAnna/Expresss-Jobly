"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */


describe("POST /jobs", function () {
    test("ok for admin", async function () {
      const res = await request(app)
          .post(`/jobs`)
          .send({
            company_handle: "c1",
            title: "J-new",
            salary: 10,
            equity: "0.2",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({
        job: {
          id: expect.any(Number),
          title: "J-new",
          salary: 10,
          equity: "0.2",
          company_handle: "c1",
        },
      });
    });
  
    test("unauth for users", async function () {
      const res = await request(app)
          .post(`/jobs`)
          .send({
            company_handle: "c1",
            title: "J-new",
            salary: 10,
            equity: "0.2",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(res.statusCode).toEqual(401);
    });
  
    test("bad request with missing data", async function () {
      const res = await request(app)
          .post(`/jobs`)
          .send({
            company_handle: "c1",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for all users", async function () {
      const res = await request(app).get(`/jobs`);
      expect(res.body).toEqual({
            jobs: [
              {
                id: expect.any(Number),
                title: "J1",
                salary: 1,
                equity: "0.1",
                company_handle: "c1",
              },
              {
                id: expect.any(Number),
                title: "J2",
                salary: 2,
                equity: "0.2",
                company_handle: "c1",
              },
              {
                id: expect.any(Number),
                title: "J3",
                salary: 3,
                equity: null,
                company_handle: "c1",
              },
            ],
          },
      );
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("works for all users", async function () {
      const res = await request(app).get(`/jobs/${testJobIds[0]}`);
      expect(res.body).toEqual({
        job: {
          id: testJobIds[0],
          title: "J1",
          salary: 1,
          equity: "0.1",
          company_handle: "c1",
          company: {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            num_employees: 1,
            logo_url: "http://c1.img",
          },
        },
      });
    });
  
    test("id not found", async function () {
      const res = await request(app).get(`/jobs/0`);
      expect(res.statusCode).toEqual(404);
    });
  });

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("ok for admin", async function () {
      const res = await request(app)
          .patch(`/jobs/${testJobIds[0]}`)
          .send({
            title: "J-New",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(res.body).toEqual({
        job: {
          id: expect.any(Number),
          title: "J-New",
          salary: 1,
          equity: "0.1",
          company_handle: "c1",
        },
      });
    });

    test("unauth for users", async function () {
        const res = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
              title: "Update",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
      });

    test("id not found", async function () {
    const res = await request(app)
    .patch(`/jobs/0`)
    .send({
        title: "Update",
    })
    .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(404);
    });
});


/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("ok for admin", async function () {
      const res = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(res.body).toEqual({ deleted: `${testJobIds[0]}` });
    });

    test("id not found", async function () {
        const res = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
      });
});