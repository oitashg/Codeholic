const Section = require("../models/Section")
const Course = require("../models/Course")
const SubSection = require("../models/SubSection")

//create Section handler function
exports.createSection = async(req, res) => {

    try{
        //fetch data
        const {sectionName, courseId} = req.body

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing properties",
            })
        }

        //create section
        const newSection = await Section.create({sectionName})

        //update course with new Section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push: {
                                                    courseContent: newSection._id,
                                                }
                                            },
                                            {new: true},
                                        )
                                        .populate({
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection",
                                            },
                                        })
                                        .exec()

        //return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            data: updatedCourseDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to create section",
            error: error.message,
        })
    }
}

//update Section handler function
exports.updateSection = async(req, res) => {

    try{
        //data input
        const {sectionName, sectionId, courseId} = req.body

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: "Missing properties",
            })
        }

        //update data
        //no need to update section name in the course model, as in course model sectionId is present not name. So it will be automatically updated
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true})
        
        //need to update the course as section being updated, otherwise it will not be reflected in UI
        const updatedCourse = await Course.findById(courseId)
                                    .populate({
                                        path: "courseContent",
                                        populate: {
                                            path: "subSection"
                                        }
                                    })
                                    .exec()

        //return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            data: updatedCourse,
        })        
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to update section",
            error: error.message,
        })
    }
}

//delete Section handler function
exports.deleteSection = async(req, res) => {

    try{
        //get ID - assuming that we are sending ID in the params
        const {courseId, sectionId} = req.body
        console.log("Section id -> ", sectionId)

        //First find the section using sectionID
        const section = await Section.findById(sectionId)
        console.log("Section-> ", section)

        if (!section) {
            return res.status(404).json({ message: "Section not found" })
        }

        //Delete the sub-sections

        //subSections is basically the sub-section array
        const subSections = section.subSection
        console.log("Subsections -> ", subSections)

        for(const subSectionId of subSections){
            //find the subsection id from schema and delete it
            await SubSection.findByIdAndDelete(subSectionId)
        }

        //find section with the help of id and then delete
        await Section.findByIdAndDelete(sectionId)

        //TODO: Do we need to delete the entry of sectionId manually from the course schema?
        //Yes we have to
        const updatedCourse = await Course.findByIdAndUpdate(
                                        {_id: courseId},
                                        {
                                            $pull: {
                                                courseContent: sectionId,
                                            }
                                        },
                                        {new: true})
                                        .populate({
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection"
                                            }
                                        })
                                        .exec()
        
        //return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: updatedCourse,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to delete section",
            error: error.message,
        })
    }
}