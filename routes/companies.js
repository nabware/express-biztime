const express = require("express");
const db = require("../db");

const { BadRequestError, NotFoundError } = require("../expressError");
const { getCompany } = require("./middleware");

const router = new express.Router();

/** GET /companies: get list of companies {companies: [{code, name}, ...]} */
router.get("", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});

/** GET /companies/:code: Return JSON of company {company: {code, name, description}} */
router.get("/:code", getCompany, function (req, res) {
  const company = res.locals.company;

  return res.json({ company });
});

/** POST /companies : Add a new company to the database.
 * Return JSON of new company. {company: {code, name, description}}
*/
router.post("", async function (req, res) {
  if (!req.body) {
    throw new BadRequestError("Missing body");
  }

  const {code, name, description} = req.body;

  let results = await db.query(
      `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
      [code, name, description]
  );

  const company = results.rows[0];

  return res.status(201).json({ company });
});

/** PUT /companies/:code :
 * Takes JSON like: {name, description},
 * edits existing company,
 * and returns update company JSON: {company: {code, name, description}}.
*/
router.put("/:code", async function (req, res) {
  if (!req.body) {
    throw new BadRequestError("Missing body");
  }

  const {name, description} = req.body;

  let result = await db.query(
      `UPDATE companies
             SET name=$1,
                 description=$2
             WHERE code = $3
             RETURNING code, name, description`,
      [name, description, req.params.code],
  );

  const company = result.rows[0];
  if (!company) {
    throw new NotFoundError("Not found.");
  }

  return res.json({ company });
});

/** DELETE /companies/:code : Deletes company.
 * Returns {status: "deleted"}
*/
router.delete("/:code", async function (req, res) {
  // check resulting return if you dont use middleware
  const result = await db.query(
    "DELETE FROM companies WHERE code = $1",
    [req.params.code],
  );

  if (!result.rowCount) {
    throw new NotFoundError("Not found.")
  }

  return res.json({ status: "deleted" });
});

module.exports = router;