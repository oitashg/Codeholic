import React, { useEffect, useState } from 'react'
import { Link, matchPath } from 'react-router-dom'
import logo from "../../assets/Logo/new_logo.png"
import { NavbarLinks } from '../../data/navbar-links'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import ProfileDropDown from '../core/Auth/ProfileDropDown'
import { apiConnector } from '../../services/apiconnector'
import { categories } from '../../services/apis'
import { IoIosArrowDropdownCircle } from 'react-icons/io'

const Navbar = () => {

    //fetch the states using useSelector hook
    //We are destructuring token, user, totalItems from the reducers
    //auth, profil, cart are the keys that are stored in rootReducer
    //inside those keys, reducers are present
    const {token} = useSelector((state) => state.auth)
    const {user} = useSelector((state) => state.profile)
    const {totalItems} = useSelector((state) => state.cart)

    //calling apis using useEffect
    const [subLinks, setSubLinks] = useState([])
    const [loading, setLoading] = useState(false)

    //This function calls the showAllCategories function from backend with the help of apiConnector function
    //Because we want the category list to show in Catalog in navbar
    //Thats's why we fetch that and save in sublinks
    const fetchSublinks = async() => {
        setLoading(true)
        try{
            const result = await apiConnector("GET", categories.CATEGORIES_API)
            console.log("Printing sublinks result: ", result)
            setSubLinks(result.data.data)
        }
        catch(error){
            console.log("Could not fetch the category list")
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSublinks()
    }, [])

    //to match the path taken from navbar-links and current path taken from window
    const location = useLocation()
    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname)
    }

  return (
    <div className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 
        bg-black transition-all duration-200`}>

        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
        
            {/* Logo */}
            <Link to="/">
                <img src={logo} alt={"not found"} width={150} height={42} loading='lazy'/>
            </Link>

            {/* Navbar Links */}
            <nav className='hidden md:block'>
                <ul className='flex gap-x-6 text-richblack-25'>
                    {
                        // link is each element of the navbar-links array
                        NavbarLinks.map((link, index) => (
                            <li key={index}>
                                {
                                    link.title === "Catalog" ? 
                                    (
                                        <div className='relative flex items-center gap-2 group'>
                                            <p>{link.title}</p>
                                            <IoIosArrowDropdownCircle/>

                                            {/* The rectangler box where catagories are present */}
                                            <div className='invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]'>
                                                {/* Diamond shape thing */}
                                                <div className='absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5'></div>

                                                {/* Adding sublinks data */}
                                                {loading ? (
                                                    <p className="text-center">Loading...</p>
                                                    ) : (subLinks && subLinks.length) ? (
                                                    <>
                                                        {subLinks?.map((subLink, index) => (
                                                            <Link
                                                                to={`/catalog/${subLink.name
                                                                .split(" ")
                                                                .join("-")
                                                                .toLowerCase()}`}
                                                                className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                                                key={index}
                                                            >
                                                                <p>{subLink.name}</p>
                                                            </Link>
                                                        ))}
                                                    </>
                                                    ) : (
                                                    <p className="text-center">No Courses Found</p>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ) : (
                                        <Link to={link?.path}>
                                            <p className={`${matchRoute(link?.path) ? "text-yellow-25" :
                                                "text-richblack-25"}`}>
                                                {link.title}
                                            </p>
                                        </Link>
                                    )
                                }
                            </li>
                        ))
                    }
                </ul>
            </nav>

            {/* Login/Signup/Dashboard */}
            <div className='hidden md:flex gap-x-4 items-center'>

                {/* Cart Symbol */}
                {/* {
                    user && user?.accountType !== "Instructor" && (
                        <Link to="/dashboard/cart" className='relative'>
                            <AiOutlineShoppingCart className='text-2xl text-richblack-100'/>
                            {
                                totalItems > 0 && (
                                    <span className='absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100'>
                                        {totalItems}
                                    </span>
                                )
                            }
                        </Link>
                    )
                } */}

                {/* Log in button */}
                {/* token is null means user is not logged in */}
                {
                    token === null && (
                        <Link to="/login">
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                Log in
                            </button>
                        </Link>
                    )
                }

                {/* Sign up button */}
                {
                    token === null && (
                        <Link to="/signup">
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                Sign Up
                            </button>
                        </Link>
                    )
                }
                
                {/* Token not null..i.e..user logged in */}
                {/* ProfileDropDown component */}
                {
                    token !== null && <ProfileDropDown/>
                }

            </div>
        </div>
    </div>
  )
}

export default Navbar
