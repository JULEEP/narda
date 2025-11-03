const mongoose = require("mongoose");
const contactAdmin = new mongoose.Schema({
    phone: {
        type: String,
    },
 });
module.exports = mongoose.model("contactAdmin", contactAdmin);
