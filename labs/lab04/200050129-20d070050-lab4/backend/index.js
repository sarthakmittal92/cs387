const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "mittalChad",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes

app.use("/auth", require("./routes/jwtAuth"));
app.use("/dept", require("./routes/dept"));
app.use("/course", require("./routes/course"));
app.use("/forMittal", require("./routes/forMittal"));

app.listen(5000, () => {
    console.log("Server is running on port 5000");
})