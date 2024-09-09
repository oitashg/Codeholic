const User = require("../models/User")
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mailSender = require("../utils/mailSender")
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()


//Send OTP function
exports.sendOTP = async(req, res) => {
    try{
        //fetch email from request body
        const {email} = req.body

        //check if user already exist
        const checkUserPresent = await User.findOne({email})

        //if user already exist, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: "User already registered",
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        console.log("OTP generated: ", otp)

        //check unique otp or not
        let result = await OTP.findOne({otp: otp})
        
        //same otp found in database...so regenerating till find a unique one
        //But this is not a good code..so try to optimise it and find a package which guarantee unique otp
        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets: fasle,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await OTP.findOne({otp: otp})
        }

        const otpPayload = {email, otp}

        //create a entry in database for otp
        const otpBody = await OTP.create(otpPayload)
        console.log("OTP body -> ", otpBody)

        //return response successful
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        })

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//signup function
exports.signUp = async(req, res) => {

    try{
        //data fetch from request body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body

        //validate details
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        //match 2 passwords
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password does not match, please try again"
            })
        }

        //check if user already exists or not
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            })
        }

        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1)
        console.log("Printing the recent otp -> ", recentOtp)

        // recentOtp -> OTP collected from database
        // otp -> the one that the user has given input while fulling the form

        //validate OTP
        if(recentOtp.length === 0){
            //OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            })
        }
        else if(otp !== recentOtp[0].otp){
            //Typed the wrong OTP
            return res.status(400).json({
                success: false,
                message: "Wrong OTP",
            })
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)

        //create entry in database
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return response
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again",
        })
    }
}

//login function
exports.login = async(req, res) => {

    try{
        //get data from req body
        const {email, password} = req.body

        //validation of data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            })
        }

        //check if user exist or not
        //By populating we get access to all details fo a user
        const user = await User.findOne({email}).populate("additionalDetails")
        if(!user){
            //user not found
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first"
            })
        }

        //generate JWT, after password matching
        //compare function matches the 2 passwords
        //password -> from req body i.e user input
        //user.password -> password saved in user database
        //these 2 are required to compare and check if passwords are matching or not
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })

            user.token = token
            user.password = undefined

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            })
        }
        else{
            //password not matched
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            })
        }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again"
        })
    }
}

//change password function
exports.changePassword = async (req, res) => {

    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id)
  
        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword } = req.body
  
        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
            .status(401)
            .json({ success: false, message: "The password is incorrect" })
        }
    
        // Update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        )
  
        // Send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent successfully:", emailResponse.response)
        } 
        catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
            success: false,
            message: "Error occurred while sending email",
            error: error.message,
            })
        }
  
        // Return success response
        return res.status(200).json({ 
            success: true, 
            message: "Password updated successfully" 
        })
    } 
    catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}