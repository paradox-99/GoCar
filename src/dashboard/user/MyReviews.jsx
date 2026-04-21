import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Rating, Divider, Chip, Skeleton, Tab, Tabs } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import StarIcon from '@mui/icons-material/Star';

const MyReviews = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [reviews, setReviews] = useState({ carReviews: [], motorbikeReviews: [], driverReviews: [], agencyReviews: [] });
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.email) return;
            try {
                const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
                const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
                
                if (userId) {
                    const res = await axiosPublic.get(`reviewRoutes/user/${userId}`);
                    setReviews(res.data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [user]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const ReviewList = ({ list, type }) => {
        if (loading) return <ReviewSkeleton />;
        if (!list || list.length === 0) return (
            <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">You haven't given any {type} reviews yet.</Typography>
            </Box>
        );

        return (
            <Grid container spacing={3}>
                {list.map((review, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card elevation={2} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {review.brand?.[0] || review.name?.[0] || review.agency_name?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {review.brand ? `${review.brand} ${review.model}` : (review.name || review.agency_name)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {moment(review.date).format('MMM DD, YYYY')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Rating 
                                        value={review.rating} 
                                        readOnly 
                                        size="small"
                                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic' }}>
                                    "{review.review || 'No comment provided'}"
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const ReviewSkeleton = () => (
        <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>My Reviews & Ratings</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                A history of reviews you've shared with the community.
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto">
                    <Tab label={`Cars (${reviews.carReviews.length})`} />
                    <Tab label={`Bikes (${reviews.motorbikeReviews.length})`} />
                    <Tab label={`Drivers (${reviews.driverReviews.length})`} />
                    <Tab label={`Agencies (${reviews.agencyReviews.length})`} />
                </Tabs>
            </Box>

            <Box>
                {tabValue === 0 && <ReviewList list={reviews.carReviews} type="car" />}
                {tabValue === 1 && <ReviewList list={reviews.motorbikeReviews} type="bike" />}
                {tabValue === 2 && <ReviewList list={reviews.driverReviews} type="driver" />}
                {tabValue === 3 && <ReviewList list={reviews.agencyReviews} type="agency" />}
            </Box>
        </Box>
    );
};

export default MyReviews;
