import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Rating, Divider, Skeleton } from '@mui/material';
import { IoStarOutline } from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';

const AgencyReviews = () => {
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
                
                const agencyRes = await axiosPublic.get(`agencyRoutes/agency-info/${userId}`);
                const agencyId = agencyRes.data?.agency_id;

                if (agencyId) {
                    const res = await axiosPublic.get(`reviewRoutes/received/agency/${agencyId}`);
                    setReviews(res.data);
                }
            } catch (error) {
                console.error('Error fetching agency reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [user]);

    if (loading) return <Box sx={{ p: 4 }}><Skeleton variant="rectangular" height={300} /></Box>;

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" fontWeight="bold">Customer Reviews</Typography>
                    <Typography variant="body1" color="text.secondary">See what customers are saying about your agency.</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 4, p: 2, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold">{averageRating}</Typography>
                        <Rating value={Number(averageRating)} precision={0.1} readOnly sx={{ color: 'white' }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Average Rating ({reviews.length} reviews)</Typography>
                    </Card>
                </Grid>
            </Grid>

            {reviews.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">No reviews received yet.</Typography>
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
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
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

export default AgencyReviews;
