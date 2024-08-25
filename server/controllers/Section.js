const Section = require("../models/Section")
const Course = require("../models/Course")


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
        const newSection = await Section.create({newSection})

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

        //HW: use populate to replace sections and sub-sections both in the updatedCourseDetails
        //return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
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
        const {sectionName, sectionId} = req.body

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

        //return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            
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
        const {sectionId} = req.params

        //find section with the help of id and then delete
        await Section.findByIdAndDelete(sectionId)

        //return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            
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