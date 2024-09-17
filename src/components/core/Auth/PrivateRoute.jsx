//This is protected route for authenticated users only
//Outsiders can't enter here

import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({children}) => {
    //Token extracted from auth slice
    const {token} = useSelector((state) => state.auth)

    //Token not null means user is authenticated and logged in. So allowed to enter
    if(token !== null) 
        return children
    //Token null means user not authenticated, so back to Login
    else
        return <Navigate to="/login"/>
}

export default PrivateRoute