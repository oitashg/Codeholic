const {instance} = require("../config/razorpay")
const Course = require("../models/Course")
const CourseProgress = require("../models/CourseProgress")
const User = require("../models/User")
const crypto = require("crypto")
const { default: mongoose } = require("mongoose")

const mailSender = require("../utils/mailSender")
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail")
const {paymentSuccessEmail} = require("../mail/templates/paymentSuccessEmail")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId)
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment   = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)

      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } 
    catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}

//-------------------------------------------------------------------------------------------------------------

// //capture the payment and initiate the Razorpay order
// exports.capturePayment = async(req, res) => {

//     //get courseID and userID
//     const {course_id} = req.body
//     const userId = req.user.id
//     console.log(userId)

//     //validation
//     //check if courseID is valid or not
//     if(!course_id){
//         return res.json({
//             success: false,
//             message: "Please provide valid course id",
//         })
//     }

//     //valid course details
//     let course //course includes all the details of course schema
//     try{
//         course = await Course.findById(course_id)
//         if(!course){
//             return res.json({
//                 success: false,
//                 message: "Could not find the course",
//             })
//         }

//         //check if user has already paid for the same course
//         //There is a studentsEnrolled model in course schema
//         //We check whether this userID is already present in that studentsEnrolled array or not
//         //But userID is of number and in array user was ref..i.e..object id...so we have to change userid from number to string and then string to objectID
//         const uid = new mongoose.Types.ObjectId(toString(userId))
//         if(course.studentsEnrolled.includes(uid)){
//             return res.status(200).json({
//                 success: false,
//                 message: "Student is already enrolled",
//             })
//         }
//     }
//     catch(error){
//         console.error(error)
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         })
//     }

//     //create order
//     const amount = course.price
//     const currency = "INR"

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: Math.random(Date.now()).toString(),
//         notes: {
//             courseId: course_id,
//             userId,
//         }
//     }

//     try{
//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options)
//         console.log(paymentResponse)

//         //return response
//         return res.status(200).json({
//             success: true,
//             //extracted from course details
//             courseName: course.courseName,
//             courseDescription: course.courseDescription,
//             thumbnail: course.thumbnail,
//             //extracted from payment response
//             orderId: paymentResponse.id,
//             currency: paymentResponse.currency,
//             amount: paymentResponse.amount,
//         })
//     }
//     catch(error){
//         console.log(error)
//         return res.json({
//             success: false,
//             message: "Could not initiate order",
//         })
//     }
// }

// //verify Signature of Razorpay and server
// exports.verifySignature = async(req, res) => {
//     //it is the secret key prersent in backend/server
//     const webhookSecret = "12345678"

//     //it is the secret key present in request send from razorpay
//     //we have to check whether the above or below one match or not
//     const signature = req.headers["x-razorpay-signature"]

//     //Webhooksecret is being converted to an encrypted code "shasum" using sha algorithm
//     //Then it is converted to string
//     //Then with the help of digest function, it is converted from hexadecimal format
//     //And then it is comapared with the key we got from razorpay...i.e...signature
//     const shasum = crypto.createHmac("sha256", webhookSecret)
//     shasum.update(JSON.stringify(req.body))
//     const digest = shasum.digest("hex") //hexadecimal format

//     if(signature === digest){
//         console.log("Payment is authorized")

//         //Here we cannot get courseId and userId from req.body as the request is not coming from frontend
//         //it is coming from razorpay
//         //In capturePayment function, we have stored ids inside the notes in options
//         //After logging paymentResponse we get the path where notes is present inside request
//         //So we are extracting ids from that path
//         const {courseId, userId} = req.body.payload.payment.entity.notes

//         try{
//             //fulfill the action

//             //find the course and enroll the student in it
//             //i.e...add the student/user objectID in the studentsEnrolled array in course schema
//             const enrolledCourse = await Course.findOneAndUpdate(
//                                                 {_id: courseId},
//                                                 {$push: {
//                                                     studentsEnrolled: userId
//                                                 }},
//                                                 {new: true})

//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success: false,
//                     message: "Course not found"
//                 })
//             }

//             console.log(enrolledCourse)

//             //find the student and add the course in the list of enrolled courses of that student
//             //i.e...add the course objectID in the courses array in student schema
//             const enrolledStudent = await User.findOneAndUpdate(
//                                         {_id: userId},
//                                         {$push: {
//                                             courses: courseId
//                                         }},
//                                         {new: true})
            
//             console.log(enrolledStudent)
            
//             //send the confirmation mail to the student..i.e...student can start learning
//             //Later it will be integrated with the "courseEnrollmentEmail" template
//             const emailResponse = await mailSender(
//                                     enrolledStudent.email,
//                                     "Congratulations from Codeholic",
//                                     "Congratulations, yoou are onboarded into new course",  
//             )

//             console.log(emailResponse)

//             //return response
//             return res.status(200).json({
//                 success: true,
//                 message: "Signature verified and course added",
//             })
//         }
//         catch(error){
//             console.log(error)
//             return res.status(500).json({
//                 success: false,
//                 message: error.message,
//             })
//         }
//     }
//     else{
//         return res.status(400).json({
//             success: false,
//             message: "Invalid request",
//         })
//     }
// }

// // Send Payment Success Email
// exports.sendPaymentSuccessEmail = async (req, res) => {
//     const { orderId, paymentId, amount } = req.body
  
//     const userId = req.user.id
  
//     if (!orderId || !paymentId || !amount || !userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Please provide all the details" })
//     }
  
//     try {
//       const enrolledStudent = await User.findById(userId)
  
//       await mailSender(
//         enrolledStudent.email,
//         `Payment Received`,
//         paymentSuccessEmail(
//           `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
//           amount / 100,
//           orderId,
//           paymentId
//         )
//       )
//     } catch (error) {
//       console.log("error in sending mail", error)
//       return res
//         .status(400)
//         .json({ success: false, message: "Could not send email" })
//     }
//   }
  
// // enroll the student in the courses
// const enrollStudents = async (courses, userId, res) => {
//     if (!courses || !userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Please Provide Course ID and User ID" })
//     }
  
//     for (const courseId of courses) {
//       try {
//         // Find the course and enroll the student in it
//         const enrolledCourse = await Course.findOneAndUpdate(
//           { _id: courseId },
//           { $push: { studentsEnroled: userId } },
//           { new: true }
//         )
  
//         if (!enrolledCourse) {
//           return res
//             .status(500)
//             .json({ success: false, error: "Course not found" })
//         }
//         console.log("Updated course: ", enrolledCourse)
  
//         const courseProgress = await CourseProgress.create({
//           courseID: courseId,
//           userId: userId,
//           completedVideos: [],
//         })
//         // Find the student and add the course to their list of enrolled courses
//         const enrolledStudent = await User.findByIdAndUpdate(
//           userId,
//           {
//             $push: {
//               courses: courseId,
//               courseProgress: courseProgress._id,
//             },
//           },
//           { new: true }
//         )
  
//         console.log("Enrolled student: ", enrolledStudent)

//         // Send an email notification to the enrolled student
//         const emailResponse = await mailSender(
//           enrolledStudent.email,
//           `Successfully Enrolled into ${enrolledCourse.courseName}`,
//           courseEnrollmentEmail(
//             enrolledCourse.courseName,
//             `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//           )
//         )
  
//         console.log("Email sent successfully: ", emailResponse.response)
//       } catch (error) {
//         console.log(error)
//         return res.status(400).json({ success: false, error: error.message })
//       }
//     }
// }