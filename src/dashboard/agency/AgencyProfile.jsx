import { Button, Divider, TextField } from "@mui/material";
import { useQuery } from '@tanstack/react-query'
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useRole from "../../hooks/useRole";

const AgencyProfile = () => {

     const role = useRole();
     const axiosPublic = useAxiosPublic();

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`agencyRoutes/getAgencyDetails2/${role._id}`);
               return response.data;
          },
     })

     // const registrationDate = data?.registration_date.split('T')[0];
     // const licenseDate = data?.licenseExpireDate.split('T')[0];

     return (
          <div>
               <h1 className="text-4xl text-center mt-12 font-semibold">Agency Information</h1>
               {
                    data ?
                         <>
                              <div className="my-10 flex justify-evenly">
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Agency_id: </p>
                                             <TextField variant="outlined" value={data?.agency_id} disabled />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Email: </p>
                                             <TextField variant="outlined" value={data?.agency_Email} />
                                        </div>

                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Total Vehicles: </p>
                                             <TextField variant="outlined" value={data.total_vehicles} />
                                        </div>
                                   </div>
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Name: </p>
                                             <TextField variant="outlined" value={data?.agency_Name} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Phone: </p>
                                             <TextField variant="outlined" value={data.phone_Number} />
                                        </div>
                                   </div>
                              </div>
                              <Divider></Divider>
                              <div className="mt-10 flex justify-evenly">
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Business Reg. Number: </p>
                                             <TextField variant="outlined" value={data?.businessRegNumber} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Status: </p>
                                             <TextField variant="outlined" value={data?.status} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Verified: </p>
                                             <TextField variant="outlined" value={data.verified === 1 ? "Yes" : "No"} />
                                        </div>
                                   </div>
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>TIN: </p>
                                             <TextField variant="outlined" value={data?.TIN} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Registration Date: </p>
                                             <TextField variant="outlined" value={data?.registration_date.split('T')[0]} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Expire Date: </p>
                                             <TextField variant="outlined" value={data?.licenseExpireDate.split('T')[0]} />
                                        </div>
                                   </div>
                              </div>
                              <div>
                                   <h1 className="text-3xl text-center mt-8 font-semibold">Address</h1>
                                   <div className="flex justify-center gap-5 my-8">
                                        <TextField variant="outlined" label="District" value={data.district} />
                                        <TextField variant="outlined" label="Upazilla" value={data.upazilla} />
                                        <TextField variant="outlined" label="KeyArea" value={data.keyArea} />
                                        <TextField variant="outlined" label="Area" value={data.area} />
                                   </div>
                              </div>
                              <Divider></Divider>
                              <div className="flex justify-center gap-5 mt-8">
                                   <TextField variant="outlined" label="License number" value={data.license_number} />
                                   <TextField variant="outlined" label="Expire date" value={data.expire_date} />
                                   <TextField variant="outlined" label="Experience" value={data.experience} />
                              </div>
                              <div className="flex justify-center mt-10 pb-10">
                                   <div className="flex flex-col items-center">
                                        <img src={data.image} alt="Profile picture" className="w-32 h-32 rounded-full mb-5" />
                                        <Button variant="contained" sx={{ background: '#F58300' }}>Edit</Button>
                                   </div>
                              </div>
                         </> :
                         <h1>...Loading</h1>
               }
          </div>
     );
};

export default AgencyProfile;