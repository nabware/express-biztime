const db = require("../db");

const { NotFoundError } = require("../expressError");

async function getCompany(req, res, next) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [code]);

  const company = results.rows[0];
  if (!company) {
    throw new NotFoundError(`'${code}' was not found`);
  }
  // will be learning to make our own ORM to do below
  res.locals.company = company;

  next();
}

module.exports = { getCompany };