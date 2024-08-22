const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ["Admin", "Instructor", "Student"],
        required: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }
    ],
    image: {
        type: String,
        required: true,
    },
    //This is added later, so that each user model has its own token and expiry time
    //by which every user gets a unique and different frontend link to reset password 
    token: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    //------------------------------------------------------------------------------
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        }
    ]
})

module.exports = mongoose.model("User", userSchema)