const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create subsection handler funtion
exports.createSubSection = async (req, res) => {
  try {
    //fetch data from req body
    const { sectionId, title, timeDuration, description } = req.body;

    //extract video/file
    const video = req.files;

    console.log("Video -> ", video);
    console.log("title -> ", title);
    console.log("sectionId -> ", sectionId);
    console.log("description -> ", description);
    console.log("timeDuration -> ", timeDuration);

    //validation
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video.video,
      process.env.FOLDER_NAME
    );

    console.log("Uploaded details -> ", uploadDetails)
    console.log("Oitash - 2")
    //create a sub-section(create entry in database)
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      //after uploading video to cloudinary we get a secure_url whuch is inserted in videoUrl of subsection schema
      videoUrl: uploadDetails.secure_url,
    });

    console.log("Video details -> ", subSectionDetails)

    console.log("Oitash - 3")
    //update the subsection array in section schema by creating entry with subsectionId
    const updatedSection = await Section.findByIdAndUpdate(
      //searching parameter
      { _id: sectionId },
      {
        //pushing subsectionId in the section schema
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    )
      .populate("subSection")
      .exec();

    console.log("Updated Section Details -> ", updatedSection);

    console.log("Oitash - 4")
    //return response
    return res.status(200).json({
      success: true,
      message: "Sub-Section created successfully",
      data: updatedSection,
    });
  } 
  catch (error) {
    console.log("Unable to create sub-section")
    return res.status(500).json({
      success: false,
      message: "Unable to create sub-section",
      error: error.message,
    });
  }
};

//update subsection handler funtion
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    console.log("updated section", updatedSection);

    return res.json({
      success: true,
      message: "Sub-section updated successfully",
      data: updatedSection,
    });
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

//delete subsection handler funtion
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
