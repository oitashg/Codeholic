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
exports.verifySignature = async(req, res) => {
    //it is the secret key prersent in backend/server
    const webhookSecret = "12345678"

    //it is the secret key present in request send from razorpay
    //we have to check whether the above or below one match or not
    const signature = req.headers["x-razorpay-signature"]

    //Webhooksecret is being converted to an encrypted code "shasum" using sha algorithm
    //Then it is converted to string
    //Then with the help of digest function, it is converted from hexadecimal format
    //And then it is comapared with the key we got from razorpay...i.e...signature
    const shasum = crypto.createHmac("sha256", webhookSecret)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest("hex") //hexadecimal format

    if(signature === digest){
        console.log("Payment is authorized")

        //Here we cannot get courseId and userId from req.body as the request is not coming from frontend
        //it is coming from razorpay
        //In capturePayment function, we have stored ids inside the notes in options
        //After logging paymentResponse we get the path where notes is present inside request
        //So we are extracting ids from that path
        const {courseId, userId} = req.body.payload.payment.entity.notes

        try{
            //fulfill the action

            //find the course and enroll the student in it
            //i.e...add the student/user objectID in the studentsEnrolled array in course schema
            const enrolledCourse = await Course.findOneAndUpdate(
                                                {_id: courseId},
                                                {$push: {
                                                    studentsEnrolled: userId
                                                }},
                                                {new: true})

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                })
            }

            console.log(enrolledCourse)

            //find the student and add the course in the list of enrolled courses of that student
            //i.e...add the course objectID in the courses array in student schema
            const enrolledStudent = await User.findOneAndUpdate(
                                        {_id: userId},
                                        {$push: {
                                            courses: courseId
                                        }},
                                        {new: true})
            
            console.log(enrolledStudent)
            
            //send the confirmation mail to the student..i.e...student can start learning
            //Later it will be integrated with the "courseEnrollmentEmail" template
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulations from Codeholic",
                                    "Congratulations, yoou are onboarded into new course",  
            )

            console.log(emailResponse)

            //return response
            return res.status(200).json({
                success: true,
                message: "Signature verified and course added",
            })
        }
        catch(error){
            console.log(error)
            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        })
    }
}