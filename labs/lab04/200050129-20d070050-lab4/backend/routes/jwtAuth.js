const router = require("express").Router()
const pool = require("../db");
const bcrypt = require("bcrypt");
const authorization = require("../middleware/authorization");

var session;

router.post("/signup", async(req, res) => {
    try {
        const { id, password } = req.body;
        const user = await pool.query("SELECT * FROM user_password WHERE id = $1", [id]);
        if (user.rows.length !== 0) {
            return res.status(401).json("Cannot Authenticate, ID already has password...");
        }
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query("INSERT INTO user_password(id, hashed_password) VALUES($1, $2) RETURNING *", [id, bcryptPassword]);
        res.json("Signed Up!");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Could not SignUp...");
    }
});

router.post("/login", async(req, res) => {
    try {
        const { id, password } = req.body;
        const user = await pool.query("SELECT * FROM user_password WHERE id = $1", [id]);
        if (user.rows.length === 0) {
            return res.status(401).json("Wrong ID or Password bro");
        }
        const validPassword = await bcrypt.compare(password, user.rows[0].hashed_password);
        if (!validPassword)
        {
            return res.status(401).json("Wrong ID or Password bro");
        }
        session = req.session;
        session.userid = id;
        res.json("Logged In!");
    } catch (err) {
        console.error(err.message);
        res.status(401).json("Cannot Authenticate");
    }
});

router.get("/verify", authorization, async(req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message)
        res.status(500).json("Lol I messed up...");
    }
});

router.get('/logout', async (req,res) => {
    req.session.destroy();
    res.json("Logged Out!");
});

module.exports = router;