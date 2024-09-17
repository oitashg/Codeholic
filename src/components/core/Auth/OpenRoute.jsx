//This will prevent authenticated users from accessing this route

import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

function OpenRoute({children}) {
    //Token extracted from auth slice
    const {token} = useSelector((state) => state.auth)

    //Token null means user not logged in. So allowed to log in/sign up
    if(token === null)
        return children
    //Token not null means user logged in so navigate to dashboard
    else
        return <Navigate to='/dashboard/my-profile'/>
}

export default OpenRoute
