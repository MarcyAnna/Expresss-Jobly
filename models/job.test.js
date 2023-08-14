"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let createJob = {
    company_handle: "c1",
    title: "Test_New",
    salary: 100,
    equity: "0.1",
  };

  test("creates new job", async function () {
    let job = await Job.create(createJob);
    expect(job).toEqual({
      ...createJob,
      id: expect.any(Number),
    });
  });
});
/************************************** findAll */

describe("findAll", function () {
    test("lists all jobs", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
        {
          id: testJobIds[0],
          title: "Job1",
          salary: 100,
          equity: "0.1",
          company_handle: "c1",
        },
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 200,
          equity: "0.2",
          company_handle: "c1",
        },
        {
          id: testJobIds[2],
          title: "Job3",
          salary: 300,
          equity: "0",
          company_handle: "c1",
        },
        {
          id: testJobIds[3],
          title: "Job4",
          salary: null,
          equity: null,
          company_handle: "c1",
        },
      ]);
    });
});

/************************************** get */

describe("get", function () {
    test("gets job by id", async function () {
      let job = await Job.get(testJobIds[0]);
      expect(job).toEqual({
        id: testJobIds[0],
        title: "Job1",
        salary: 100,
        equity: "0.1",
        company_handle: "c1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          num_employees: 1,
          logo_url: "http://c1.img",
        },
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.get(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });

/************************************** update */

describe("update", function () {
    let updateData = {
      title: "New",
      salary: 500,
      equity: "0.5",
    };
    test("updates job with data", async function () {
      let job = await Job.update(testJobIds[0], updateData);
      expect(job).toEqual({
        id: testJobIds[0],
        company_handle: "c1",
        ...updateData,
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.update(0, {
          title: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("bad request with no data", async function () {
      try {
        await Job.update(testJobIds[0], {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });  

/************************************** delete */

describe("delete", function () {
    test("deletes job by id", async function () {
      await Job.remove(testJobIds[0]);
      const res = await db.query(
          "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });