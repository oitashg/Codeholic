const Category = require("../models/Category")

//createCategory handler function
exports.createCategory = async(req, res) => {

    try{
        //fetch data
        const {name, description} = req.body

        //validation of data
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        //create entry in database
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        })
        console.log(categoryDetails)

        //return response
        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//showAllCategories handler function
exports.showAllCategories= async(req, res) => {

    try{
        const allCategories = await Category.find({})
        res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            data: allCategories,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//categoryPageDetails handler function
exports.categoryPageDetails = async(req, res) => {

    try{
        //get category id
        const {categoryId} = req.body

        //get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                                //populate the courses field as it is stored as ref(objectId)
                                                .populate("courses")
                                                .exec()

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success: false,
                message: "Data not found",
            })
        }

        //get courses for different courses
        const differentCategories = await Category.find(
                                            {
                                                //we are finding those courses whose id is not equal($ne) to current category id
                                                _id: {$ne: categoryId}
                                            })
                                            .populate("courses")
                                            .exec()

        //get top selling courses
        //HW- write it on your own

        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            }
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}