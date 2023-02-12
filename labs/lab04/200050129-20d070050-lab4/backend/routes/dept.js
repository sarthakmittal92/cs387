const router = require("express").Router()
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/all", authorization, async(req, res) => {
    try {
        const myq = await pool.query("SELECT * FROM department;");
        res.json(myq.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

module.exports = router;