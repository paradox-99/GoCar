import { createSlice } from '@reduxjs/toolkit';

const initialState = {
     currentStep: 1,
     email: '',
     name: '',
     birthdate: '',
     gender: '',
     nid: '',
     phone: '',
     address: '',
     area: '',
     profilePicture: null,
     completedSteps: [],
     isLoading: false,
     error: null
};

const signupSlice = createSlice({
     name: 'signup',
     initialState,
     reducers: {
          setEmail: (state, action) => {
               state.email = action.payload;
               if (!state.completedSteps.includes(1)) {
                    state.completedSteps.push(1);
               }
          },
          setName: (state, action) => {
               state.name = action.payload;
               if (!state.completedSteps.includes(2)) {
                    state.completedSteps.push(2);
               }
          },
          setBirthdate: (state, action) => {
               state.birthdate = action.payload;
               if (!state.completedSteps.includes(3)) {
                    state.completedSteps.push(3);
               }
          },
          setGender: (state, action) => {
               state.gender = action.payload;
               if (!state.completedSteps.includes(4)) {
                    state.completedSteps.push(4);
               }
          },
          setNID: (state, action) => {
               state.nid = action.payload;
               if (!state.completedSteps.includes(5)) {
                    state.completedSteps.push(5);
               }
          },
          setPhone: (state, action) => {
               state.phone = action.payload;
               if (!state.completedSteps.includes(6)) {
                    state.completedSteps.push(6);
               }
          },
          setAddressR: (state, action) => {
               state.address = action.payload;
               if (!state.completedSteps.includes(7)) {
                    state.completedSteps.push(7);
               }
          },
          setAddressA: (state, action) => {
               state.area = action.payload;
               if (!state.completedSteps.includes(8)) {
                    state.completedSteps.push(8);
               }
          },
          setProfilePicture: (state, action) => {
               state.profilePicture = action.payload;
               if (!state.completedSteps.includes(9)) {
                    state.completedSteps.push(9);
               }
          },
          nextStep: (state) => {
               state.currentStep += 1;
          },
          prevStep: (state) => {
               state.currentStep -= 1;
          },
          setLoading: (state, action) => {
               state.isLoading = action.payload;
          },
          resetSignup: () => initialState,
     },
});

export const {
     setEmail,
     setName,
     setBirthdate,
     setGender,
     setNID,
     setPhone,
     setAddressR,
     setAddressA,
     setProfilePicture,
     nextStep,
     prevStep,
     setLoading,
     resetSignup
} = signupSlice.actions;

export default signupSlice.reducer;