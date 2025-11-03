const jwt = require("jsonwebtoken");


const isAuthentication = async function (req, res, next) {
    try {
        const bearerHeader = req.header('Authorization')
        console.log(bearerHeader, "headerrrr")
        if (!bearerHeader) {
            return res.status(400).send({ status: false, msg: "token is required" })
        }

        const token = bearerHeader.split(' ')[1];

        let decodetoken = jwt.verify(token, "mytokenscret")
        console.log(decodetoken)
        req.decoded = decodetoken
        next()

    }
    catch (error) {

        if (error.message == "invalid token") return res.status(401).send({ status: false, msg: "authentication failed May be your header is Invalid" }) 
        if (error.message.startsWith("Unexpected")) return res.status(401).send({ status: false, msg: "authentication failed May be your payload is Invalid" }) 
        if (error.message == "invalid signature") return res.status(401).send({ status: false, msg: "authentication failed May be your singature is Invalid" }) 
        if (error.message == "jwt expired") return res.status(401).send({ status: false, msg: "authentication failed May be your Token is Expired" }) 

        return res.status(500).send({ status: false, msg: error.message })

    }
}

module.exports = { isAuthentication };