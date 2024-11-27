const mongoose = require("mongoose")
const mailSender = require("../utils/mailSender")
const emailTemplate = require("../mail/templates/emailVerificationTemplate")

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 300, // The document will be automatically deleted after 5 minutes of its creation time
    }
})

// function to send otp to email as a purpose of verification
async function sendVerificationEmail(email, otp) {
    try{
        const mailResponse = await mailSender(email, "Verification Email from Codeholic", emailTemplate(otp))
        console.log("Email sent successfully: ", mailResponse)
    }
    catch(error){
        console.log("Error occured while sending mails: ", error)
        throw error
    }
}

//pre middleware...send verification email just before saving the document
OTPSchema.pre("save", async function(next) {
    console.log("New document saved to database")
    
    //Only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp)
    }

    next()
})

module.exports = mongoose.model("OTP", OTPSchema)