const router = require("express").Router()
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/home", authorization, async(req, res) => {
    try {
        let ret = {};
        const id = req.id;
        const myq1 = await pool.query("SELECT * FROM student WHERE id = $1;", [id]);
        ret = {
            id: id,
            name: myq1.rows[0].name,
            department: myq1.rows[0].dept_name,
            total_credits: myq1.rows[0].tot_cred
        }
        const myq2 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq2.rows[0].semester;
        let disyear = myq2.rows[0].year;
        let retarr = [];
        const myqn = await pool.query("SELECT * FROM (SELECT DISTINCT semester, year FROM section) AS sy(semester, year) ORDER BY year DESC, (CASE WHEN semester = 'Spring' THEN 1 WHEN semester = 'Summer' THEN 2 WHEN semester = 'Fall' THEN 3 WHEN semester = 'Winter' THEN 4 END) DESC");
        const iterarr = myqn.rows;
        for (let i = 0; i<iterarr.length; ++i) {
            const myq3 = await pool.query("SELECT * FROM takes NATURAL JOIN course WHERE id = $1 AND year = $2 AND semester = $3 ORDER BY course_id", [id, iterarr[i].year, iterarr[i].semester]);
            if (dissem===iterarr[i].semester && disyear===iterarr[i].year)
            {   
                ret = {...ret, ...{curr_sem: myq3.rows}}
            }
            else {
                retarr.push(myq3.rows);
            }
        }
        ret = {...ret, ...{sems: retarr}};
        res.json(ret);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.post("/canreg", authorization, async(req, res) => {
    try {
        const { cid, sid } = req.body;
        const id = req.id;
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq1.rows[0].semester;
        let disyear = myq1.rows[0].year;
        const myq2 = await pool.query("SELECT * FROM section WHERE year = $1 AND semester = $2 AND course_id = $3", [disyear, dissem, cid]);
        if (myq2.rows.length === 0)
        {
            return res.status(200).json({"No": "Cannot take this course, not being offered..."});
        }
        const myq3 = await pool.query("SELECT * FROM takes WHERE id = $1 AND (grade <> 'F' OR grade IS NULL) AND course_id = $2", [id, cid]);
        if (myq3.rows.length !== 0)
        {
            return res.status(200).json({"No":"Cannot take this course, already passed or registered for..."});
        }
        const myq4 = await pool.query("(SELECT prereq_id FROM prereq WHERE course_id = $1) EXCEPT (SELECT course_id FROM takes WHERE id = $2 AND grade <> 'F')", [cid, id]);
        if (myq4.rows.length !== 0)
        {
            return res.status(200).json({"No": "Cannot take this course, prerequisites not satisfied..."})
        }
        const myq5  = await pool.query("(SELECT time_slot_id FROM section WHERE course_id = $1 AND sec_id = $2 AND semester = $3 AND year = $4) EXCEPT (SELECT time_slot_id FROM section NATURAL JOIN takes WHERE id = $5 AND semester = $3 AND year = $4)", [cid, sid, dissem, disyear, id]);
        if (myq5.rows.length === 0)
        {
            return res.status(200).json({"No": "Cannot take this course, slot clash with registered course..."});
        }
        res.json({"Yes": "Go ahead"});
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Serve Error...");
    }
});

router.post("/doreg", authorization, async(req, res) => {
    try {
        const { cid, sid } = req.body;
        const id = req.id;
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq1.rows[0].semester;
        let disyear = myq1.rows[0].year;
        const myq2 = await pool.query("SELECT * FROM section WHERE year = $1 AND semester = $2 AND course_id = $3", [disyear, dissem, cid]);
        if (myq2.rows.length === 0)
        {
            return res.status(403).json({"No": "Cannot take this course, not being offered..."});
        }
        const myq3 = await pool.query("SELECT * FROM takes WHERE id = $1 AND (grade <> 'F' OR grade IS NULL) AND course_id = $2", [id, cid]);
        if (myq3.rows.length !== 0)
        {
            return res.status(403).json({"No":"Cannot take this course, already passed or registered for..."});
        }
        const myq4 = await pool.query("(SELECT prereq_id FROM prereq WHERE course_id = $1) EXCEPT (SELECT course_id FROM takes WHERE id = $2 AND grade <> 'F')", [cid, id]);
        if (myq4.rows.length !== 0)
        {
            return res.status(403).json({"No": "Cannot take this course, prerequisites not satisfied..."})
        }
        const myq5  = await pool.query("(SELECT time_slot_id FROM section WHERE course_id = $1 AND sec_id = $2 AND semester = $3 AND year = $4) EXCEPT (SELECT time_slot_id FROM section NATURAL JOIN takes WHERE id = $5 AND semester = $3 AND year = $4)", [cid, sid, dissem, disyear, id]);
        if (myq5.rows.length === 0)
        {
            return res.status(200).json({"No": "Cannot take this course, slot clash with registered course..."});
        }
        const myq6 = await pool.query("INSERT INTO takes(id, course_id, sec_id, semester, year) VALUES($1, $2, $3, $4, $5)", [id, cid, sid, dissem, disyear]);
        res.json({"Yes": "Reg done"});
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.delete("/drop/:cid", authorization, async(req, res) => {
    try {
        const { cid } = req.params;
        const id = req.id;
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        let dissem = myq1.rows[0].semester;
        let disyear = myq1.rows[0].year;
        const myq2 = await pool.query("DELETE FROM takes WHERE course_id = $1 AND id = $2 AND semester = $3 AND year = $4", [cid, id, dissem, disyear]);
        res.json("Dropped...");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/cinfo/:cid", authorization, async(req, res) => {
    try {
        const { cid } = req.params;
        const myq1 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        const dissem = myq1.rows[0].semester;
        const disyear = myq1.rows[0].year;
        var myq2 = await pool.query("SELECT * FROM (teaches NATURAL JOIN section) JOIN course USING (course_id) WHERE course_id = $1", [cid]);
        // if (myq2.rows.length === 0)
        // {
        //     return res.status(403).json("Course not offered this sem...");
        // }
        let ret = {
            course_id: cid,
            title: myq2.rows[0].title,
            department: myq2.rows[0].dept_name,
            credits: myq2.rows[0].credits,
            semester: dissem,
            year: disyear,
        }
        myq2 = await pool.query("SELECT * FROM (teaches NATURAL JOIN section) JOIN course USING (course_id) WHERE year = $1 AND semester = $2 AND course_id = $3", [disyear, dissem, cid]);
        let sections = []
        for (let i=0; i<myq2.rows.length ; ++i)
        {
            const myq3 = await pool.query("SELECT * FROM instructor WHERE id = $1", [myq2.rows[i].id]);
            const myq4 = await pool.query("SELECT day, start_hr, start_min, end_hr, end_min FROM time_slot WHERE time_slot_id = $1", [myq2.rows[i].time_slot_id]);
            sections.push({
                section: myq2.rows[i].sec_id,
                instructor_id: myq2.rows[i].id,
                instructor_name: myq3.rows[0].name,
                building: myq2.rows[i].building,
                room: myq2.rows[i].room_number,
                timings: myq4.rows
            });
        }
        ret = {...ret, sections}
        const myq5 = await pool.query("SELECT prereq_id, title FROM prereq, course WHERE prereq.prereq_id = course.course_id AND prereq.course_id = $1", [cid]);
        ret = {...ret, ...{prerequisites: myq5.rows}};
        res.json(ret);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error...");
    }
});

router.get("/iinfo/:iid", authorization, async(req, res) => {
    try {
        const { iid } = req.params;
        const myq1 = await pool.query("SELECT * FROM instructor WHERE id = $1", [iid]);
        if (myq1.rows.length === 0)
        {
            return res.status(404).json("Prof not found...");
        }
        ret = {
            instructor_id: iid,
            instructor_name: myq1.rows[0].name,
            department: myq1.rows[0].dept_name
        }
        const myq2 = await pool.query("SELECT year, semester FROM reg_dates WHERE start_time < current_timestamp ORDER BY start_time DESC;");
        const dissem = myq2.rows[0].semester;
        const disyear = myq2.rows[0].year;
        let retarr = [];
        const myqn = await pool.query("SELECT * FROM (SELECT DISTINCT semester, year FROM section) AS sy(semester, year) ORDER BY year DESC, (CASE WHEN semester = 'Spring' THEN 1 WHEN semester = 'Summer' THEN 2 WHEN semester = 'Fall' THEN 3 WHEN semester = 'Winter' THEN 4 END) DESC");
        const iterarr = myqn.rows;
        for (let i = 0; i<iterarr.length; ++i) {
            const myq3 = await pool.query("SELECT distinct course_id, title, semester, year FROM teaches NATURAL JOIN course WHERE id = $1 AND year = $2 AND semester = $3 ORDER BY course_id", [iid, iterarr[i].year, iterarr[i].semester]);
            if (dissem===iterarr[i].semester && disyear===iterarr[i].year)
            {   
                ret = {...ret, ...{curr_sem: myq3.rows}}
            }
            else {
                if (myq3.rows.length !== 0) {
                    retarr.push(myq3.rows);
                }
            }
        }
        ret = {...ret, ...{sems: retarr}};
        res.json(ret);
    } catch (err) {
        console.error(err.message),
        res.status(500).json("Server Error...");
    }
})

module.exports = router;