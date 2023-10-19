const db = require("../db");

const { NotFoundError } = require("../expressError");

async function getCompany(req, res, next) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [code]);

  if (results.rows.length === 0) {
    // throw new NotFoundError(`'${code}' was not found`);
    const message = `'${code}' was not found`;
    const status = 404;
    return res.status(status).json({ error: { message, status } });
  }

  const company = results.rows[0];
  res.locals.company = company;

  next();
}

module.exports = { getCompany };