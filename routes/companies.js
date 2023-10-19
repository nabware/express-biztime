const express = require("express");

const router = new express.Router();
const db = require("../db");

const { NotFoundError } = require("../expressError");
const { getCompany } = require("./middleware");

/** GET /companies: get list of companies {companies: [{code, name}, ...]} */
router.get("", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});

/** GET /companies/:code: Return obj of company {company: {code, name, description}} */
router.get("/:code", getCompany, async function (req, res) {
  const company = res.locals.company;
  return res.json({ company });
});

module.exports = router;