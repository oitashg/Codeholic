import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../../services/operations/authAPI';

const LoginForm = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    //state of form data along with initialization
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    //State of type of password
    //Initially, password is not shown so false
    const [showPassword, setShowPassword] = useState(false);


    //handles the changes of input
    function changeHandler(event) {
        //saves the previous data and new data also
        setFormData((prevData) => (
            {
                ...prevData,
                [event.target.name]: event.target.value
            }
        ))
    }

    //Extract email and password from the state formData
    const {email, password} = formData

    //Function handling processes and flow after form submission
    const submitHandler = (event) => {
        event.preventDefault()
        dispatch(login(email, password, navigate))
    }

  return (
    <form 
        className='mt-6 flex w-full flex-col gap-y-4'
        onSubmit={submitHandler}
    >
        <label className='w-full'>
            <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                Email Address<sup>*</sup>
            </p>

            {/* Input field(where we fill the form) */}
            <input
                required
                type='email'
                value={formData.email}
                onChange={changeHandler}
                placeholder='Enter email id'
                name='email'
                autoComplete='on'
                style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
                className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'
            />
        </label>

        <label className='relative'>
            <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                Password<sup>*</sup>
            </p>

            <input
                required
                //Here, the type of password is not fixed.
                //So, it depends on a state variable
                //showPassword is true means password can be seen so text format otherwise password format
                type={showPassword ? ("text") : ("password")}
                value={formData.password}
                onChange={changeHandler}
                placeholder='Enter password'
                name='password'
                autoComplete='on'
                style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
                className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-12 text-richblack-5"
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

            {/* Forgot Password Button */}
            <Link to="/forgot-password">
                <p className='mt-1 ml-auto max-w-max text-xs text-blue-100'>
                    Forgot Password
                </p>
            </Link>
        </label>

        {/* Sign in Button */}
        <button
            type='submit'
            className='mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900'
        >
            Sign In
        </button>
        
        {/* --------------OR-------------- */}
        <div className="flex items-center">
            <div className='w-5/12 border-[1px] border-pure-greys-700'></div>
            <div className='w-2/12 text-white px-5'>OR</div>
            <div className='w-5/12 border-[1px] border-pure-greys-700'></div>
        </div>

        {/* Sign in with Google button */}
        <button className='flex items-center gap-2 justify-center py-[8px] px-[12px] border border-pure-greys-700 rounded-[8px]'>
            <FcGoogle/>
            <p className='text-richblack-200'>Sign in with Google</p>
        </button>
    </form>
  )
}

export default LoginForm
