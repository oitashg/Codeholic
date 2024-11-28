const Profile = require("../models/Profile")
const User = require("../models/User")
const Course = require("../models/Course")
const CourseProgress = require("../models/CourseProgress")
const mongoose = require("mongoose")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const {convertSecondsToDuration} = require("../utils/secToDuration")

//update Profile handler function
exports.updateProfile = async(req, res) => {

    try{
        //get the data
        const {firstName, lastName, dateOfBirth = "", about = "", contactNumber, gender} = req.body

        //get the userID
        const id = req.user.id

        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: "All fileds are required",
            })
        }

        //find profile
        //first find user details with the help of userID
        //then extract profile ID..i.e..additionalDetails from user schema
        //then find profile details with the help of that profileID
        const userDetails = await User.findById(id)
        const profileId = userDetails.additionalDetails
        const profileDetails = await Profile.findById(profileId)

        //update profile
        //Here we are not creating a new entry of profile in database
        //Previously already a null or empty profile was being created
        //We are just updating that now by using save()
        //Another way to update the values in database..i.e..by save
        //When object already present(here profileDetails) then use save
        //First one was by create...here no object was created
        userDetails.firstName = firstName
        userDetails.lastName = lastName
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.gender = gender
        profileDetails.contactNumber = contactNumber
        await userDetails.save()
        await profileDetails.save()

        const finalUserDetails = await User.findByIdAndUpdate(
                                            id,
                                            {new: true})
                                            .populate("additionalDetails")
                                            .exec()

        //return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            finalUserDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//delete Account handler function
//Explore how can we schedule this deleteion operation
//Like if we send a request to delete account today, it will be executed after 5 days
exports.deleteAccount = async(req, res) => {

    try{
        //get id and user details
        const id = req.user.id
        const userDetails = await User.findById(id)

        //validation
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        //delete profile associated with that user
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails})

        //TODO: Unenroll user form all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id: id})

        //return response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User can't be deleted",
        })
    }
}

//get all User details handler function
exports.getAllUserDetails = async(req, res) => {
  
    try{
        //get id
        const id = req.user.id

        //validation and get user details
        //By findById we get all the user details
        //But in user schema we get profile details as ref i.e objectID
        //To extract the details of any ObjectID, we ahve to use populate("that_model_name").exec()
        const userDetails = await User.findById(id).populate("additionalDetails").exec()

        //return response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            userDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        userId,
        { image: image.secure_url },
        { new: true })
        .populate("additionalDetails")
        .exec()
    
      res.send({
        success: true,
        message: `Image Updated successfully`,
        updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}
  
exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
}