const categorymodel = require("../models/categorymodel");
const subcategorymodel = require("../models/subcategorymodel");
const usermodel = require("../models/usermodel");

const createCategory = async function (req, res) {
  try {
    let catexists = await categorymodel.findOne({ name: req.body.name });
    if (catexists)
      return res
        .status(400)
        .send({ status: false, message: "category exists already" });

    if (req.files.length > 0) {
      let file = req.files[0];
      console.log(file);
      //const path = `${file.destination}/${file.originalname}`
      req.body.image = file.path;
    }
    let category = await categorymodel.create(req.body);
    // console.log(category, "fdfdsfs")
    if (category)
      return res.status(200).send({
        status: true,
        message: "Category has been added successfully",
      });
  } catch (err) {
    return res
      .status(400)
      .send({ status: false, message: "Something went wrong" });
  }
};

const getallcategory = async function (req, res) {
  try {
    const { searchQuery } = req.query;

    // Create a search condition if searchQuery is provided
    const searchCondition = searchQuery
      ? { name: { $regex: searchQuery, $options: "i" } }
      : {};

    let cat = await categorymodel.find(searchCondition).sort({ createdAt: -1 });
    if (cat)
      return res.status(200).send({
        status: true,
        message: "All categories fetched successfully",
        data: cat,
      });
    return res.status(404).send({ status: false, message: "Not Found" });
  } catch (err) {
    return res.status(404).send({ status: false, message: "Not Found" });
  }
};

const editcategory = async function (req, res) {
  try {
    let updateData = {
      name: req.body.name,
    };

    if (req.files && req.files.length > 0) {
      let file = req.files[0];
      console.log(file);
      updateData.image = file.path;
    }

    const category = await categorymodel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (category) {
      res.status(200).json({
        success: true,
        message: "Category has been updated",
        category,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Bad request",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// delete category
const deleteCategory = async function (req, res) {
  try {
    const category = await categorymodel.findOneAndDelete({
      _id: req.params.id,
    });
    if (category) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

//---------------------------- SUBCATEGORIES -----------------------------------------//

const createsubcat = async function (req, res) {
  try {
    const catdetails = await categorymodel.findById({
      _id: req.body.categoryId,
    });
    if (!catdetails)
      return res
        .status(400)
        .send({ status: false, message: "Category not found" });
    let catName = catdetails.name;
    console.log(catName);

    if (req.files.length > 0) {
      let file = req.files[0];
      console.log(file);
      //const path = `${file.destination}/${file.originalname}`
      req.body.image = file.path;
    }

    let catexists = await subcategorymodel.findOne({
      categoryId: req.body.categoryId,
      name: req.body.name,
    });
    if (catexists)
      return res
        .status(400)
        .send({ status: false, message: "Sub category exists already" });
    req.body.categoryName = catName;
    if (req.files) {
      let file = req.files[0];
      console.log(file);
      req.body.image = file.path;
    }
    let category = await subcategorymodel.create(req.body);
    if (category)
      return res.status(200).send({
        status: true,
        message: "Subcategory addded successfully",
        data: category,
      });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ status: false, message: "Something went wrong" });
  }
};

const getsubcats = async function (req, res) {
  try {
    const { searchQuery } = req.query;

    // Create a search condition if searchQuery is provided
    const searchCondition = searchQuery
      ? { name: { $regex: searchQuery, $options: "i" } }
      : {};

    let cat = await subcategorymodel
      .find(searchCondition)
      .sort({ createdAt: -1 });
    if (cat)
      return res.status(200).send({
        status: true,
        message: "All subcategories fetched successfully",
        data: cat,
      });
    return res.status(404).send({ status: false, message: "Not Found" });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .send({ status: false, message: "Something went wrong" });
  }
};

const editsubcategory = async function (req, res) {
  try {
    const usercategory = await categorymodel.findOne(
      { _id: req.body.categoryId },
      { name: 1 }
    );
    let updateData = {
      name: req.body.name,
      categoryId: req.body.categoryId,
      categoryName: usercategory ? usercategory.name : "",
    };

    if (req.files && req.files.length > 0) {
      let file = req.files[0];
      console.log(file);
      updateData.image = file.path;
    }

    const category = await subcategorymodel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (category) {
      res.status(200).json({
        success: true,
        message: "Updated successfully",
        category,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Bad request",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

const deletesubCategory = async function (req, res) {
  try {
    const category = await subcategorymodel.findOneAndDelete({
      _id: req.params.id,
    });
    if (category) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

///////////////////
const getallsubandcat = async function (req, res) {
  try {
    let subcategories = await subcategorymodel.find();
    console.log(subcategories);

    let userdata = await usermodel.findById({ _id: req.decoded.id });
    if (!userdata)
      return res.status(400).json({ status: false, message: "Please Login" });

    if (subcategories && subcategories.length > 0) {
      let categorizedSubcategories = subcategories.reduce(
        (acc, subcategory) => {
          const { categoryName, _id, name } = subcategory;

          // Check if the subcategory is in the user's categories array
          const isAdded = userdata.categories.includes(_id.toString());

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }

          acc[categoryName].push({ _id, name, isAdded });

          return acc;
        },
        {}
      );

      return res.status(200).send({
        status: true,
        message: "All subcategories fetched successfully",
        data: categorizedSubcategories,
      });
    }

    return res.status(404).send({ status: false, message: "Not Found" });
  } catch (err) {
    console.log(err.message);
    return res.status(404).send({ status: false, message: "Not Found" });
  }
};

module.exports.createCategory = createCategory;
module.exports.getallcategory = getallcategory;
module.exports.createsubcat = createsubcat;
module.exports.getsubcats = getsubcats;
module.exports.getallsubandcat = getallsubandcat;
module.exports.editcategory = editcategory;
module.exports.deleteCategory = deleteCategory;
module.exports.editsubcategory = editsubcategory;
module.exports.deletesubCategory = deletesubCategory;
