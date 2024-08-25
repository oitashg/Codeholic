const Profile = require("../models/Profile")
const User = require("../models/User")


//update Profile handler function
exports.updateProfile = async(req, res) => {

    try{
        //get the data
        const {dateofBirth = "", about = "", contactNumber, gender} = req.body

        //get the userID
        const id = req.user.id

        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: "All fileds are required",
            })
        }

        //find profile
        //first find user details with the help of userID
        //then extract profile ID..i.e..additionalDetails from user schema
        //then find profile details with the help of that profileID
        const userDetails = await User.findById(id)
        const profileId = userDetails.additionalDetails
        const profileDetails = await Profile.findById(profileId)

        //update profile
        //Here we are not creating a new entry of profile in database
        //Previously already a null or empty profile was being created
        //We are just updating that now by using save()
        //Another way to update the values in database..i.e..by save
        //When object already present(here profileDetails) then use save
        //First one was by create...here no object was created
        profileDetails.dateOfBirth = dateofBirth
        profileDetails.about = about
        profileDetails.gender = gender
        profileDetails.contactNumber = contactNumber
        await profileDetails.save()

        //return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//delete Account handler function
//Explore how can we schedule this deleteion operation
//Like if we send a request to delete account today, it will be executed after 5 days
exports.deleteAccount = async(req, res) => {

    try{
        //get id and user details
        const id = req.user.id
        const userDetails = await User.findById(id)

        //validation
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        //delete profile associated with that user
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails})

        //TODO: Unenroll user form all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id: id})

        //return response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User can't be deleted",
        })
    }
}

//get all User details handler function
exports.getAllUserDetails = async(req, res) => {

    try{
        //get id
        const id = req.user.id

        //validation and get user details
        //By findById we get all the user details
        //But in user schema we get profile details as ref i.e objectID
        //To extract the details of any ObjectID, we ahve to use populate("that_model_name").exec()
        const userDetails = await User.findById(id).populate("additionalDetails").exec()

        //return response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}