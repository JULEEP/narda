const contactAdmin = require("../models/contactAdmin");                                                                                                     

exports.getAdminDetails = async (req, res) => {
    try {
        const contactAdminDetails = await contactAdmin.findOne(); 
        
        if (!contactAdminDetails) {
            return res.status(404).json({ message: "Admin details not found" });
        }

        res.status(200).json(contactAdminDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.addAdminDetails = async (req, res) => {
    const { phone } = req.body;
    try {
        const contactAdminDetails = new contactAdmin({
            phone,
        });
        const savedContactAdminDetails = await contactAdminDetails.save();
        res.status(200).json(savedContactAdminDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editAdminDetails = async (req, res) => {
    const { phone } = req.body;
    console.log(req.query.id);
    console.log(req.body);
    const id = req.query.id;
    try {
        const contactAdminDetails = await contactAdmin.findByIdAndUpdate(
            id,
            {
                phone,
            },
            { new: true }
        );
        res.status(200).json(contactAdminDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
