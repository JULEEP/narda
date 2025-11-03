const jwt = require("jsonwebtoken");

const isAuthentication = async function (req, res, next) {
  try {
    console.log(req.url, " isAuthentication request is called req.url-------------------------------------------------------------------------------------------------------------");
    const bearerHeader = req.header("Authorization");
    console.log(bearerHeader, "headerrrr");
    if (!bearerHeader) {
      return res.status(400).send({ status: false, msg: "token is required" });
    }
    console.log("entering for checking token");

    const token = bearerHeader.startsWith("Bearer ") ? bearerHeader.split(" ")[1] : bearerHeader;

    jwt.verify(token, "mytokenscret", (error, decoded) => {
      if (error) {
        console.log(error);
        return res.status(401).send({ status: false, msg: "authentication failed" });
      }
      console.log(decoded);
      req.decoded = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

const adminAuthentication = async function (req, res, next) {
  try {
    console.log(req.url, "req.url-------------------------------------------------------------------------------------------------------------");
    console.log(req.headers, "bearerHeader====================================");
    const bearerHeader = req.headers["authorization"];
    console.log("Bearer Header:", bearerHeader);

    if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
      const bearerToken = bearerHeader.split(" ")[1];
      console.log("Bearer Token:", bearerToken);

      jwt.verify(bearerToken, "mytokenscret", (err, decoded) => {
        if (err) {
          console.log("Error verifying token:", err);
          return res.status(401).json({
            status: false,
            message: "Your session has expired. Please login.",
            error: err
          });
        }
        if (decoded) {
          req.userId = decoded.userId || decoded.staffId;
          req.loginTime = decoded.iat;
          next();
        }
      });
    } else {
      res.status(400).json({ status: false, message: "Bearer token not defined" });
    }
  } catch (err) {
    console.log("Error in admin authentication:", err);
    res.status(500).json({ status: false, message: "Internal Server Error", error: err });
  }
};

module.exports = { isAuthentication, adminAuthentication };

