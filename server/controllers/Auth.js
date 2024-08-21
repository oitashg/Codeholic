const User = require("../models/User")
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")

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
            upperCaseAlphabets: fasle,
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
        console.log(otpBody)

        //return response successful
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        })

    }
    catch(error){
        console.log(error)
        return res.staus(500).json({
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
        console.log(recentOtp)

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
        else if(otp !== recentOtp.otp){
            //Typed the wrong OTP
            return res.status(400).json({
                success: false,
                message: "Wrong OTP",
            })
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

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
