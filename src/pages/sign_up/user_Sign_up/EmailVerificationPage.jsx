import { Button } from "@mui/material";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EmailVerificationPage = () => {

     const [countdown, setCountdown] = useState(30);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState(null);
     const [success, setSuccess] = useState(false);
     const { email } = useSelector((state) => state.signup);
     const user = useSelector((state) => state.user.userData);
     const auth = getAuth();
     const navigate = useNavigate();


     // Start countdown from 30 seconds
     const COUNTDOWN_DURATION = 30;

     // Handle resend verification email
     const handleResendVerification = async () => {
          setIsLoading(true);
          setError(null);
          setSuccess(false);

          try {
               if (user) {
                    await sendEmailVerification(user);
                    setCountdown(COUNTDOWN_DURATION);
                    setSuccess(true);
               }
          } catch (err) {
               setError(err.message);
          } finally {
               setIsLoading(false);
          }
     };

     // Countdown effect
     useEffect(() => {
          let timer;

          if (countdown > 0) {
               timer = setTimeout(() => {
                    setCountdown(prev => prev - 1);
               }, 1000);
          }

          return () => clearTimeout(timer);
     }, [countdown]);

     // Format seconds to MM:SS
     const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
     };

     const handleContinue = async () => {
          try {
               // reload user info from Firebase
               await auth.currentUser.reload();

               if (auth.currentUser.emailVerified) {
                    toast.success("Email verified! Redirecting...");
                    // redirect to dashboard or next page
                    navigate("/sign-up/user-info");
               } else {
                    toast.error("Email not verified yet. Please check your inbox.");
               }
          } catch (err) {
               console.error(err);
               toast.error("Error checking verification. Try again.");
          }
     };

     return (
          <div className="pt-8 lg:pt-20 flex flex-col justify-center items-center h-[70vh]">
               <h1 className="text-center text-lg">We have send a verification email to your email id. Please verify it first.<br />If you didn&apos;t receive the email, please check your spam folder or try again later.
               </h1>
               <div className="flex flex-col items-center justify-center gap-10 mt-10">
                    <div className="max-w-md  mx-auto p-5 border border-gray-200 rounded-lg text-center space-y-3">
                         {/* Error Message */}
                         {error && (
                              <div className="p-3 text-red-700 bg-red-100 rounded-md">
                                   {error}
                              </div>
                         )}

                         {/* Success Message */}
                         {success && (
                              <div className="p-3 text-green-700 bg-green-100 rounded-md">
                                   Verification email sent successfully!
                              </div>
                         )}

                         {/* Resend Button with Countdown */}
                         <button
                              onClick={handleResendVerification}
                              disabled={countdown > 0 || isLoading}
                              className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center transition-all duration-200 ${countdown > 0 || isLoading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'}`}
                         >
                              {isLoading ? (
                                   <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                   </>
                              ) : countdown > 0 ? (
                                   <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Resend in {formatTime(countdown)}
                                   </>
                              ) : (
                                   'Resend Verification Email'
                              )}
                         </button>

                         {/* Countdown Message */}
                         {countdown > 0 && (
                              <div className="text-sm text-gray-500">
                                   You can request another email in {formatTime(countdown)}
                              </div>
                         )}
                    </div>
                    <Button variant="contained" onClick={handleContinue}>Continue</Button>
               </div>
          </div>
     );
};

export default EmailVerificationPage;