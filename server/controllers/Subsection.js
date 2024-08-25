const SubSection = require("../models/SubSection")
const Section = require("../models/Section")
const { uploadImageToCloudinary } = require("../utils/imageUploader")


//create subsection handler funtion
exports.createSubSection = async(req, res) => {

    try{
        //fetch data from req body
        const {sectionId, title, timeDuration, description} = req.body

        //extract video/file
        const video = req.files.videoFile

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success: false,
                message: "All fileds are required"
            })
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME)

        //create a sub-section(create entry in database)
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            //after uploading video to cloudinary we get a secure_url whuch is inserted in videoUrl of subsection schema
            videoUrl: uploadDetails.secure_url,
        })

        //update the subsection array in section schema by creating entry with subsectionId
        const updatedSection = await Section.findByIdAndUpdate(
                                                    //searching parameter
                                                    {_id: sectionId},
                                                    {
                                                        //pushing subsectionId in the section schema
                                                        $push: {
                                                            subSection: subSectionDetails._id,
                                                        }
                                                    },
                                                    {new: true})
        //HW: log updated section here after adding populate query
        //return response
        return res.status(200).json({
            success: true,
            message: "Sub-Section created successfully",
            updatedSection,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to create sub-section",
            error: error.message,
        })
    }
}

//HW: updateSubSetion handler function
//HW: deleteSubsection handler function