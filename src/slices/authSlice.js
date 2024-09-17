import { createSlice } from "@reduxjs/toolkit";

//The initital state of slice
const initialState = {
    //Try to parse the token from local storage
    //Even after app is closed, token will be stored in local storage
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
    
    //Initially loading is false
    loading: false,

    //When a new user creates a account, the data is stored
    //Then at the time of login, the data is used for verification
    signupData: null
}

//Creating slice using createSlice
const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setToken(state, value) {
            state.token = value.payload
        },
        setLoading(state, value) {
            state.loading = value.payload
        },
        setSignupData(state, value) {
            state.signupData = value.payload
        }
    }
})

export const {setToken, setLoading, setSignupData} = authSlice.actions
export default authSlice.reducer