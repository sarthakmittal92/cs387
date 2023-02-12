module.exports = async(req, res, next) => {
    try {
        const session = req.session;
        if(session.userid) {
            req.id = session.userid;
        }
        else {
            return res.status(403).json("Never gonna authorize...")
        }
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(403).json("Never gonna Authorize...");
    }
}