import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {sidebarLinks} from "../../../data/dashboard-links"
import {logout} from "../../../services/operations/authAPI"
import SidebarLink from './SidebarLink'
import { useNavigate } from 'react-router-dom'
import { VscSignOut } from 'react-icons/vsc'
import ConfirmationModal from '../../common/ConfirmationModal'

const Sidebar = () => {

    const {user, laoding: profileLoading} = useSelector((state) => state.profile)
    const {loading: authLoading} = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    //to save the state of confirmationalModal i.e in visible state or not
    //At first there is not data in confirmationModal, so null
    //But then on clicking the button data is set
    const [confirmationalModal, setConfirmationalModal] = useState(null)

    //if any loading value is true, show spinner
    if(authLoading || profileLoading){
        return(
            <div className='grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800'>
                <div className='spinner'></div>
            </div>
        )
    }

    //else show sidebar
    return (
        <div className='flex h-[calc(100vh-3.5rem)] min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 py-10'>
            <div className='flex flex-col'>
                {
                    sidebarLinks.map((link) => {
                        //if accountType of user and type present in that sidebar don't match, then do not render anything
                        if(link.type && user?.accountType !== link.type) return null
                        else{
                            return(
                                <SidebarLink key={link.id} link={link} iconName={link.icon}/>
                            )
                        }
                    })
                }

                <div className='mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700'></div>

                <div className='flex flex-col'>
                    <SidebarLink
                        link={{name:"Settings", path:"dashboard/settings"}}
                        iconName={"VscSettingsGear"}
                    />
                </div>

                <button
                    onClick={() => setConfirmationalModal({
                        text1: "Are you sure?",
                        text2: "You will be logged out of your account",
                        btn1Text: "Logout",
                        btn2Text: "Cancel",
                        btn1Handler: () => dispatch(logout(navigate)),
                        //On clicking Cancel button, modal will become invisible. So setConfirmationModal becomes null
                        btn2Handler: () => setConfirmationalModal(null)
                    })}
                    className='px-8 py-2 text-sm font-medium text-richblack-300'
                >
                    
                    <div className='flex items-center gap-x-2'>
                        <VscSignOut className='text-lg'/>
                        <span>Logout</span>
                    </div>
                </button>
            </div>

            {/* Add the confirmationModal at the end */}
            {/* if null, then it will not render the modal otheriwise it will be visible */}
            {confirmationalModal && <ConfirmationModal modalData={confirmationalModal}/>}
            
        </div>
    )
}

export default Sidebar
