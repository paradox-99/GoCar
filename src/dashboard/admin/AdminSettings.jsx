import React, { useState, useMemo, useRef } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, Button, Stack,
    IconButton, Divider, MenuItem, Select, FormControl,
    TextField, Chip, useTheme, Avatar, Switch, FormControlLabel,
    InputAdornment, Tooltip, Badge, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
    Fade, Tab, Tabs, List, ListItem, ListItemIcon, ListItemText, ListItemButton
} from '@mui/material';
import {
    Person, Security, Notifications, History, Group, Settings as SettingsIcon,
    CameraAlt, Edit, Lock, Visibility, VisibilityOff, VerifiedUser,
    CheckCircle, Cancel as CancelIcon, Map, Info, Warning,
    DeleteForever, PowerSettingsNew, Search, FilterList,
    Download, Laptop, Smartphone, Tablet, MoreVert,
    Check, Close, Mail, Phone, CalendarToday, Fingerprint,
    Public, Verified, ErrorOutline, LockOutlined, AccessTime
} from '@mui/icons-material';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// --- Helper Components ---
const SectionHeader = ({ title, subtitle }) => (
    <Box mb={4}>
        <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>{title}</Typography>
        <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
    </Box>
);

const SettingCard = ({ children, title, icon }) => (
    <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        {title && (
            <Box px={3} py={2} borderBottom="1px solid #f1f5f9" display="flex" alignItems="center" gap={1.5}>
                {icon && <Box sx={{ color: '#F97316' }}>{icon}</Box>}
                <Typography variant="subtitle1" fontWeight="700">{title}</Typography>
            </Box>
        )}
        <CardContent sx={{ p: 4 }}>{children}</CardContent>
    </Card>
);

