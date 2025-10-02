import { configureStore } from '@reduxjs/toolkit'
import signupReducer from '../redux/signupSlice';
import userSignupReducer from '../redux/userSignUpSlice'
// import agencyReducer from '../redux/agencyDataSlice'
import driverSignupReducer from '../redux/driverSignupSlice';

const store = configureStore({
    reducer: {
          signup: signupReducer,
          user: userSignupReducer,
          driver: driverSignupReducer,
          // agency: agencyReducer
    }
})

export default store;