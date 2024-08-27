const Course = require("../models/Course")
const Tag = require("../models/Tags")
const User = require("../models/User")
const {uploadImageToCloudinary} = require("../utils/imageUploader")


//createCourse handler function
exports.createCourse = async(req, res) => {

    try{
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //check for instructor(as in model of course we have to store userid of instructor)
        const userId = req.user.id //earlier in middleware we have inserted the id in the payload and inserted that payload in the req.user
        const instructorDetails = await User.findById(userId)
        console.log("Instructor details : ", instructorDetails)
        //TODO: Verify if userId and instructorDetails._id are same or different

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            })
        }

        //check if given tag is valid or not
        const tagDetails = await Tag.findById(tag) //here tag is a reference..i.e..objectId

        if(!tagDetails){
            return res.status(404).json({
                success: false,
                message: "Tag details not found"
            })
        }

        //Upload Image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            //searching parameter..i.e...we search the entry whose id matches with the instructor id
            {_id: instructorDetails._id},
            {
                //push the new course details in the course array of instructor as it is there in the model
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        )

        //update the tag schema
        //Homework

        //return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })
    }
}

//showAllCourses handler function
exports.showAllCourses = async(req, res) => {

    try{
        const allCourses = await Course.find({}, {courseName: true,
                                                price: true,
                                                thumbnail: true,
                                                instructor: true,
                                                ratingAndReviews: true,
                                                studentsEnrolled: true,})
                                                .populate("instructor")
                                                .exec()
        
        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: error.message,
        })
    }
}

//getCourseDetails handler function
exports.getCourseDetails = async(req, res) => {

    try{
        //get id
        const {courseId} = req.body

        //find course details(we don't want object ID..so populate everything)
        const courseDetails = await Course.find(
                                    //searcing parameter
                                    {_id: courseId})
                                    .populate({
                                        path: "instructor",
                                        populate: {
                                            path: "additionalDetails",
                                        }
                                    })
                                    .populate("category")
                                    .populate("ratingAndreviews")
                                    .populate({
                                        path: "courseContent",
                                        populate: {
                                            path: "subSection",
                                        }
                                    })
                                    .exec()

        //validation
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`
            })
        }

        //return response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
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