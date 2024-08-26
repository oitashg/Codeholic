const {instance} = require("../config/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail")
const { default: mongoose } = require("mongoose")


//capture the payment and initiate the Razorpay order
exports.capturePayment = async(req, res) => {

    //get courseID and userID
    const {course_id} = req.body
    const userId = req.user.id
    console.log(userId)

    //validation
    //check if courseID is valid or not
    if(!course_id){
        return res.json({
            success: false,
            message: "Please provide valid course id",
        })
    }

    //valid course details
    let course //course includes all the details of course schema
    try{
        course = await Course.findById(course_id)
        if(!course){
            return res.json({
                success: false,
                message: "Could not find the course",
            })
        }

        //check if user has already paid for the same course
        //There is a studentsEnrolled model in course schema
        //We check whether this userID is already present in that studentsEnrolled array or not
        //But userID is of number and in array user was ref..i.e..object id...so we have to change userid from number to string and then string to objectID
        const uid = new mongoose.Types.ObjectId(toString(userId))
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success: false,
                message: "Student is already enrolled",
            })
        }
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

    //create order
    const amount = course.price
    const currency = "INR"

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    }

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options)
        console.log(paymentResponse)

        //return response
        return res.status(200).json({
            success: true,
            //extracted from course details
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            //extracted from payment response
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })
    }
    catch(error){
        console.log(error)
        return res.json({
            success: false,
            message: "Could not initiate order",
        })
    }
}

//verify Signature of Razorpay and server
