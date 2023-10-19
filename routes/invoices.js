const express = require("express");
const db = require("../db");

const { BadRequestError, NotFoundError } = require("../expressError");

const router = new express.Router();

/** GET /invoices: get list of invoices {invoices: [{id, comp_code}, ...]} */
router.get("", async function (req, res) {
    const results = await db.query(
        `SELECT id, comp_code
         FROM invoices`);

    const invoices = results.rows;

    return res.json({ invoices });
});

/** GET /invoices/:id: Return JSON of invoice
 *  {invoice: {id, amt, paid, add_date, paid_date, 
 * company: {code, name, description}} */
router.get("/:id", async function (req, res) {

    const id = req.params.id;

    const invResults = await db.query(
        `SELECT id, comp_code, amt, paid, add_date, paid_date
         FROM invoices
         WHERE id = $1`, [id]);

    const invoice = invResults.rows[0];

    if (!invoice) {
        throw new NotFoundError(`'invoice was not found`);
    }

    const compResults = await db.query(
        `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [invoice.comp_code]);

    invoice.company = compResults.rows[0];
    delete invoice.comp_code;


    return res.json({ invoice });
});

/** POST /invoices : 
 * Takes JSON body of: {comp_code, amt}
 * Adds a new invoices to the database.
  * Return JSON of new invoice. {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("", async function (req, res) {
    if (!req.body) {
        throw new BadRequestError("Missing body");
    }

    const { comp_code, amt } = req.body;

    let results = await db.query(
        `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]
    );

    const invoice = results.rows[0];

    return res.status(201).json({ invoice });
});

// /** PUT /companies/:code :
//  * Takes JSON like: {name, description},
//  * edits existing company,
//  * and returns update company JSON: {company: {code, name, description}}.
// */
// router.put("/:code", async function (req, res) {
//     if (!req.body) {
//         throw new BadRequestError("Missing body");
//     }

//     const { name, description } = req.body;

//     let result = await db.query(
//         `UPDATE companies
//              SET name=$1,
//                  description=$2
//              WHERE code = $3
//              RETURNING code, name, description`,
//         [name, description, req.params.code],
//     );

//     const company = result.rows[0];
//     if (!company) {
//         throw new NotFoundError("Not found.");
//     }

//     return res.json({ company });
// });

// /** DELETE /companies/:code : Deletes company.
//  * Returns {status: "deleted"}
// */
// router.delete("/:code", async function (req, res) {
//     // check resulting return if you dont use middleware
//     const result = await db.query(
//         "DELETE FROM companies WHERE code = $1",
//         [req.params.code],
//     );

//     if (!result.rowCount) {
//         throw new NotFoundError("Not found.");
//     }

//     return res.json({ status: "deleted" });
// });

module.exports = router;