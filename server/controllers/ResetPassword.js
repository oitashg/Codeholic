const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

//--------------Reset password is divided in 2 parts--------------------------------

// 1. Generating token and sending password change link to email id
// 2. Getting access to user database with he help of token and actually updating password and changing the user details in database

//resetPassword token(generating token and sending update password link to email)
exports.resetPasswordToken = async(req, res) => {

    try{
        //get email from req body
        const email = req.body.email
        //-----------or-------------
        //by destructuring email from request body
        // const {email} = req.body

        //check if user exist with this email id or not
        const user = await User.findOne({email: email})
        if(!user){
            return res.json({
                success: false,
                message: "Your email is not registered with us"
            })
        }

        //generate token
        //randomUUID generate random bytes/string which serves as token
        const token = crypto.randomUUID()

        //update user by adding token and expiration time in the User model
        const updatedDetails = await User.findOneAndUpdate(
                                        {email: email},
                                        {
                                            token: token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                        },
                                        //by adding new: true, the updated model/document will be returned in response
                                        {new: true}
        )

        //create url(frontend link)
        const url = `https://codeholic.vercel.app/update-password/${token}`
        
        //send mail containing the url
        await mailSender(email,
                          "Password Reset Link",
                          `Password Reset Link: ${url}`)
        
        //return response
        return res.json({
            success: true,
            message: "Email sent successfully, please check email and change password"
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while generating reset password token"
        })
    }
}

//reset password(actually updating password)
exports.resetPassword = async (req, res) => {
	try {
        //data fetch(token was actually present in the url, frontned has inserted it in the body so now we can fetch it from req body)
		const {password, confirmPassword, token} = req.body;

        //validation
		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
        
        //get user deails from database using token
		const userDetails = await User.findOne({ token: token });
        console.log("User details -> ", userDetails)
        
        //if no entry--> invalid token
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}

        //if time span of token expires
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}

        //token valid...then hashing the password
		const hashedPassword = await bcrypt.hash(password, 10);

        //password updated in user database
		await User.findOneAndUpdate(
			{ token: token },
			{ password: hashedPassword },
			{ new: true }
		);

        //return response
		return res.status(200).json({
			success: true,
			message: `Password Reset Successful`,
		});
	} 
    catch (error) {
        console.log(error)
		return res.status(500).json({
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};