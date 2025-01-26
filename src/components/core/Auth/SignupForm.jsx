import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSignupData } from '../../../slices/authSlice';
import { sendOtp } from '../../../services/operations/authAPI';

const SignupForm = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    //state of form data along with initialization
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    //State of type of password
    //Initially, password is not shown so false
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const[accountType, setAccountType] = useState("Student")

    //handles the changes of input fields
    function changeHandler(event) {
        //saves the previous data and new data also
        setFormData((prevData) => (
            {
                ...prevData,
                [event.target.name]: event.target.value
            }
        ))
    }

    //Extract from the state formData
    const {firstName, lastName, email, password, confirmPassword} = formData

    //Function for handling after form submission
    function submitHandler(event) {
        event.preventDefault()

        if(password !== confirmPassword){
            toast.error("Passwords do not match")
            return
        }

        //collecting the signup data
        const signupData = {
            ...formData,
            accountType
        }
        
        console.log("Signup data before sending otp -> ", signupData)
        
        //Setting signup data to state
        //To be used after OTP verification
        dispatch(setSignupData(signupData))

        //send otp to uer for verification
        dispatch(sendOtp(email, navigate))

        //reset
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        })
        
        setAccountType("Student")
    }

  return (
    <div>
        {/* Student-Instructor tab */}
        <div className='flex bg-richblack-800 p-1 gap-x-1 my-6 rounded-full max-w-max'>
            <button 
                className={`${accountType === "Student" ? 
                "bg-richblack-900 text-richblack-5" : 
                "bg-transparent text-richblack-200"}
                py-2 px-5 rounded-full transition-all duration-200`}
                onClick={() => setAccountType("Student")}
            >
                Student
            </button>

            <button 
                className={`${accountType === "Instructor" ? 
                "bg-richblack-900 text-richblack-5" : 
                "bg-transparent text-richblack-200"}
                py-2 px-5 rounded-full transition-all duration-200`}
                onClick={() => setAccountType("Instructor")}
            >
                Instructor
            </button>
        </div>

        <form 
            className='flex w-full flex-col gap-y-4'
            onSubmit={submitHandler}
        >

            {/* First and Last name */}
            <div className='flex gap-x-4'>
                <label>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        First Name<sup className='text-pink-200'>*</sup>
                    </p>
                    <input
                        required
                        type='text'
                        name='firstName'
                        onChange={changeHandler}
                        placeholder='Enter First Name'
                        value={formData.firstName}
                        autoComplete='on'
                        style={{
                            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
                    />
                </label>

                <label>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Last Name<sup className='text-pink-200'>*</sup>
                    </p>
                    <input
                        required
                        type='text'
                        name='lastName'
                        onChange={changeHandler}
                        placeholder='Enter Last Name'
                        value={formData.lastName}
                        autoComplete='on'
                        style={{
                            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
                    />
                </label>
            </div>

            {/* Email */}
            <label className='w-full'>
                <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                    Email Address<sup className='text-pink-200'>*</sup>
                </p>
                <input
                    required
                    type='email'
                    name='email'
                    onChange={changeHandler}
                    placeholder='Enter Email Address'
                    value={formData.email}
                    autoComplete='on'
                    style={{
                        boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                    }}
                    className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
                />
            </label>

            {/* Password and confirm Password */}
            <div className='flex gap-x-4'>
                <label className='relative'>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Create Password<sup className='text-pink-200'>*</sup>
                    </p>
                    <input
                        required
                        type={showPassword ? ("text") : ("password")}
                        name='password'
                        onChange={changeHandler}
                        placeholder='Enter password'
                        value={formData.password}
                        autoComplete='on'
                        style={{
                            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5"
                    />

                    {/* Password visible/invisible icon */}
                    {/* This function just reverse the showPassword state on clicking */}
                    {/* prev is nothing the previous value i.e value that already exist */}
                    <span 
                        onClick={() => setShowPassword((prev) => !prev)}
                        className='absolute right-3 top-[38px] z-[10] cursor-pointer'
                    >

                        {showPassword ? (
                            <AiOutlineEye fontSize={24} fill="#AFB2BF"/>) : (
                            <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF"/>)}

                    </span>
                </label>

                <label className='relative'>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Confirm Password<sup className='text-pink-200'>*</sup>
                    </p>
                    <input
                        required
                        type={showConfirmPassword ? ("text") : ("password")}
                        name='confirmPassword'
                        onChange={changeHandler}
                        placeholder='Enter password'
                        value={formData.confirmPassword}
                        autoComplete='on'
                        style={{
                            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5"
                    />

                    {/* Password visible/invisible icon */}
                    {/* This function just reverse the showPassword state on clicking */}
                    {/* prev is nothing the previous value i.e value that already exist */}
                    <span 
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className='absolute right-3 top-[38px] z-[10] cursor-pointer'
                    >

                        {showConfirmPassword ? (
                            <AiOutlineEye fontSize={24} fill="#AFB2BF"/>) : (
                            <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF"/>)}

                    </span>
                </label>
            </div>

            {/* Sign up button */}
            <button
                type='submit'
                className='mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900'
            >
                Create Account
            </button>
        </form>
        
    </div>
  )
}

export default SignupForm
