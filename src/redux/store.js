import { configureStore } from '@reduxjs/toolkit'
import signupReducer from '../redux/signupSlice';
import userSignupReducer from '../redux/userSignUpSlice'
// import agencyReducer from '../redux/agencyDataSlice'

const store = configureStore({
    reducer: {
          signup: signupReducer,
          user: userSignupReducer
          // agency: agencyReducer
    }
})

export default store;