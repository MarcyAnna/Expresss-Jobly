"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Functions for jobs */
class Job{
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { id, title, salary, equity, company_handle } And
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws BadRequestError if job already in database.
     * */
  
    static async create({ title, salary, equity, company_handle }) {
      const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle`,
          [ 
            title, 
            salary, 
            equity, 
            company_handle
          ],
      );
      const job = result.rows[0];
  
      return job;
    }

     /** Find all jobs with optional search filters
     * optional searchFilters = title, minSalary, hasEquity
     * title search is case insensitive and will find partial matches
     *
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     * */

    static async findAll(searchFilters = {}) {
        let sqlQuery = `SELECT j.id,
                j.title,
                j.salary,
                j.equity,
                j.company_handle FROM jobs j LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        /** empty array to add where expressions for the search filters in the sql query*/
        let addWhere = [];
        /** empty array to add query values to the sql query */
        let queryValue = [];

        const { title, minSalary, hasEquity } = searchFilters;

    // each new search requested will push to addWhere and queryValue arrays to add to the sqlQuery
        if (title !== undefined) {
        queryValue.push(`%${title}%`);
        addWhere.push(`title ILIKE $${queryValue.length}`);
        }
        if (minSalary !== undefined) {
        queryValue.push(minSalary);
        addWhere.push(`salary >= $${queryValue.length}`);
        }
        if (hasEquity === true) {
        addWhere.push(`equity > 0`);
        }
        if (addWhere.length > 0) {
        sqlQuery += " WHERE " + addWhere.join(" AND ");
        }
        sqlQuery += " ORDER BY title";

        // Submits final query expression and returns results
        const jobRes = await db.query(sqlQuery, queryValue);
        return jobRes.rows;
    }

    /** Given a job id, return data about that job.
   *
   * Returns { title, salary, equity, company_handle  }
   *
   * Throws NotFoundError if not found.
   **/

    static async get(id) {
        const getJob = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle
            FROM jobs
            WHERE id = $1`,
            [id]);

        const job = getJob.rows[0];

        if (!job) throw new NotFoundError(`No job with id ${id}`);

        const getComp = await db.query(
            `SELECT handle, 
                name,
                description,
                num_employees,
                logo_url FROM companies WHERE 
                handle = $1`, [job.company_handle]
        );

        job.company = getComp.rows[0];

        return job;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- this only changes provided ones.
     *
     * Data to be changed can only include include: {title, salary, equity}
     *
     * Returns {id, title, salary, equity, company_handle}
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
            title: "title",
            salary: "salary",
            equity: "equity",
            });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, 
                                    title, 
                                    salary, 
                                    equity, 
                                    company_handle`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job with id ${id}`);

        return job;
    }
    

   /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job matching id ${id}`);
    }
}

module.exports = Job;