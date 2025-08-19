import { createSlice } from "@reduxjs/toolkit";

const userSignUpSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
    },
});

export const {setUserData} = userSignUpSlice.actions;
export default userSignUpSlice.reducer;