import { Button,  styled } from "@mui/material";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import profile from "../../../assets/default_profile_pic.png"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setProfilePicture } from "../../../redux/signupSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";

const DriverPhotoUpload = () => {

     const [imagePreview, setImagePreview] = useState(null);
     const [image, setImage] = useState(null);
     const [loading, setLoading] = useState(false);
     const dispatch = useDispatch();
     const navigate = useNavigate();

     const imageUpload = async (image) => {
          const formData = new FormData();
          formData.append('image', image);
          const result = await axios.post(
               `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_imgbb_api_key}`,
               formData
          );
          const url = result.data.data.url;
          if (result.data.status !== 200) {
               toast.error("Image upload failed. Please try again.");
               setImagePreview(null);
               return { url: null };
          }
          else{
               setLoading(false);
          }
          return { url };
     }

     if(loading) {
          return (<Loader></Loader>);
     }

     const handleImageChange = (event) => {
          const file = event.target.files[0];
          setImage(file);
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

     const submitData = async (e) => {
          e.preventDefault();
          setLoading(true);
          const { url } = await imageUpload(image);
          console.log(url);
          if(url !== null){
               toast.success("Image uploaded successfully");
               dispatch(setProfilePicture(url));
               navigate("/sign-up/driver/information-review");
          }
     }

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
          <div className="pt-8 lg:pt-32 flex justify-center items-center">
               <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-3/5 h-fit px-5 py-6">
                    <h1 className="text-3xl text-center mb-5 font-bold">Photo Upload</h1>
                    <form className="space-y-4" onSubmit={submitData}>
                         <div className="flex justify-center pt-4">
                              <div className="flex flex-col items-center justify-center gap-5">
                                   <img src={imagePreview || profile} alt="default_picture" className="w-32 h-32 rounded-full" />
                                   <Button
                                        component="label"
                                        role={undefined}
                                        variant="outlined"
                                        tabIndex={-1}
                                        startIcon={<CloudUpload
                                             load />}
                                        sx={{ textTransform: 'none' }}
                                        size="small"
                                   >
                                        Select Profile Picture
                                        <VisuallyHiddenInput
                                             type="file"
                                             accept="image/*"
                                             onChange={handleImageChange}
                                             multiple
                                        />
                                   </Button>
                              </div>
                         </div>
                         <div className="flex justify-center items-center pt-10">
                              <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Upload</Button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default DriverPhotoUpload;