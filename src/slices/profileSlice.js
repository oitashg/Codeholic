import { createSlice } from "@reduxjs/toolkit";

//The initital state of slice
const initialState = {
    //Try to parse the user from local storage
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    loading: false,
}

//Creating slice using createSlice
const profileSlice = createSlice({
    name: "profile",
    initialState: initialState,
    reducers: {
        setUser(state, value) {
            state.user = value.payload
        },
        setLoading(state, value){
            state.loading = value.payload
        },
    }
})

export const {setUser, setLoading} = profileSlice.actions
export default profileSlice.reducer