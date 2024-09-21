import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button"
import Banner from "../assets/Images/banner.mp4"
import CodeBlocks from '../components/core/HomePage/CodeBlocks'
import TimeLineSection from '../components/core/HomePage/TimeLineSection'
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ExploreMore from '../components/core/HomePage/ExploreMore'
import ReviewSlider from '../components/common/ReviewSlider'

const Home = () => {
  return (
    <div>
        {/* Section 1 */}
        <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between'>

            {/* Button */}
            <Link to={"/signup"}>
                <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200
                transition-all duration-200 hover:scale-95 w-fit'>
                    <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                    transition-all duration-200 group-hover:bg-richblack-900'>
                        <p>Become an instructor</p>
                        <FaArrowRight/>
                    </div>
                </div>
            </Link>

            {/* Heading */}
            <div className='text-center text-4xl font-semibold mt-7'>
                Empower Your Future 
                <HighlightText text={"Coding Skills"}/>
            </div>

            {/* Sub-heading */}
            <div className='mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
                With our online coding courses, you can learn at your own pace, from
                anywhere in the world, and get access to a wealth of resources,
                including hands-on projects, quizzes, and personalized feedback from
                instructors.
            </div>
            
            {/* Buttons */}
            <div className='flex flex-row gap-7 mt-8'>
                {/* From here values are send to the Button component
                then that component is doing the ultimate work in general way
                so that it works for every button*/}

                <CTAButton active={true} linkto={"/signup"}>
                    {/* This text will be the children of Button function */}
                    Learn More
                </CTAButton>

                <CTAButton active={false} linkto={"/login"}>
                    {/* This text will be the children of Button function */}
                    Book a Demo
                </CTAButton>
            </div>
            
            {/* Video */}
            <div className='mx-3 my-12 shadow-blue-200'>
                <video
                muted
                loop
                autoPlay>
                    <source src={Banner} type='video/mp4'>

                    </source>

                </video>
            </div>
            
            {/* Code Section 1 */}
            <div>
                <CodeBlocks
                    position={"lg:flex-row"}
                    heading={
                        <div className='text-4xl font-semibold'>
                            Unlock Your
                            <HighlightText text={"Coding potential "}/>
                            with our online courses
                        </div>
                    }
                    subheading={
                        "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
                    }
                    ctabtn1={
                        {
                            btnText: "Try it yourself",
                            linkto: "/signup",
                            active: true,
                        }
                    }
                    ctabtn2={
                        {
                            btnText: "Learn more",
                            linkto: "/login",
                            active: false,
                        }
                    }

                    codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
                    codeColor={"text-yellow-25"}
                />
            </div>

            {/* Code Section 2 */}
            <div>
                <CodeBlocks
                    //By using flex-row-reverse the 2 sections get swapped
                    position={"lg:flex-row-reverse"}
                    heading={
                        <div className='w-[100%] text-4xl font-semibold lg:w-[50%]'>
                            Start
                            <HighlightText text={"coding in seconds"}/>
                        </div>
                    }
                    subheading={
                        "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
                    }
                    ctabtn1={
                        {
                            btnText: "Continue Lesson",
                            linkto: "/signup",
                            active: true,
                        }
                    }
                    ctabtn2={
                        {
                            btnText: "Learn more",
                            linkto: "/login",
                            active: false,
                        }
                    }

                    codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
                    codeColor={"text-white"}
                />
            </div>

            {/* Explore More Section */}
            <ExploreMore/>

        </div>

        {/* Section 2 */}
        <div className='bg-pure-greys-5 text-richblack-700'>
            
            {/* Background and buttons */}
            {/* homepage_bg is the background image. It's configuration is written in App.css */}
            <div className='homepage_bg h-[320px]'>

                <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
                    {/* Empty div with a height to cover the space and create a gap */}
                    <div className='h-[150px]'></div>

                    {/* Buttons */}
                    <div className='flex flex-row gap-7 text-white'>
                        <CTAButton active={true} linkto={"/signup"}>
                            <div className='flex flex-row items-center gap-3'>
                                Explore Full Catalog
                                <FaArrowRight/>
                            </div>
                        </CTAButton>

                        <CTAButton active={false} linkto={"/signup"}>
                            <div>
                                Learn More
                            </div>
                        </CTAButton>
                    </div>

                </div>

            </div>
            
            {/* Sub-section */}
            <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-8'>

                {/* Boxes */}
                <div className='mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0'>

                    {/* Box 1 */}
                    <div className='text-4xl font-semibold lg:w-[45%]'>
                        Get the skills you need for a {""}
                        <HighlightText text={"Job that is in demand"}/>
                    </div>
                    
                    {/* Box 2 */}
                    <div className='flex flex-col gap-10 lg:w-[40%] items-start'>

                        {/* Paragraph */}
                        <div className='text-[16px]'>
                            The modern StudyNotion is the dictates its own terms. Today, to
                            be a competitive specialist requires more than professional
                        </div>

                        {/* Button */}
                        <div>
                            <CTAButton active={true} linkto={"/signup"}>
                                <div>
                                    Learn more
                                </div>
                            </CTAButton>
                        </div>

                    </div>

                </div>

                {/* TimeLine Section */}
                <TimeLineSection/>
            
                {/* LearningLanguage Section */}
                <LearningLanguageSection/>

            </div>

        </div>

        {/* Section 3 */}
        <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
            {/* Become a instructor section */}
            <InstructorSection />

            {/* Reviws from Other Learner */}
            <h1 className="text-center text-4xl font-semibold mt-8">
            Reviews from other learners
            </h1>
            <ReviewSlider />

        </div>
        
        {/* Footer */}
        <Footer/>
    </div>
  )
}

export default Home
