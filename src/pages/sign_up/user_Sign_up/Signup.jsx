import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import google from "../../../assets/search.png"
import { PropagateLoader } from "react-spinners";
import useAuth from "../../../hooks/useAuth";

const Signup = () => {

    const { handleCreateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [terms, setTerms] = useState(false);
    const [error, setError] = useState("")
    const navigate = useNavigate();

    const handleSignUp = (e) => {
        e.preventDefault();

        if (terms) {
            // setLoading(true);
            const email = e.target.email.value;
            const password = e.target.password.value;
            const confirmPassword = e.target.confirmPassword.value;

            if (password === confirmPassword) {
                handleCreateUser(email, password)
                .then(res => {
                    console.log(res);
                    navigate('/sign-up/user-info');
                })
                .catch((error) => {
                    if (error.message === 'Firebase: Error (auth/email-already-in-use).')
                        setError('Email is already in use!')
                })
            }
        }
        else {
            setError("You must agree to the terms and conditions.");
        }
    }

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const termsChecked = (e) => { setTerms(e.target.checked); }

    if (loading) {
        return <div className="w-full h-screen flex justify-center items-center">
            <PropagateLoader
                color="#F58300"
                speedMultiplier={1}
            />
        </div>
    }

    return (
        <div className="pt-8 lg:pt-20 flex justify-center items-center h-screen">
            <div className="lg:border rounded-lg lg:shadow-md min-[600px]:w-1/2 lg:w-1/4 h-fit px-10 py-6">
                <h1 className="text-3xl text-center mb-5 font-bold">Sign up</h1>
                <div className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <TextField id="email" label="Email" variant="outlined" type="email" fullWidth size="small" />
                        <FormControl variant="outlined" fullWidth size="small">
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                id="password"
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
                        <FormControl variant="outlined" fullWidth size="small">
                            <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                            <OutlinedInput
                                id="confirmPassword"
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
                                label="Confirm Password"
                                size="small"
                            />
                        </FormControl>
                        <div className="flex text-sm">
                            <label className="flex justify-center items-center gap-2">
                                <input type="checkbox" name="terms" onChange={termsChecked} />
                                Accept our terms and conditions.
                            </label>
                        </div>
                        <Button variant="contained" type="submit" fullWidth sx={{ backgroundColor: '#F58300', fontWeight: 700 }}>Sign up</Button>
                        {
                            error && <div className="text-red-500 text-sm text-center">{error}</div>
                        }
                    </form>
                    <div>
                        <p className="text-center">Already have an account? <Link to={'/sign-in'} className="text-[#F58300]">Log in</Link></p>
                    </div>
                    <Divider>OR</Divider>
                    <div className="w-full">
                        <Link>
                            <div className="border border-gray-400 rounded p-2 flex gap-2 text-lg font-medium justify-center items-center">
                                <img src={google} alt="" className="w-6" />
                                <p>Sign up with Google</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;