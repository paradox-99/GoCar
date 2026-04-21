import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button } from '@mui/material';
import { IoNotificationsOutline } from "react-icons/io5";
import useAuth from '../hooks/useAuth';
import useAxiosPublic from '../hooks/useAxiosPublic';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const NotificationMenu = ({ color = "inherit" }) => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchNotifications = async () => {
        if (!user?.email) return;
        try {
            // Get user info to get DB ID
            const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
            const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
            
            if (userId) {
                const [notifRes, unreadRes] = await Promise.all([
                    axiosPublic.get(`notificationRoutes/user/${userId}`),
                    axiosPublic.get(`notificationRoutes/unread/${userId}`)
                ]);
                setNotifications(notifRes.data);
                setUnreadCount(unreadRes.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 60 seconds for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAsRead = async (notifId) => {
        try {
            await axiosPublic.patch(`notificationRoutes/${notifId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="large"
                aria-label={`show ${unreadCount} new notifications`}
                color={color}
                sx={{ p: 1 }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <IoNotificationsOutline size={26} />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        width: 360,
                        maxHeight: 480,
                        mt: 1.5,
                        borderRadius: 2,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                    {unreadCount > 0 && <Typography variant="caption" color="primary">{unreadCount} unread</Typography>}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No notifications yet</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.map((notif) => (
                            <MenuItem 
                                key={notif.notif_id} 
                                onClick={() => handleMarkAsRead(notif.notif_id)}
                                sx={{ 
                                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(245, 131, 0, 0.05)',
                                    borderLeft: notif.is_read ? 'none' : '4px solid #F58300',
                                    whiteSpace: 'normal',
                                    py: 1.5
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: notif.is_read ? 'grey.300' : 'primary.main' }}>
                                        <IoNotificationsOutline />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={notif.message} 
                                    secondary={moment(notif.created_at).fromNow()}
                                    primaryTypographyProps={{ 
                                        variant: 'body2', 
                                        fontWeight: notif.is_read ? 'normal' : 'bold' 
                                    }}
                                />
                            </MenuItem>
                        ))}
                    </List>
                )}
                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Button fullWidth size="small" onClick={() => navigate('/dashboard/notifications')}>
                        View all notifications
                    </Button>
                </Box>
            </Menu>
        </Box>
    );
};

export default NotificationMenu;