const AdminSettings = () => {
    const theme = useTheme();
    const { user: authUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    
    const [activeSection, setActiveSection] = useState('profile');
    const [isEditMode, setIsEditMode] = useState(false);
    
    // --- Data Fetching ---
    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ['admin-profile', authUser?.email],
        queryFn: async () => {
            const res = await axiosPublic.get('/admin-settings/profile');
            return res.data;
        }
    });

    const { data: platformSettings, isLoading: settingsLoading } = useQuery({
        queryKey: ['platform-settings'],
        queryFn: async () => {
            const res = await axiosPublic.get('/admin-settings/platform');
            return res.data;
        }
    });

    const { data: adminList, isLoading: adminsLoading } = useQuery({
        queryKey: ['admin-list'],
        queryFn: async () => {
            const res = await axiosPublic.get('/admin-settings/admins');
            return res.data;
        }
    });

    const isSuperAdmin = profileData?.userrole === 'admin';

    // --- Sections Navigation ---
    const sidebarItems = [
        { id: 'profile', label: 'My Profile', icon: <Person /> },
        { id: 'security', label: 'Security', icon: <Security /> },
        { id: 'notifications', label: 'Notifications Preferences', icon: <Notifications /> },
        { id: 'activity', label: 'Activity Log', icon: <History /> },
        { id: 'management', label: 'Admin Management', icon: <Group /> },
        { id: 'platform', label: 'Platform Settings', icon: <SettingsIcon /> },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box maxWidth="1400px" mx="auto">
                
                {/* 1. Header Banner */}
                <ProfileHeader profile={profileData} isLoading={profileLoading} />

                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {/* 2. Sidebar Navigation */}
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ 
                            borderRadius: 4, 
                            p: 2, 
                            position: 'sticky', 
                            top: 100,
                            border: '1px solid #f1f5f9'
                        }}>
                            <List disablePadding>
                                {sidebarItems.map((item) => (
                                    (!item.superOnly || isSuperAdmin) && (
                                        <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                                            <ListItemButton
                                                onClick={() => setActiveSection(item.id)}
                                                sx={{
                                                    borderRadius: 3,
                                                    transition: 'all 0.2s',
                                                    borderLeft: activeSection === item.id ? '4px solid #F97316' : '4px solid transparent',
                                                    bgcolor: activeSection === item.id ? 'rgba(249, 115, 22, 0.05)' : 'transparent',
                                                    '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.03)' },
                                                }}
                                            >
                                                <ListItemIcon sx={{ 
                                                    minWidth: 40, 
                                                    color: activeSection === item.id ? '#F97316' : 'text.secondary' 
                                                }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={item.label} 
                                                    primaryTypographyProps={{ 
                                                        fontWeight: activeSection === item.id ? '700' : '500',
                                                        color: activeSection === item.id ? '#F97316' : 'text.secondary',
                                                        fontSize: '0.9rem'
                                                    }} 
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* 3. Content Area */}
                    <Grid item xs={12} md={9}>
                        <Fade in={true} timeout={500}>
                            <Box>
                                {activeSection === 'profile' && <MyProfileSection data={profileData} />}
                                {activeSection === 'security' && <SecuritySection />}
                                {activeSection === 'notifications' && <NotificationSection data={profileData} />}
                                {activeSection === 'activity' && <ActivityLogSection />}
                                {activeSection === 'management' && <AdminManagementSection isSuperAdmin={isSuperAdmin} currentUser={profileData} adminList={adminList} />}
                                {activeSection === 'platform' && <PlatformSettingsSection settings={platformSettings} isSuperAdmin={isSuperAdmin} />}
                            </Box>
                        </Fade>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

// --- SUB-COMPONENTS ---

const ProfileHeader = ({ profile, isLoading }) => {
    if (isLoading) return <LinearProgress color="warning" sx={{ borderRadius: 2 }} />;
    
    return (
        <Paper sx={{ 
            borderRadius: 6, 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #fff 0%, #fff7ed 100%)',
            border: '1px solid #fed7aa',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Grid container spacing={3} alignItems="center">
                <Grid item>
                    <Box position="relative">
                        <Avatar 
                            src={profile?.photo} 
                            sx={{ width: 100, height: 100, border: '4px solid #fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        />
                        <IconButton 
                            size="small"
                            sx={{ 
                                position: 'absolute', bottom: 0, right: 0, 
                                bgcolor: '#F97316', color: '#fff',
                                '&:hover': { bgcolor: '#ea580c' },
                                border: '3px solid #fff'
                            }}
                        >
                            <CameraAlt fontSize="small" />
                        </IconButton>
                    </Box>
                </Grid>
                <Grid item xs>
                    <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                        <Typography variant="h5" fontWeight="900">{profile?.name}</Typography>
                        <Chip 
                            label="Admin" 
                            size="small" 
                            sx={{ bgcolor: '#F97316', color: '#fff', fontWeight: 'bold' }} 
                        />
                        <Chip 
                            label="Active" 
                            size="small" 
                            sx={{ bgcolor: '#dcfce7', color: '#15803d', border: '1px solid #bcf0da', fontWeight: 'bold' }} 
                        />
                    </Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>{profile?.email}</Typography>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
                            <CalendarToday sx={{ fontSize: 14 }} /> Member since {moment(profile?.created_at).format('MMMM YYYY')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
                            <AccessTime sx={{ fontSize: 14 }} /> Last active: {profile?.last_active ? moment(profile.last_active).fromNow() : 'N/A'}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, borderRadius: 3 }}>
                            Edit Profile
                        </Button>
                        <Button variant="outlined" sx={{ color: '#F97316', borderColor: '#F97316', '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' }, borderRadius: 3 }}>
                            Change Password
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
};

const MyProfileSection = ({ data }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState(data || {});
    const [isDirty, setIsDirty] = useState(false);
    const [showNid, setShowNid] = useState(false);

    const age = useMemo(() => {
        if (!data?.dob) return null;
        return moment().diff(moment(data.dob), 'years');
    }, [data?.dob]);

    const handleSave = () => {
        toast.success('✅ Profile updated successfully');
        setIsDirty(false);
    };

    return (
        <Box>
            <SectionHeader title="My Profile" subtitle="Manage your personal identity and contact information" />
            
            <SettingCard title="Personal Information" icon={<Person />}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="Full Name" 
                            defaultValue={data?.name} 
                            onChange={() => setIsDirty(true)}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="Email Address" 
                            defaultValue={data?.email}
                            InputProps={{ 
                                sx: { borderRadius: 3 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Chip 
                                            label={data?.verified ? "Verified ✓" : "Unverified ✗"} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: data?.verified ? '#dcfce7' : '#fee2e2', 
                                                color: data?.verified ? '#15803d' : '#991b1b',
                                                fontWeight: 'bold', fontSize: '0.7rem'
                                            }} 
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="Phone Number" 
                            defaultValue={data?.phone}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <Select defaultValue={data?.gender || 'Prefer not to say'} sx={{ borderRadius: 3 }}>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <TextField 
                                fullWidth label="Date of Birth" 
                                type="date" 
                                defaultValue={data?.dob ? moment(data.dob).format('YYYY-MM-DD') : ''}
                                InputProps={{ sx: { borderRadius: 3 } }}
                                InputLabelProps={{ shrink: true }}
                            />
                            {age && <Typography variant="body2" color="textSecondary">{age} years old</Typography>}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="NID Number" 
                            type={showNid ? 'text' : 'password'}
                            defaultValue={data?.nid}
                            InputProps={{ 
                                sx: { borderRadius: 3 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNid(!showNid)} size="small">
                                            {showNid ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>
            </SettingCard>

            <SettingCard title="Address Information" icon={<Map />}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="Display Name" 
                            defaultValue={data?.address_display_name}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <Select defaultValue={data?.city || 'Dhaka'} sx={{ borderRadius: 3 }}>
                                <MenuItem value="Dhaka">Dhaka</MenuItem>
                                <MenuItem value="Chittagong">Chittagong</MenuItem>
                                <MenuItem value="Sylhet">Sylhet</MenuItem>
                                <MenuItem value="Rajshahi">Rajshahi</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Area" defaultValue={data?.area} InputProps={{ sx: { borderRadius: 3 } }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Postcode" defaultValue={data?.postcode} InputProps={{ sx: { borderRadius: 3 } }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="#f8fafc" borderRadius={3} border="1px dashed #cbd5e1">
                            <Typography variant="body2" fontWeight="600" color="textSecondary">
                                📍 Lat: {data?.latitude || 'N/A'}, Lng: {data?.longitude || 'N/A'}
                            </Typography>
                            <Button size="small" sx={{ color: '#F97316', fontWeight: 'bold' }}>Open in Maps</Button>
                        </Box>
                    </Grid>
                </Grid>
            </SettingCard>

            <SettingCard title="License Information (Read-only)" icon={<VerifiedUser />}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">LICENSE NUMBER</Typography>
                        <Typography variant="body1" fontWeight="700">{data?.license_number || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">STATUS</Typography>
                        <Chip 
                            label={data?.license_status || 'N/A'} 
                            size="small" 
                            sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 'bold' }} 
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">EXPIRY</Typography>
                        <Typography variant="body1" fontWeight="700" color={moment(data?.expire_date).isBefore(moment()) ? 'error.main' : 'text.primary'}>
                            {data?.expire_date ? moment(data.expire_date).format('MMM DD, YYYY') : 'N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">EXPERIENCE</Typography>
                        <Typography variant="body1" fontWeight="700">{data?.experience} Years</Typography>
                    </Grid>
                </Grid>
            </SettingCard>

            <Box display="flex" gap={2} mt={2}>
                <Button 
                    variant="contained" 
                    fullWidth 
                    disabled={!isDirty} 
                    onClick={handleSave}
                    sx={{ 
                        bgcolor: '#F97316', borderRadius: 3, py: 1.5, fontWeight: '800',
                        '&:hover': { bgcolor: '#ea580c' },
                        '&.Mui-disabled': { bgcolor: '#cbd5e1' }
                    }}
                >
                    Save Changes
                </Button>
                <Button variant="text" onClick={() => setIsDirty(false)} sx={{ color: 'text.secondary', fontWeight: '600' }}>
                    Discard Changes
                </Button>
            </Box>
        </Box>
    );
};

const SecuritySection = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);

    const strength = useMemo(() => {
        if (!passwords.new) return 0;
        let s = 0;
        if (passwords.new.length >= 8) s += 25;
        if (/[A-Z]/.test(passwords.new)) s += 25;
        if (/[0-9]/.test(passwords.new)) s += 25;
        if (/[!@#$%^&*]/.test(passwords.new)) s += 25;
        return s;
    }, [passwords.new]);

    const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][Math.min(3, Math.floor(strength / 25))];
    const strengthColor = ['#ef4444', '#f59e0b', '#84cc16', '#10b981'][Math.min(3, Math.floor(strength / 25))];

    return (
        <Box>
            <SectionHeader title="Security" subtitle="Update your password and manage active sessions" />
            
            <SettingCard title="Change Password" icon={<Lock />}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField 
                            fullWidth label="Current Password" 
                            type={showPass ? 'text' : 'password'}
                            InputProps={{ 
                                sx: { borderRadius: 3 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPass(!showPass)} size="small">
                                            {showPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="New Password" 
                            type="password"
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <Box mt={1}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption" fontWeight="bold" sx={{ color: strengthColor }}>{strengthLabel}</Typography>
                                <Typography variant="caption" color="textSecondary">{strength}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={strength} sx={{ 
                                borderRadius: 5, height: 6, bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': { bgcolor: strengthColor }
                            }} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth label="Confirm New Password" 
                            type="password"
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        {passwords.confirm && (
                            <Typography variant="caption" color={passwords.new === passwords.confirm ? 'success.main' : 'error.main'}>
                                {passwords.new === passwords.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, borderRadius: 3, px: 4 }}
                            disabled={strength < 75 || passwords.new !== passwords.confirm}
                        >
                            Update Password
                        </Button>
                    </Grid>
                </Grid>
            </SettingCard>

            <SettingCard title="Active Sessions" icon={<History />}>
                <Stack spacing={2}>
                    <SessionRow current device="Laptop" browser="Chrome 124.0 (Windows 11)" ip="103.145.XX.XX" location="Dhaka, BD" time="Active now" />
                    <SessionRow device="Smartphone" browser="Safari (iOS 17.4)" ip="192.168.X.X" location="Dhaka, BD" time="2 hours ago" />
                </Stack>
                <Box mt={3} pt={3} borderTop="1px solid #f1f5f9">
                    <Button variant="text" color="error" sx={{ fontWeight: 'bold' }}>Revoke All Other Sessions</Button>
                </Box>
            </SettingCard>

            <Card sx={{ borderRadius: 4, border: '2px solid #fee2e2', bgcolor: '#fffcfc' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="900" color="error" display="flex" alignItems="center" gap={1} mb={2}>
                        <DeleteForever /> Danger Zone
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle2" fontWeight="700">Deactivate My Account</Typography>
                            <Typography variant="body2" color="textSecondary">Temporarily disable your admin account. You will be logged out immediately.</Typography>
                        </Box>
                        <Button variant="outlined" color="error" sx={{ borderRadius: 3, fontWeight: 'bold' }}>Deactivate</Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

const SessionRow = ({ current, device, browser, ip, location, time }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius={3} border="1px solid #f1f5f9">
        <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ color: '#F97316', bgcolor: '#fff7ed', p: 1.5, borderRadius: 2.5 }}>
                {device === 'Laptop' ? <Laptop /> : device === 'Smartphone' ? <Smartphone /> : <Tablet />}
            </Box>
            <Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="700">{browser}</Typography>
                    {current && <Chip label="Current" size="small" sx={{ height: 18, bgcolor: '#dcfce7', color: '#15803d', fontSize: '0.65rem', fontWeight: 'bold' }} />}
                </Box>
                <Typography variant="caption" color="textSecondary">{ip} • {location} • {time}</Typography>
            </Box>
        </Box>
        {!current && <Button size="small" color="error" variant="outlined" sx={{ borderRadius: 2, minWidth: 80, fontSize: '0.75rem' }}>Revoke</Button>}
    </Box>
);

const NotificationSection = ({ data }) => {
    const handleSave = () => toast.success('✅ Preferences saved');
    
    return (
        <Box>
            <SectionHeader title="Notification Preferences" subtitle="Control which in-dashboard alerts you receive" />
            
            <SettingCard title="Approval Alerts" icon={<CheckCircle />}>
                <Stack spacing={1}>
                    <ToggleItem label="New agency registration pending" defaultChecked />
                    <ToggleItem label="New driver verification pending" defaultChecked />
                    <ToggleItem label="New vehicle verification pending" defaultChecked />
                    <ToggleItem label="New license approval pending" defaultChecked />
                </Stack>
            </SettingCard>

            <SettingCard title="Booking Alerts" icon={<DirectionsCar />}>
                <Stack spacing={1}>
                    <ToggleItem label="Overdue bookings (end_ts passed)" defaultChecked />
                    <ToggleItem label="Bookings with damage reports" defaultChecked />
                    <ToggleItem label="Bookings with unpaid final payment" />
                </Stack>
            </SettingCard>

            <SettingCard title="Financial Alerts" icon={<MonetizationOn />}>
                <Stack spacing={2}>
                    <ToggleItem label="Large transaction alert" defaultChecked />
                    <TextField size="small" label="Alert when payment > BDT" type="number" sx={{ width: 250, ml: 6 }} />
                    <ToggleItem label="Daily revenue summary" />
                </Stack>
            </SettingCard>

            <Button 
                variant="contained" 
                onClick={handleSave}
                sx={{ bgcolor: '#F97316', borderRadius: 3, px: 6, py: 1.2, fontWeight: 'bold', '&:hover': { bgcolor: '#ea580c' } }}
            >
                Save Preferences
            </Button>
        </Box>
    );
};

const ToggleItem = ({ label, defaultChecked }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
        <Typography variant="body2" fontWeight="500">{label}</Typography>
        <Switch defaultChecked={defaultChecked} sx={{ 
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#F97316' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#F97316' }
        }} />
    </Box>
);

const ActivityLogSection = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState('All');

    // Mock logs
    const logs = [
        { id: 1, type: 'Approved', entityType: 'Agency', entity: 'Fast Wheels BD', detail: 'Changed status from Pending → Active', time: '10 mins ago', ip: '103.145.X.X' },
        { id: 2, type: 'Banned', entityType: 'User', entity: 'Rahim Uddin', detail: 'Violated platform policies', time: '2 hours ago', ip: '103.145.X.X' },
        { id: 3, type: 'Login', entityType: 'Auth', entity: 'Admin', detail: 'Successful login', time: '5 hours ago', ip: '103.145.X.X' },
        { id: 4, type: 'Updated', entityType: 'Vehicle', entity: 'Toyota Corolla', detail: 'Updated rental price', time: '1 day ago', ip: '103.145.X.X' },
    ];

    return (
        <Box>
            <SectionHeader title="Activity Log" subtitle="Track all your administrative actions on the platform" />
            
            <Box mb={3} display="flex" gap={2} flexWrap="wrap">
                <TextField 
                    placeholder="Search logs..." 
                    size="small" 
                    InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 3, borderColor: '#e2e8f0', color: '#64748b' }}>Filter</Button>
                <Button variant="outlined" startIcon={<Download />} sx={{ borderRadius: 3, borderColor: '#e2e8f0', color: '#64748b' }}>Export CSV</Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: '800' }}>Timestamp</TableCell>
                            <TableCell sx={{ fontWeight: '800' }}>Action</TableCell>
                            <TableCell sx={{ fontWeight: '800' }}>Entity Type</TableCell>
                            <TableCell sx={{ fontWeight: '800' }}>Entity</TableCell>
                            <TableCell sx={{ fontWeight: '800' }}>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell><Typography variant="body2">{row.time}</Typography></TableCell>
                                <TableCell>
                                    <Chip 
                                        label={row.type} 
                                        size="small" 
                                        sx={{ 
                                            fontWeight: 'bold', fontSize: '0.7rem',
                                            bgcolor: row.type === 'Approved' ? '#dcfce7' : row.type === 'Banned' ? '#fee2e2' : '#f1f5f9',
                                            color: row.type === 'Approved' ? '#15803d' : row.type === 'Banned' ? '#991b1b' : '#64748b'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell><Typography variant="body2" color="textSecondary">{row.entityType}</Typography></TableCell>
                                <TableCell><Typography variant="body2" fontWeight="700">{row.entity}</Typography></TableCell>
                                <TableCell sx={{ maxWidth: 250 }}><Typography variant="body2" noWrap>{row.detail}</Typography></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

const AdminManagementSection = ({ isSuperAdmin, currentUser, adminList }) => {
    return (
        <Box>
            <SectionHeader title="Admin Management" subtitle="Manage administrative access and roles" />
            
            <SettingCard title="Invite New Admin" icon={<Group />}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Name" size="small" InputProps={{ sx: { borderRadius: 3 } }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Email" size="small" InputProps={{ sx: { borderRadius: 3 } }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <Select defaultValue="admin" sx={{ borderRadius: 3 }}>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            disabled={!isSuperAdmin}
                            sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, borderRadius: 3, px: 4 }}
                        >
                            Send Invite
                        </Button>
                    </Grid>
                </Grid>
            </SettingCard>

            <SettingCard title="Admin List" icon={<Verified />}>
                <Stack spacing={2}>
                    {adminList?.map((admin) => (
                        <AdminItem 
                            key={admin.user_id}
                            name={admin.name} 
                            email={admin.email} 
                            role={admin.userrole} 
                            isYou={admin.user_id === currentUser?.user_id}
                            suspended={admin.accountstatus === 'Suspended'}
                            photo={admin.photo}
                        />
                    ))}
                </Stack>
            </SettingCard>

            <SettingCard title="Permissions Matrix" icon={<LockOutlined />}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Feature</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Super Admin</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <PermissionRow label="Manage Users" admin={true} superAdmin={true} />
                            <PermissionRow label="View Analytics" admin={true} superAdmin={true} />
                            <PermissionRow label="Platform Settings" admin={false} superAdmin={true} />
                            <PermissionRow label="Admin Management" admin={false} superAdmin={true} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </SettingCard>
        </Box>
    );
};

const AdminItem = ({ name, email, role, suspended, isYou, photo }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius={3} border="1px solid #f1f5f9" hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={photo} sx={{ width: 40, height: 40, bgcolor: '#F97316' }}>{name[0]}</Avatar>
            <Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="700">{name}</Typography>
                    {isYou && <Chip label="You" size="small" sx={{ height: 18, bgcolor: '#fff7ed', color: '#F97316', fontSize: '0.65rem', fontWeight: 'bold' }} />}
                </Box>
                <Typography variant="caption" color="textSecondary">{email}</Typography>
            </Box>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
                label="Admin" 
                size="small" 
                sx={{ bgcolor: '#fff7ed', color: '#F97316', fontWeight: 'bold', fontSize: '0.65rem' }} 
            />
            {suspended && <Chip label="Suspended" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
            {!isYou && <IconButton size="small"><MoreVert fontSize="small" /></IconButton>}
        </Stack>
    </Box>
);

const PermissionRow = ({ label, admin, superAdmin }) => (
    <TableRow>
        <TableCell sx={{ fontSize: '0.85rem' }}>{label}</TableCell>
        <TableCell align="center">{admin ? <Check sx={{ color: 'success.main' }} /> : <Close sx={{ color: 'error.main' }} />}</TableCell>
        <TableCell align="center">{superAdmin ? <Check sx={{ color: 'success.main' }} /> : <Close sx={{ color: 'error.main' }} />}</TableCell>
    </TableRow>
);

const PlatformSettingsSection = ({ settings, isSuperAdmin }) => {
    if (!isSuperAdmin) return (
        <Box textAlign="center" py={10} bgcolor="#fff" borderRadius={6} border="1px solid #f1f5f9">
            <LockOutlined sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h5" fontWeight="800">Locked Section</Typography>
            <Typography color="textSecondary">You need Admin access to manage platform settings.</Typography>
        </Box>
    );

    return (
        <Box>
            <SectionHeader title="Platform Settings" subtitle="Global configuration settings for the goCar platform" />
            
            <SettingCard title="General Settings" icon={<Public />}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Platform Name" defaultValue={settings?.general?.platform_name} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Support Email" defaultValue={settings?.general?.support_email} /></Grid>
                    <Grid item xs={12} md={6}>
                        <FormControlLabel control={<Switch color="error" defaultChecked={settings?.general?.maintenance_mode} />} label="Maintenance Mode" />
                        {settings?.general?.maintenance_mode && <Typography variant="caption" color="error" display="block">⚠️ Users cannot access the platform</Typography>}
                    </Grid>
                </Grid>
            </SettingCard>

            <SettingCard title="Booking Settings" icon={<DirectionsCar />}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Min Duration (Hrs)" type="number" defaultValue={settings?.booking?.min_duration} /></Grid>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Max Duration (Hrs)" type="number" defaultValue={settings?.booking?.max_duration} /></Grid>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Late Fee (BDT/Hr)" type="number" defaultValue={settings?.booking?.late_fee_rate} /></Grid>
                </Grid>
            </SettingCard>

            <Button variant="contained" fullWidth sx={{ bgcolor: '#F97316', borderRadius: 3, py: 1.5, fontWeight: '800', '&:hover': { bgcolor: '#ea580c' } }}>
                Save Settings
            </Button>
        </Box>
    );
};

export default AdminSettings;
