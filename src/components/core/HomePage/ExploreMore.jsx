import React, { useState } from 'react'
import {HomePageExplore} from  "../../../data/homepage-explore"
import HighlightText from './HighlightText'
import CourseCard from './CourseCard'

//Store the tab names in an array
const tabsName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skills paths",
    "Career paths",
]

const ExploreMore = () => {

    //Use states are defined and initialized in right side
    const [currentTab, setCurrentTab] = useState(tabsName[0])
    const [courses, setCourses] = useState(HomePageExplore[0].courses)
    const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading)

    //Function to set my current card
    //value is actually tab name
    const setMyCards = (value) => {
        setCurrentTab(value);
        //store the details of every element whose tag equals value using fliter function
        //result is also an array
        const result = HomePageExplore.filter((course) => course.tag === value)
        setCourses(result[0].courses)
        setCurrentCard(result[0].courses[0].heading)
    }

  return (
    <div>
        {/* Heading */}
        <div className='text-4xl font-semibold text-center'>
            Unlock the 
            <HighlightText text={"Power of Code"}/>
        </div>

        {/* Paragraph */}
        <p className='text-center text-richblack-300 text-sm text-[16px] mt-3'>
            Learn to build anything you can imagine
        </p>

        {/* Tab section */}
        <div className='hidden mt-5 lg:flex flex-row rounded-full bg-richblack-800 border-richblack-100 px-1 py-1'>
            {
                tabsName.map((element, index) => {
                    return (
                        <div className={`text-[16px] flex flex-row items-center gap-2
                        ${currentTab === element
                        ? "bg-richblack-900 text-richblack-5 font-medium"
                        : "text-richblack-200"} rounded-full transition-all duration-200 cursor-pointer
                        hover:bg-richblack-900 hover:text-richblack-5 px-7 py-[7px]`}
                        key={index}
                        onClick={() => setMyCards(element)}>
                            {element}
                        </div>
                    )
                })
            }
        </div>
        
        {/* Create a space or margin by adding a empty div of some height */}
        <div className='hidden lg:block lg:h-[200px]'></div>

        {/* Cards */}
        <div className='lg:absolute gap-10 justify-center lg:gap-0 flex lg:justify-between flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3'>
            {
                courses.map((element, index) => {
                    return(
                        <CourseCard
                        key={index}
                        cardData = {element}
                        currentCard= {currentCard}
                        setCurrentCard= {setCurrentCard}/>
                    )
                })
            }
        </div>

    </div>
  )
}

export default ExploreMore
