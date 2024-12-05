import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import google from "../../assets/search.png"

const Signin = () => {

    const user = '';
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    return (
        <div className="pt-8 lg:pt-20 flex justify-center items-center h-screen">
            <div className="lg:border rounded-lg lg:shadow-md lg:w-1/4 h-fit px-10 py-6">
                <h1 className="text-3xl text-center mb-5 font-bold">Sign in</h1>
                <div className="space-y-4">
                    <TextField id="email" label="Email" variant="outlined" type="email" fullWidth size="small"/>
                    <FormControl variant="outlined" fullWidth size="small">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                            size="small"
                        />
                    </FormControl>
                    <div className="">
                        <Link>Forgotten password?</Link>
                    </div>
                    <Button variant="contained" fullWidth sx={{ backgroundColor: '#F58300', fontWeight: 700 }}>Sign in</Button>
                    <div>
                        <p className="text-center">Don&rsquo;t have an account? <Link to={'/sign-up'} className="text-[#F58300]">Create new</Link></p>
                    </div>
                    <Divider>OR</Divider>
                    <div className="w-full">
                        <Link>
                            <div className="border border-gray-400 rounded p-2 flex gap-2 text-lg font-medium justify-center items-center">
                                <img src={google} alt="" className="w-6" />
                                <p>Sign in with Google</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;