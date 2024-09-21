import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../slices/authSlice"
import profileReducer from "../slices/profileSlice"
import cartReducer from "../slices/cartSlice"
import courseReducer from '../slices/courseSlice'
import viewCourseReducer from '../slices/viewCourseSlice'

//There will be many reducers, so all reducers are combined into rootReducer
//rootReducer is passed into store in index.js
//Reducers are made from slices
//So we will add/combine reducers here one by one 
const rootReducer = combineReducers({
    auth: authReducer,
    profile: profileReducer,
    cart: cartReducer,
    course: courseReducer,
    viewCourse: viewCourseReducer,
})

export default rootReducer