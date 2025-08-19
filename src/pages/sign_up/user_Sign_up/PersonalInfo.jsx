import { Button, TextField } from "@mui/material";
import Address from "../../../components/address/Address";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAddressR, setPhone } from "../../../redux/signupSlice";

const PersonalInfo = () => {
     const [address, setAddress] = useState();
     const dispatch = useDispatch();

     const getAddress = (address) => {
          setAddress(address);
     }

     const submitData = (e) => {
          e.preventDefault();
          const phone = e.target.phone.value;
          const addressData = address;

          dispatch(setAddressR(addressData));
          dispatch(setPhone(phone));
          // Here you can dispatch the data or handle it as needed
          console.log("Phone:", phone);
          console.log("Address:", addressData);
     }

     return (
          <div className="pt-8 lg:pt-20 flex justify-center items-center h-screen">
               <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-3/5 h-fit px-5 py-6">
                    <h1 className="text-3xl text-center mb-5 font-bold">Contact Information</h1>
                    <form className="space-y-4" onSubmit={submitData}>
                         <div className="grid grid-cols-3 gap-3">
                              <TextField id="phone" label="Phone number" variant="outlined" type="text" fullWidth size="small" required />
                         </div>
                         <div>
                              <h3 className="text-lg">Address</h3>
                              <Address getAddress={getAddress}></Address>
                         </div>
                         <div className="flex justify-center items-center">
                              <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Next</Button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default PersonalInfo;