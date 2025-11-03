const mongoose = require("mongoose");

//======================================= Name Regex Validation ========================================//
const validateName = (name) => {
    return (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(name));
}

//====================================== Email Regex Validation =======================================//
const validateEmail = (email) => {

    let regex= /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    
    if (regex.test(email)) return true
}
    

//==================================== Number Regex Validation ======================================//
const validateMobileNo = (Number) => {
    return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(Number));
}


module.exports = { validateName, validateEmail, validateMobileNo};