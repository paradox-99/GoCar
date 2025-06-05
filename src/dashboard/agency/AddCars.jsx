// import useAxiosPublic from '../../hooks/useAxiosPublic';
// import useRole from '../../hooks/useRole';
import { Button, Divider, styled, TextField } from '@mui/material';
import { useState } from 'react';
import { CloudUpload } from '@mui/icons-material';
import profile from "../../assets/travel.png"

const AddCars = () => {
     // const role = useRole();
     // const axiosPublic = useAxiosPublic();
     const [numOfCar, setNumOfCar] = useState(0);
     const [imagePreview, setImagePreview] = useState(null);

     const handleImageChange = (event) => {
          const file = event.target.files[0];
          if (file) {
               const reader = new FileReader();
               reader.onload = (e) => {
                    setImagePreview(e.target.result);
               };
               reader.readAsDataURL(file);
          } else {
               setImagePreview(null);
          }
     };

     const VisuallyHiddenInput = styled('input')({
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          height: 1,
          overflow: 'hidden',
          position: 'absolute',
          bottom: 0,
          left: 0,
          whiteSpace: 'nowrap',
          width: 1,
     });

     return (
          <div>
               <h1 className="text-4xl text-center mt-12 font-semibold">Add Cars</h1>
               <div className='flex gap-4 items-center justify-center mt-10'>
                    <p>Number of Cars:</p>
                    <TextField
                         type="number"
                         value={numOfCar}
                         onChange={(e) => setNumOfCar(e.target.value)}
                    />
               </div>
               {
                    numOfCar > 0 && Array.from({ length: numOfCar }, (_, i) => i).map((i) => (
                         <>
                              <h1 className='text-2xl text-center font-bold mt-10'>Car - {i + 1}</h1>
                              <div className="my-10 flex justify-evenly">
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Brand: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Car type: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Build Year: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Mileage: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Fuel: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>AC: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Bluetooth: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Central Locking: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Rental Price: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                   </div>
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Model: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Trim level: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Seats: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Gear: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Transmission type: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>GPS: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Heater: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>About: </p>
                                             <TextField variant="outlined" multiline rows={4}/>
                                        </div>
                                   </div>
                              </div>
                              <Divider></Divider>
                              <div className="my-10 flex justify-evenly">
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>License Number: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Fitness Certificate: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Insurance Number: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Insurance Start Date: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Insurance Coverage Type: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                   </div>
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>License Expire Date: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Issuing Authority: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Insurance Provider: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Insurance End Date: </p>
                                             <TextField variant="outlined" />
                                        </div>
                                   </div>
                              </div>
                              <Divider/>
                              <div className="flex justify-center pt-4 mb-10">
                                   <div className="flex flex-col items-center justify-center gap-5">
                                        <img src={imagePreview || profile} alt="default_picture" className="w-32 h-32 rounded-full" />
                                        <Button
                                             component="label"
                                             role={undefined}
                                             variant="contained"
                                             tabIndex={-1}
                                             startIcon={<CloudUpload
                                                  load />}
                                             sx={{ background: '#F58300' }}
                                             size="small"
                                        >

                                             Car Picture
                                             <VisuallyHiddenInput
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={handleImageChange}
                                                  multiple
                                                  required
                                             />
                                        </Button>
                                   </div>
                              </div>
                              <div className='border-b-4 rounded-full border-primary'></div>
                         </>))
               }
               <div className="flex justify-center mt-10 pb-10">
                    <Button variant="contained" sx={{ background: '#F58300' }}>Add</Button>
               </div>
          </div>
     );
};

export default AddCars;