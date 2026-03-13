import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const PhoneOTPVerification = ({ phoneNumber, onVerified, onCancel, userId }) => {
     const axiosPublic = useAxiosPublic();
     const [otp, setOtp] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const [countdown, setCountdown] = useState(0);
     const [otpSent, setOtpSent] = useState(false);
     const [error, setError] = useState(null);

     // Send OTP
     const handleSendOTP = async () => {
          setIsLoading(true);
          setError(null);
          try {
               // Call your backend to send OTP to the phone number
               // This assumes your backend has an endpoint for sending OTP
               await axiosPublic.post('userRoute/sendPhoneOTP', {
                    phone: phoneNumber,
                    userId: userId
               });
               setOtpSent(true);
               setCountdown(60);
               toast.success('OTP sent to your phone number');
          } catch (err) {
               setError(err.response?.data?.message || 'Failed to send OTP');
               toast.error('Failed to send OTP');
          } finally {
               setIsLoading(false);
          }
     };

     // Verify OTP
     const handleVerifyOTP = async () => {
          if (!otp) {
               setError('Please enter OTP');
               return;
          }
          setIsLoading(true);
          setError(null);
          try {
               const response = await axiosPublic.post('userRoute/verifyPhoneOTP', {
                    phone: phoneNumber,
                    otp: otp,
                    userId: userId
               });
               if (response.status === 200) {
                    toast.success('Phone number verified successfully!');
                    onVerified(phoneNumber);
               }
          } catch (err) {
               setError(err.response?.data?.message || 'Invalid OTP');
               toast.error('Invalid OTP');
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

     const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
     };

     return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Phone Number</h2>
                    <p className="text-gray-600 mb-6">
                         We've sent an OTP to <strong>{phoneNumber}</strong>
                    </p>

                    {error && (
                         <Alert severity="error" className="mb-4">
                              {error}
                         </Alert>
                    )}

                    {!otpSent ? (
                         <div className="space-y-4">
                              <p className="text-sm text-gray-500">Click the button below to send an OTP to your phone number.</p>
                              <Button
                                   fullWidth
                                   variant="contained"
                                   onClick={handleSendOTP}
                                   disabled={isLoading}
                                   sx={{
                                        background: '#f58300',
                                        '&:hover': { background: '#e07100' },
                                   }}
                              >
                                   {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                              </Button>
                         </div>
                    ) : (
                         <div className="space-y-4">
                              <TextField
                                   fullWidth
                                   label="Enter OTP"
                                   value={otp}
                                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                   placeholder="000000"
                                   inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                                   disabled={isLoading}
                                   sx={{
                                        '& .MuiOutlinedInput-root': {
                                             borderRadius: '8px',
                                             '&:hover fieldset': {
                                                  borderColor: '#f58300',
                                             },
                                             '&.Mui-focused fieldset': {
                                                  borderColor: '#f58300',
                                             },
                                        },
                                   }}
                              />
                              <Button
                                   fullWidth
                                   variant="contained"
                                   onClick={handleVerifyOTP}
                                   disabled={isLoading || otp.length !== 6}
                                   sx={{
                                        background: '#10b981',
                                        '&:hover': { background: '#059669' },
                                   }}
                              >
                                   {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
                              </Button>
                              <Button
                                   fullWidth
                                   variant="outlined"
                                   onClick={handleSendOTP}
                                   disabled={countdown > 0 || isLoading}
                                   sx={{
                                        color: countdown > 0 ? '#999' : '#f58300',
                                        borderColor: countdown > 0 ? '#ccc' : '#f58300',
                                   }}
                              >
                                   {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
                              </Button>
                         </div>
                    )}

                    <Button
                         fullWidth
                         variant="text"
                         onClick={onCancel}
                         disabled={isLoading}
                         sx={{ color: '#999', mt: 2 }}
                    >
                         Cancel
                    </Button>
               </div>
          </div>
     );
};

export default PhoneOTPVerification;
