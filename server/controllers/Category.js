const Category = require("../models/Category")

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

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
                                                .populate({
                                                    path: "courses",
                                                    match: { status: "Published" },
                                                    populate: "ratingAndReviews",
                                                })
                                                .exec()

        //validation
        if(!selectedCategory){
            console.log("Category Not found")
            return res.status(404).json({
                success: false,
                message: "Category not found",
            })
        }

        //Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
            })
        }

        //get courses for different categories
        const differentCategories = await Category.find(
                                            {
                                                //we are finding those courses whose id is not equal($ne) to current category id
                                                _id: {$ne: categoryId}
                                            },
                                            {new: true})
                                            .populate({
                                                path: "courses",
                                                populate: "ratingAndReviews"
                                            })
                                            .exec()

        let differentCategory = await Category.findOne(
            differentCategories[getRandomInt(differentCategories.length)]
            ._id
        )
        .populate({
            path: "courses",
            match: { status: "Published" },
            populate: {
                path: "ratingAndReviews"
            }
        })
        .exec()

        //get top selling courses
        //HW- write it on your own
        
        const allCategories = await Category.find()
        .populate({
            path: "courses",
            match: { status: "Published" },
            populate: {
                path: "instructor",
                path: "ratingAndReviews"
            },
        })
        .exec()

        const allCourses = allCategories.flatMap((category) => category.courses)

        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        // console.log("mostSellingCourses COURSE", mostSellingCourses)

        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                differentCategory,
                mostSellingCourses,
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