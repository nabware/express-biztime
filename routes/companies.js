const express = require("express");

const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");
const { getCompany } = require("./middleware");

/** GET /companies: get list of companies {companies: [{code, name}, ...]} */
router.get("", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});

/** POST /companies : Add a new company to the database. 
 * Return obj of new company. {company: {code, name, description}}
*/
router.post("", async function (req, res) {
  const comp = req.body;

  if (!comp?.code || !comp?.name || !comp?.description) {
    const err = new BadRequestError("Missing code, name, or description");
    return res.status(err.status).json({ error: { message: err.message, status: err.status } });
  }

  try {
    const results = await db.query(
      `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
      [comp.code, comp.name, comp.description]
    );
  } catch {
    const err = new BadRequestError("Company name taken");
    return res.status(err.status).json({ error: { message: err.message, status: err.status } });
  }
  const company = results.rows[0];
  return res.status(201).json({ company });
});


/** GET /companies/:code: Return obj of company {company: {code, name, description}} */
router.get("/:code", getCompany, function (req, res) {
  const company = res.locals.company;
  return res.json({ company });
});

module.exports = router;