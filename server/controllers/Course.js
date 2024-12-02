const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const RatingAndReview = require("../models/RatingAndReview")
const {uploadImageToCloudinary} = require("../utils/imageUploader")
const {convertSecondsToDuration} = require("../utils/secToDuration")

//createCourse handler function
exports.createCourse = async(req, res) => {

    try{
        //fetch data
        //use "let" here...as if const used, we cannot reassign any new value to these variables
        //But here, status need to be reassigned, so let is used
        let {
          courseName, 
          courseDescription, 
          whatYouWillLearn, 
          price, 
          tag: _tag,
          category,
          status,
          instructions: _instructions,
        } = req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage
        
        //Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log("tag", tag)
        console.log("instructions", instructions)

        //validation
        if(
          !courseName || 
          !courseDescription || 
          !whatYouWillLearn || 
          !price || 
          !tag.length || 
          !thumbnail ||
          !category ||
          !instructions.length
        ){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        
        if (!status || status === undefined) {
          status = "Draft"
        }

        //check for instructor(as in model of course we have to store userid of instructor)
        const userId = req.user.id //earlier in middleware we have inserted the id in the payload and inserted that payload in the req.user
        const instructorDetails = await User.findById(userId, 
                                                    {accountType: "Instructor"})
                                                    
        console.log("Instructor details : ", instructorDetails)
        //TODO: Verify if userId and instructorDetails._id are same or different

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            })
        }

        //check if given tag is valid or not
        const categoryDetails = await Category.findById(category) //here category is a reference..i.e..objectId

        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            })
        }

        //Upload Image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)
        console.log(thumbnailImage)

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions,
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

        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
          { _id: category },
          {
            $push: {
              courses: newCourse._id,
            },
          },
          { new: true }
        )
        console.log("Category details -> ", categoryDetails2)

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

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      console.log("Updates -> ", updates)

      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            //stringify converts Javascript object into JSON string
            course[key] = JSON.stringify(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
}

//showAllCourses handler function
exports.getAllCourses = async(req, res) => {

    try{
        const allCourses = await Course.find({status: "Published"}, 
                                              {courseName: true,
                                              price: true,
                                              thumbnail: true,
                                              instructor: true,
                                              ratingAndReviews: true,
                                              studentsEnrolled: true},
                                              {new: true})
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

//get Single Course Details handler function
exports.getCourseDetails = async(req, res) => {

    try{
        //get id
        const {courseId} = req.body

        //find course details(we don't want object ID..so populate everything)
        const courseDetails = await Course.find(
                                    //searching parameter
                                    {_id: courseId},
                                    {new: true})
                                    .populate({
                                        path: "instructor",
                                        populate: {
                                            path: "additionalDetails",
                                        }
                                    })
                                    .populate("courseName")
                                    .populate("courseDescription")
                                    .populate("category")
                                    .populate("createdAt")
                                    .populate("whatYouWillLearn")
                                    .populate("thumbnail")
                                    .populate("instructions")
                                    .populate("price")
                                    .populate({
                                      path: "studentsEnrolled",
                                      select: "_id"
                                    })
                                    .populate("ratingAndReviews")
                                    .populate({
                                        path: "courseContent",
                                        populate: {
                                            path: "subSection",
                                        }
                                    })
                                    .exec()

        //validation
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Could not find the course with ${courseId}`
            })
        }
        
        let totalDurationInSeconds = 0
        //calling forEach on undefined element can cause typeError....
        //That's why ?. is used when we are not sure when the element is undefined or not
        courseDetails.courseContent?.forEach((content) => {
          content.subSection.forEach((subSection) => {
            const timeDurationInSeconds = parseInt(subSection.timeDuration)
            totalDurationInSeconds += timeDurationInSeconds
          })
        })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        //return response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: {
              courseDetails,
              totalDuration,
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

//getFullCourseDetails handler function
exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}
  
// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection"
        }
      })
      .sort({ createdAt: -1 })
      
      console.log("Instructor courses -> ", instructorCourses)

      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
}

// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
      const {courseId} = req.body
      console.log("Course Id -> ", courseId)

      // Find the course
      const course = await Course.findById(courseId)
      console.log("Course -> ", course)

      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
      
      //delete the entry of this course from the course list of instructor
      const courseInstructorId = course.instructor
      const updatedCourseList = await User.findByIdAndUpdate(courseInstructorId, 
                                                            {
                                                              $pull: {
                                                                courses: courseId
                                                              }
                                                            },
                                                            {new: true})
                                                            .populate("courses")
                                                            .exec()
      console.log("Updated courses list -> ", updatedCourseList)

      // Delete sections and sub-sections
      const courseSections = course.courseContent
      console.log("Course Section -> ", courseSections)

      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        console.log("Section -> ", section)

        if (section) {
          const subSections = section.subSection
          console.log("Sub-section -> ", subSections)
          
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
      
      //TODO: Update the category schema..i.e..
      //we have to delete the course from the courses array of category model
      const categoryId = course.category
      const updatedCategory = await Category.findByIdAndUpdate(
                                              categoryId,
                                              {
                                                $pull: {
                                                  courses: courseId,
                                                }
                                              },
                                              {new: true})
                                              .populate("courses")
                                              .exec()
      
      console.log("Category Id -> ", categoryId)
      console.log("Upated category details -> ", updatedCategory)
      
      //Delete the ratingReview entry also while deleting the course
      const ratingReviewId = course.ratingAndReviews
      console.log("Rating Reviw Id -> ", ratingReviewId)
      await RatingAndReview.findByIdAndDelete(ratingReviewId)

      //Delete the courseProgress of all students enrolled in this course while deleting the course
      const enrolledStudentDetails = course.studentsEnrolled
      console.log("Enrolled Students detail -> ", enrolledStudentDetails)
      
      for(const studentId of enrolledStudentDetails){
        //string details of each user
        const userDetails = await User.findById(studentId)
                                                  .populate("courseProgress")
                                                  .exec()
        
        //extracting courseProgress details of each user
        const courseProgressDetails = userDetails.courseProgress
        console.log("Course Progress Details -> ", courseProgressDetails) 

        //storing the particular courseProgressId of the course of this student
        let courseProgressId
        for(const element of courseProgressDetails){
          if(element.courseID == courseId){
            courseProgressId = element._id
            break
          }
        }
        
        console.log("CourseProgress Id -> ", courseProgressId)
        
        const updatedCourseProgress = await User.findByIdAndUpdate(
                                                  studentId, 
                                                  {
                                                    $pull: {
                                                      courseProgress: courseProgressId
                                                    }
                                                  },
                                                  {new: true})
                                                  .populate("courseProgress")
                                                  .exec()
        
        console.log("Updated courseProgress -> ", updatedCourseProgress)

        //Delete the courseprogress of that student for this course
        await CourseProgress.findByIdAndDelete(courseProgressId)
      }

      // Delete the course
      await Course.findByIdAndDelete(courseId)

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        updatedCategory,
      })
    } 
    catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
}