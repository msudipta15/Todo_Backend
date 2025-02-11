const jwt = require("jsonwebtoken");
const jwt_key = process.env.jwt_key;
function auth(req, res, next) {
  try {
    const token = req.headers.token;
    if (token) {
      const verify = jwt.verify(token, jwt_key);
      if (verify) {
        const userid = verify.id;
        req.userid = userid;
        next();
      } else {
        res.status(403).json({ msg: "You are not signed in !" });
      }
    } else {
      res.status(403).json({ msg: "Invalid token" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
}

module.exports = {
  userauth: auth,
};
