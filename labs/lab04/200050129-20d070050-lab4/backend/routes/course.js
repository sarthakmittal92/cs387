const router = require("express").Router()
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/all", authorization, async(req, res) => {
    try {
        const myq = await pool.query("SELECT * FROM course");
        res.json(myq.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/dept/:name", authorization, async(req, res) => {
    try {
        const { name } = req.params;
        const myq = await pool.query("SELECT * FROM course WHERE dept_name = $1", [name]);
        res.json(myq.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/student/:given_id", authorization, async(req, res) => {
    try {
        const { given_id } = req.params;
        const id = req.id;
        const myq1 = await pool.query("SELECT * FROM student WHERE id = $1", [id]);
        if (myq1.rows.length !== 0) {
            if (given_id !== id) {
                console.log(given_id);
                console.log(id);
                return res.status(403).json("Real ID se aa bro...");
            }
            const myq2 = await pool.query("SELECT DISTINCT course_id, title, semester, year FROM takes NATURAL JOIN course WHERE id = $1", [id]);
            return res.status(200).json(myq2.rows);
        }
        const myq2 = await pool.query("SELECT * FROM instructor WHERE id = $1", [id]);
        if (myq2.rows.length === 0) {
            return res.status(403).json("Bhai tu hai kaun...");
        }
        const myq3 = await pool.query("SELECT DISTINCT course_id, title, semester, year FROM takes NATURAL JOIN course WHERE id = $1", [given_id]);
        res.json(myq3.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/instructor/:id", authorization, async(req, res) => {
    try {
        const { id } = req.params;
        const myq = await pool.query("SELECT DISTINCT course_id, title, semester, year FROM teaches NATURAL JOIN course WHERE id = $1", [id]);
        res.json(myq.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error...");
    }
});

router.get("/info/:cid", authorization, async(req, res) => {
    try {
        const { cid } = req.params;
        const myq = await pool.query("SELECT * FROM course WHERE course_id = $1", [cid]);
        res.json(myq.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error...");
    }
});

router.get("/running", authorization, async(req, res) => {
    try {
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq1.rows[0].semester;
        let disyear = myq1.rows[0].year;
        const myq2 = await pool.query("SELECT DISTINCT course_id, title FROM course NATURAL JOIN (SELECT DISTINCT course_id FROM section WHERE year = $1 AND semester = $2) as temp", [disyear, dissem]);
        res.json(myq2.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/running/depts", authorization, async(req, res) => {
    try {
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq1.rows[0].semester;
        let disyear = myq1.rows[0].year;
        const myq2 = await pool.query("SELECT DISTINCT dept_name FROM section NATURAL JOIN course WHERE year = $1 AND semester = $2", [disyear, dissem]);
        res.json(myq2.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/runningin/:dept_name", authorization, async(req, res) => {
    try {
        const { dept_name } = req.params;
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq1.rows[0].semester;
        let disyear = myq1.rows[0].year;
        const myq2 = await pool.query("SELECT distinct course_id FROM section NATURAL JOIN course WHERE year = $1 AND semester = $2 AND dept_name = $3", [disyear, dissem, dept_name]);
        res.json(myq2.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
})

module.exports = router;