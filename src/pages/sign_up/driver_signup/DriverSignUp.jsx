import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import google from "../../../assets/search.png"
import { PropagateLoader } from "react-spinners";
import useAuth from "../../../hooks/useAuth";
import { sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../redux/userSignUpSlice";
import { nextStep, setEmail } from "../../../redux/driverSignupSlice";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


const schema = z.object({
    email: z.string()
        .min(1, 'Email is required.')
        .email('Please enter a valid email address.')
        .transform(email => email.toLowerCase().trim()),
    password: z.string()
        .min(1, 'Password is required.')
        .min(8, 'Password must be at least 8 characters')
        .transform(password => password.trim()),
    confirmPassword: z.string()
        .min(1, 'Password is required.')
        .min(8, 'Password must be at least 8 characters')
        .transform(password => password.trim())
});

const DriverSignUp = () => {
    const { handleCreateUser, handleGoogleLogin, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [terms, setTerms] = useState(false);
    const [error, setError] = useState("")
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    })

    const handleSignUp = async (data) => {
        await new Promise(resolve => setTimeout(() => resolve(), 1000));

        if (terms) {
            setLoading(true);
            const email = data.email;
            const password = data.password;
            const confirmPassword = data.confirmPassword;

            console.log(password, confirmPassword);


            if (password === confirmPassword) {
                handleCreateUser(email, password)
                    .then(async (res) => {
                        // console.log(res);
                        const user = res.user;
                        await sendEmailVerification(user);
                        dispatch(setUserData(user));
                        dispatch(setEmail(email));
                        dispatch(nextStep());
                        navigate('/sign-up/driver/email-verification');
                    })
                    .catch((error) => {
                        if (error.message === 'Firebase: Error (auth/email-already-in-use).')
                            setError('Email is already in use!')
                    })
            }
            else {
                setLoading(false);
                setError("Passwords do not match.");
            }
        }
        else {
            setError("You must agree to the terms and conditions.");
        }
    }

    const googleLogin = async () => {
        try {
            const result = await handleGoogleLogin();
            // console.log(result);
            setUser(result.user);

            if (result.user.metadata.lastLoginAt - result.user.metadata.createdAt > 5000) {
                toast.success("Log in successful.")
                navigate('/');
            }
            else {
                const user = result.user;
                await sendEmailVerification(user);
                dispatch(setUserData(user));
                dispatch(setEmail(user.email));
                dispatch(nextStep());
                toast.success("Account created successfully. Please verify your email.");
                navigate('/sign-up/driver/email-verification');
            }

        }
        // eslint-disable-next-line no-unused-vars
        catch (error) {
            toast.error('Login failed.');
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
                <h1 className="text-3xl text-center mb-5 font-bold">Driver Sign up</h1>
                <div className="space-y-4">
                    <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
                        <TextField id="email" label="Email" variant="outlined" type="email" fullWidth size="small" {...register("email")} />
                        <FormControl variant="outlined" fullWidth size="small">
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register("password")}
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
                                {...register("confirmPassword")}
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
                        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                        <div className="flex text-sm">
                            <label className="flex justify-center items-center gap-2">
                                <input type="checkbox" name="terms" onChange={termsChecked} />
                                Accept our terms and conditions.
                            </label>
                        </div>
                        {
                            error && <div className="text-red-500 text-sm">{error}</div>
                        }
                        <Button variant="contained" type="submit" fullWidth sx={{ backgroundColor: '#F58300', fontWeight: 700 }}>Sign up</Button>
                    </form>
                    <div>
                        <p className="text-center">Already have an account? <Link to={'/sign-in'} className="text-[#F58300]">Log in</Link></p>
                    </div>
                    <Divider>OR</Divider>
                    <div className="w-full flex flex-col gap-2">
                        <Link onClick={googleLogin}>
                            <div className="border border-gray-400 rounded p-2 flex gap-2 text-lg font-medium justify-center items-center">
                                <img src={google} alt="" className="w-6" />
                                <p>Sign up with Google</p>
                            </div>
                        </Link>
                        <Link to={'/sign-up'} className="mt-10 w-fit mx-auto">
                            <Button variant="contained" fullWidth sx={{backgroundColor: "#F58300", textTransform: 'none', fontWeight: 700, color: 'white' }}>Go Back</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverSignUp;