import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Rating, Skeleton } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';

const DriverReviews = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.email) return;
            try {
                const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
                const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
                
                // For drivers, we need their driver_id
                const driverRes = await axiosPublic.get(`driverRoutes/driver-info/${userId}`);
                const driverId = driverRes.data?.driver_id;

                if (driverId) {
                    const res = await axiosPublic.get(`reviewRoutes/received/driver/${driverId}`);
                    setReviews(res.data);
                }
            } catch (error) {
                console.error('Error fetching driver reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [user]);

    if (loading) return <Box sx={{ p: 4 }}><Skeleton variant="rectangular" height={300} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>My Performance Reviews</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                What customers are saying about your driving service.
            </Typography>

            {reviews.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">You haven't received any reviews yet. Complete more trips!</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {reviews.map((review, index) => (
                        <Grid item xs={12} key={index}>
                            <Card elevation={2} sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Avatar src={review.photo} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">{review.name}</Typography>
                                            <Rating value={review.rating} size="small" readOnly />
                                            <Typography variant="caption" color="text.secondary" sx={{ block: 'inline', ml: 1 }}>
                                                {moment(review.date).fromNow()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        "{review.review}"
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default DriverReviews;
