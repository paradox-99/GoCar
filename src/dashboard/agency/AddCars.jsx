import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from '../../hooks/useAuth';
import { Autocomplete, Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress, Divider, FormControlLabel, Grid, Paper, Stack, styled, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { CloudUpload } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import profile from "../../assets/travel.png"

const carBrandOptions = [
     'Toyota', 'Honda', 'Hyundai', 'Ford', 'Chevrolet',
     'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Nissan',
     'Kia', 'Mazda', 'Subaru', 'Lexus', 'Jeep',
     'Tesla', 'Volvo', 'Porsche', 'Land Rover', 'Jaguar',
     'Mitsubishi', 'Suzuki', 'Peugeot', 'Renault', 'Fiat',
     'Škoda', 'Citroën', 'Chrysler', 'Dodge', 'Ram',
     'GMC', 'Cadillac', 'Buick', 'Lincoln', 'Acura',
     'Infiniti', 'Genesis', 'Alfa Romeo', 'Maserati', 'Mini',
     'Tata', 'Mahindra', 'MG', 'BYD', 'Chery',
     'Proton', 'Perodua', 'Geely', 'Great Wall', 'Haval',
];

const carTypeOptions = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Micro', 'Luxury', 'Sports'];

const bikeBrandOptions = [
     'Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Ducati',
     'BMW Motorrad', 'Harley-Davidson', 'KTM', 'Royal Enfield', 'Triumph',
     'Aprilia', 'Bajaj', 'TVS', 'Hero', 'Benelli',
     'Husqvarna', 'Indian', 'MV Agusta', 'Piaggio', 'Vespa',
     'CFMoto', 'Zero Motorcycles', 'Energica', 'Norton', 'Moto Guzzi',
];

const bikeTypeOptions = ['Standard', 'Sports', 'Cruiser', 'Scooter', 'Dirt'];

const fuelOptions = ['Petrol', 'Diesel', 'Octane', 'Electric', 'Hybrid', 'CNG'];

const transmissionOptions = ['Manual', 'Automatic', 'Semi-Automatic'];

const engineStartOptions = ['Kick', 'Self', 'Both'];

const insuranceCoverageOptions = ['Comprehensive', 'Third_Party', 'Basic'];

const vehicleFields = [
     { label: 'Brand', key: 'brand', fieldType: 'select', options: carBrandOptions, required: true },
     { label: 'Model', key: 'model', required: true },
     { label: 'Car Type', key: 'car_type', fieldType: 'select', options: carTypeOptions, required: true },
     { label: 'Build Year', key: 'build_year', type: 'number' },
     { label: 'Seats', key: 'seats', type: 'number' },
     { label: 'Mileage', key: 'mileage', type: 'number' },
     { label: 'Fuel', key: 'fuel', fieldType: 'select', options: fuelOptions },
     { label: 'Gear', key: 'gear', type: 'number' },
     { label: 'Transmission Type', key: 'transmission_type', fieldType: 'select', options: transmissionOptions },
     { label: 'Rental Price', key: 'rental_price', type: 'number', required: true },
];

const featureFields = [
     { label: 'AC', key: 'air_conditioning' },
     { label: 'Bluetooth', key: 'bluetooth' },
     { label: 'GPS', key: 'gps' },
     { label: 'Central Locking', key: 'central_locking' },
];

const bikeFields = [
     { label: 'Brand', key: 'brand', fieldType: 'select', options: bikeBrandOptions, required: true },
     { label: 'Model', key: 'model', required: true },
     { label: 'Bike Type', key: 'car_type', fieldType: 'select', options: bikeTypeOptions, required: true },
     { label: 'Build Year', key: 'build_year', type: 'number' },
     { label: 'Mileage', key: 'mileage', type: 'number' },
     { label: 'Fuel', key: 'fuel', fieldType: 'select', options: fuelOptions },
     { label: 'Fuel Capacity', key: 'fuel_capacity', type: 'number' },
     { label: 'Engine Capacity', key: 'engine_capacity', type: 'number' },
     { label: 'Gear', key: 'gear', type: 'number' },
     { label: 'Engine Start Type', key: 'engine_start_type', fieldType: 'select', options: engineStartOptions },
     { label: 'Helmet Count', key: 'helmet_count', type: 'number' },
     { label: 'Rental Price', key: 'rental_price', type: 'number', required: true },
];

const bikeFeatureFields = [
     { label: 'ABS', key: 'abs' },
     { label: 'Disk Brake', key: 'disk_brake' },
];

const complianceTextFields = [
     { label: 'License Number', key: 'license_number' },
     { label: 'Fitness Certificate', key: 'fitness_certificate' },
     { label: 'Issuing Authority', key: 'issuing_authority' },
     { label: 'Insurance Number', key: 'insurance_number' },
     { label: 'Insurance Provider', key: 'insurance_provider' },
     { label: 'Insurance Coverage Type', key: 'insurance_coverage_type', fieldType: 'select', options: insuranceCoverageOptions },
];

const complianceDateFields = [
     { label: 'License Expire Date', key: 'expire_date' },
     { label: 'Insurance Start Date', key: 'insurance_start_date' },
     { label: 'Insurance End Date', key: 'insurance_ending_date' },
];

const AddCars = () => {
     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();

     const [imagePreview, setImagePreview] = useState(null);
     const [imageFile, setImageFile] = useState(null);
     const [vehicleType, setVehicleType] = useState(null);
     const [formData, setFormData] = useState({});
     const [aboutText, setAboutText] = useState('');
     const [features, setFeatures] = useState({});
     const [complianceData, setComplianceData] = useState({});
     const [dates, setDates] = useState({});
     const [submitting, setSubmitting] = useState(false);

     // Fetch agency profile to get agency_id
     const { data: agencyProfile, isLoading: agencyLoading } = useQuery({
          queryKey: ['agencyProfile', user?.email],
          enabled: !!user?.email,
          queryFn: async () => {
               const response = await axiosPublic.get(`agencyRoutes/getAgencyProfile/${user.email}`);
               return response.data;
          },
     });

     const handleVehicleTypeChange = (type) => {
          setVehicleType(type);
          setFormData({});
          setAboutText('');
          setFeatures({});
          setComplianceData({});
          setDates({});
          setImagePreview(null);
          setImageFile(null);
     };

     const handleFieldChange = (key, value) => {
          setFormData((prev) => ({ ...prev, [key]: value }));
     };

     const handleComplianceChange = (key, value) => {
          setComplianceData((prev) => ({ ...prev, [key]: value }));
     };

     const handleFeatureToggle = (key) => {
          setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
     };

     const handleDateChange = (key, value) => {
          setDates((prev) => ({ ...prev, [key]: value }));
     };

     const handleImageChange = (event) => {
          const file = event.target.files[0];
          if (file) {
               setImageFile(file);
               const reader = new FileReader();
               reader.onload = (e) => {
                    setImagePreview(e.target.result);
               };
               reader.readAsDataURL(file);
          } else {
               setImagePreview(null);
               setImageFile(null);
          }
     };

     const resetForm = () => {
          setFormData({});
          setAboutText('');
          setFeatures({});
          setComplianceData({});
          setDates({});
          setImagePreview(null);
          setImageFile(null);
     };

     const handleSubmit = async () => {
          if (submitting) return;

          if (!agencyProfile?.agency_id) {
               toast.error('Agency profile not found. Please try again.');
               return;
          }

          // Client-side required field check
          const requiredFields = ['brand', 'model', 'car_type', 'rental_price'];
          const missingFields = requiredFields.filter((f) => !formData[f]);
          if (missingFields.length > 0) {
               toast.error(`Please fill in: ${missingFields.map(f => f.replace(/_/g, ' ')).join(', ')}`);
               return;
          }

          setSubmitting(true);

          try {
               let imageUrl = null;
               if (imageFile) {
                    const imgData = new FormData();
                    imgData.append('image', imageFile);
                    try {
                         const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_imgbb_api_key}`, {
                              method: 'POST',
                              body: imgData,
                         });
                         const imgJson = await imgRes.json();
                         if (imgJson.success) {
                              imageUrl = imgJson.data.display_url;
                         } else {
                              toast.error('Failed to upload image to imgbb.');
                              setSubmitting(false);
                              return;
                         }
                    } catch (err) {
                         toast.error('Error uploading image.');
                         setSubmitting(false);
                         return;
                    }
               }

               // Build base payload
               const payload = {
                    agency_id: agencyProfile.agency_id,
                    brand: formData.brand,
                    model: formData.model,
                    car_type: formData.car_type,
                    rental_price: formData.rental_price,
               };

               if (imageUrl) {
                    payload.images = imageUrl;
               }

               // Add optional vehicle fields
               if (formData.build_year) payload.build_year = formData.build_year;
               if (formData.mileage) payload.mileage = formData.mileage;
               if (formData.fuel) payload.fuel = formData.fuel;
               if (formData.gear) payload.gear = formData.gear;
               if (aboutText.trim()) payload.about = aboutText.trim();

               if (vehicleType === 'car') {
                    if (formData.seats) payload.seats = formData.seats;
                    if (formData.transmission_type) payload.transmission_type = formData.transmission_type;
                    // Boolean features
                    payload.air_conditioning = !!features.air_conditioning;
                    payload.gps = !!features.gps;
                    payload.bluetooth = !!features.bluetooth;
                    payload.central_locking = !!features.central_locking;
               } else {
                    // Bike-specific fields
                    if (formData.fuel_capacity) payload.fuel_capacity = formData.fuel_capacity;
                    if (formData.engine_capacity) payload.engine_capacity = formData.engine_capacity;
                    if (formData.engine_start_type) payload.engine_start_type = formData.engine_start_type;
                    if (formData.helmet_count) payload.helmet_count = formData.helmet_count;
                    // Boolean features
                    payload.abs = !!features.abs;
                    payload.disk_brake = !!features.disk_brake;
               }

               // Build documentation object
               const documentation = {};
               if (complianceData.license_number?.trim()) documentation.license_number = complianceData.license_number.trim();
               if (complianceData.fitness_certificate?.trim()) documentation.fitness_certificate = complianceData.fitness_certificate.trim();
               if (complianceData.issuing_authority?.trim()) documentation.issuing_authority = complianceData.issuing_authority.trim();
               if (complianceData.insurance_number?.trim()) documentation.insurance_number = complianceData.insurance_number.trim();
               if (complianceData.insurance_provider?.trim()) documentation.insurance_provider = complianceData.insurance_provider.trim();
               if (complianceData.insurance_coverage_type) documentation.insurance_coverage_type = complianceData.insurance_coverage_type;
               if (dates.expire_date) documentation.expire_date = dates.expire_date.format('YYYY-MM-DD');
               if (dates.insurance_start_date) documentation.insurance_start_date = dates.insurance_start_date.format('YYYY-MM-DD');
               if (dates.insurance_ending_date) documentation.insurance_ending_date = dates.insurance_ending_date.format('YYYY-MM-DD');

               payload.documentation = documentation;

               // Determine endpoint
               const endpoint = vehicleType === 'car'
                    ? '/carRoutes/addCar'
                    : '/bikeRoutes/addBike';

               const response = await axiosPublic.post(endpoint, payload);

               if (response.data.success) {
                    toast.success(response.data.message || `${vehicleType === 'car' ? 'Car' : 'Bike'} added successfully!`);
                    resetForm();
               }
          } catch (error) {
               console.error('Vehicle submission error:', error);
               const errData = error.response?.data;
               if (errData?.errors && Array.isArray(errData.errors)) {
                    // Show first validation error
                    const firstErr = errData.errors[0];
                    toast.error(`${firstErr.field}: ${firstErr.message}`);
               } else {
                    toast.error(errData?.message || 'Failed to add vehicle. Please try again.');
               }
          } finally {
               setSubmitting(false);
          }
     };

     const VisuallyHiddenInput = styled('input')({
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          height: 1,
          overflow: 'hidden',
          position: 'absolute',
          bottom: 0,
          left: 0,
          whiteSpace: 'nowrap',
          width: 1,
     });

     const brandButtonSx = {
          background: 'linear-gradient(135deg, #F58300 0%, #ff9a2f 100%)',
          boxShadow: '0 12px 24px rgba(245, 131, 0, 0.24)',
          px: 2.5,
          py: 1,
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          color: '#fff',
          '&:hover': {
               background: 'linear-gradient(135deg, #e67600 0%, #f58300 100%)',
               boxShadow: '0 14px 28px rgba(245, 131, 0, 0.3)',
          },
     };

     const outlinedBrandButtonSx = {
          border: '2px solid #F58300',
          color: '#F58300',
          bgcolor: 'transparent',
          px: 2.5,
          py: 1,
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          '&:hover': {
               background: 'rgba(245, 131, 0, 0.08)',
               border: '2px solid #e67600',
          },
     };

     const checkboxSx = {
          color: 'rgba(245, 131, 0, 0.5)',
          '&.Mui-checked': {
               color: '#F58300',
          },
     };

     const renderField = (field) => {
          if (field.fieldType === 'select') {
               return (
                    <Autocomplete
                         key={field.label}
                         options={field.options}
                         size="small"
                         fullWidth
                         value={formData[field.key] || null}
                         onChange={(_, newValue) => handleFieldChange(field.key, newValue)}
                         renderInput={(params) => (
                              <TextField {...params} label={field.label} variant="outlined" required={field.required} />
                         )}
                    />
               );
          }
          return (
               <TextField
                    key={field.label}
                    fullWidth
                    size="small"
                    label={field.label}
                    variant="outlined"
                    multiline={field.multiline}
                    rows={field.rows}
                    type={field.type || 'text'}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
               />
          );
     };

     const renderComplianceField = (field) => {
          if (field.fieldType === 'select') {
               return (
                    <Autocomplete
                         key={field.label}
                         options={field.options}
                         size="small"
                         fullWidth
                         value={complianceData[field.key] || null}
                         onChange={(_, newValue) => handleComplianceChange(field.key, newValue)}
                         renderInput={(params) => (
                              <TextField {...params} label={field.label} variant="outlined" />
                         )}
                    />
               );
          }
          return (
               <TextField
                    key={field.label}
                    fullWidth
                    size="small"
                    label={field.label}
                    variant="outlined"
                    value={complianceData[field.key] ?? ''}
                    onChange={(e) => handleComplianceChange(field.key, e.target.value)}
               />
          );
     };

     const renderCheckbox = (field) => (
          <FormControlLabel
               key={field.label}
               control={
                    <Checkbox
                         checked={!!features[field.key]}
                         onChange={() => handleFeatureToggle(field.key)}
                         size="small"
                         sx={checkboxSx}
                    />
               }
               label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                         {field.label}
                    </Typography>
               }
               sx={{
                    m: 0,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: features[field.key] ? 'rgba(245, 131, 0, 0.4)' : 'rgba(0, 0, 0, 0.12)',
                    background: features[field.key] ? 'rgba(245, 131, 0, 0.06)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                         borderColor: 'rgba(245, 131, 0, 0.4)',
                         background: 'rgba(245, 131, 0, 0.04)',
                    },
               }}
          />
     );

     const renderDatePicker = (field) => (
          <LocalizationProvider dateAdapter={AdapterMoment} key={field.key}>
               <DemoContainer components={['DatePicker']} sx={{ pt: 0 }}>
                    <DatePicker
                         label={field.label}
                         value={dates[field.key] || null}
                         onChange={(newValue) => handleDateChange(field.key, newValue)}
                         slotProps={{
                              textField: {
                                   size: 'small',
                                   fullWidth: true,
                              },
                         }}
                    />
               </DemoContainer>
          </LocalizationProvider>
     );

     if (!vehicleType) {
          return (
               <Box
                    sx={{
                         px: { xs: 2, md: 4 },
                         py: { xs: 4, md: 8 },
                         minHeight: '100%',
                         background: 'linear-gradient(180deg, rgba(245,131,0,0.08) 0%, rgba(255,255,255,1) 18%, rgba(255,250,244,1) 100%)',
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'center',
                    }}
               >
                    <Box textAlign="center" mb={6}>
                         <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1f2937', mb: 2 }}>
                              Add a new vehicle
                         </Typography>
                         <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: 600, mx: 'auto' }}>
                              Choose whether you want to add a car or a bike to your agency fleet. Each vehicle type has tailored options to ensure you capture the right details.
                         </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" width="100%" maxWidth={800}>
                         <Paper
                              elevation={0}
                              onClick={() => handleVehicleTypeChange('car')}
                              sx={{
                                   flex: 1,
                                   p: 5,
                                   textAlign: 'center',
                                   cursor: 'pointer',
                                   borderRadius: 5,
                                   border: '2px solid transparent',
                                   background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 52%, #FFF1DE 100%)',
                                   boxShadow: '0 12px 24px rgba(245, 131, 0, 0.08)',
                                   transition: 'all 0.3s ease',
                                   '&:hover': {
                                        transform: 'translateY(-4px)',
                                        border: '2px solid rgba(245, 131, 0, 0.4)',
                                        boxShadow: '0 20px 40px rgba(245, 131, 0, 0.16)',
                                   }
                              }}
                         >
                              <Typography sx={{ fontSize: 72, mb: 2, lineHeight: 1 }}>🚗</Typography>
                              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f2937' }}>
                                   Add a Car
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                                   Standard vehicles, SUVs, Sedans.
                              </Typography>
                         </Paper>

                         <Paper
                              elevation={0}
                              onClick={() => handleVehicleTypeChange('bike')}
                              sx={{
                                   flex: 1,
                                   p: 5,
                                   textAlign: 'center',
                                   cursor: 'pointer',
                                   borderRadius: 5,
                                   border: '2px solid transparent',
                                   background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 52%, #FFF1DE 100%)',
                                   boxShadow: '0 12px 24px rgba(245, 131, 0, 0.08)',
                                   transition: 'all 0.3s ease',
                                   '&:hover': {
                                        transform: 'translateY(-4px)',
                                        border: '2px solid rgba(245, 131, 0, 0.4)',
                                        boxShadow: '0 20px 40px rgba(245, 131, 0, 0.16)',
                                   }
                              }}
                         >
                              <Typography sx={{ fontSize: 72, mb: 2, lineHeight: 1 }}>🏍️</Typography>
                              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f2937' }}>
                                   Add a Bike
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                                   Motorbikes, Scooters.
                              </Typography>
                         </Paper>
                    </Stack>
               </Box>
          );
     }

     const currentVehicleFields = vehicleType === 'car' ? vehicleFields : bikeFields;
     const currentFeatureFields = vehicleType === 'car' ? featureFields : bikeFeatureFields;

     return (
          <Box
               sx={{
                    px: { xs: 2, md: 4 },
                    py: { xs: 2, md: 4 },
                    minHeight: '100%',
                    background: 'linear-gradient(180deg, rgba(245,131,0,0.08) 0%, rgba(255,255,255,1) 18%, rgba(255,250,244,1) 100%)',
               }}
          >
               <Stack direction="row" spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
                    <Button 
                         variant={vehicleType === 'car' ? 'contained' : 'outlined'} 
                         sx={vehicleType === 'car' ? brandButtonSx : outlinedBrandButtonSx}
                         onClick={() => handleVehicleTypeChange('car')}
                    >
                         Add Car
                    </Button>
                    <Button 
                         variant={vehicleType === 'bike' ? 'contained' : 'outlined'} 
                         sx={vehicleType === 'bike' ? brandButtonSx : outlinedBrandButtonSx}
                         onClick={() => handleVehicleTypeChange('bike')}
                    >
                         Add Bike
                    </Button>
               </Stack>

               <Paper
                    elevation={0}
                    sx={{
                         mb: 4,
                         overflow: 'hidden',
                         border: '1px solid rgba(245, 131, 0, 0.12)',
                         borderRadius: 5,
                         background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 52%, #FFF1DE 100%)',
                    }}
               >
                    <Box
                         sx={{
                              px: { xs: 3, md: 5 },
                              py: { xs: 4, md: 5 },
                              display: 'grid',
                              gap: 3,
                              gridTemplateColumns: { md: '1.4fr 0.9fr' },
                              alignItems: 'center',
                         }}
                    >
                         <Stack spacing={1.5}>
                              <Chip
                                   label="Agency vehicle intake"
                                   sx={{
                                        alignSelf: 'flex-start',
                                        fontWeight: 700,
                                        color: '#9a4c00',
                                        backgroundColor: 'rgba(245, 131, 0, 0.12)',
                                   }}
                              />
                              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1f2937', lineHeight: 1.05 }}>
                                   Add {vehicleType === 'car' ? 'cars' : 'bikes'} with a polished, structured flow.
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: 760 }}>
                                   Capture each vehicle in a clean layout with grouped details, compliance fields, and a visual upload area that feels closer to a premium dashboard than a plain form.
                              </Typography>
                         </Stack>

                         <Paper
                              elevation={0}
                              sx={{
                                   p: 2.5,
                                   borderRadius: 4,
                                   border: '1px solid rgba(245, 131, 0, 0.14)',
                                   background: 'rgba(255,255,255,0.8)',
                                   backdropFilter: 'blur(10px)',
                              }}
                         >
                              <Stack spacing={1.5}>
                                   <Typography variant="overline" sx={{ letterSpacing: 1.4, color: '#9a4c00', fontWeight: 800 }}>
                                        One vehicle per submission
                                   </Typography>
                                   <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Submit a single {vehicleType === 'car' ? 'car' : 'bike'} now. You can come back and add another vehicle after this one is saved.
                                   </Typography>
                              </Stack>
                         </Paper>
                    </Box>
               </Paper>

               <Card
                    elevation={0}
                    sx={{
                         mb: 4,
                         borderRadius: 5,
                         border: '1px solid rgba(15, 23, 42, 0.08)',
                         overflow: 'hidden',
                         boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
                    }}
               >
                    <Box
                         sx={{
                              px: { xs: 2.5, md: 4 },
                              py: { xs: 2.5, md: 3 },
                              background: 'linear-gradient(135deg, rgba(245,131,0,0.14) 0%, rgba(255,255,255,1) 70%)',
                              borderBottom: '1px solid rgba(245, 131, 0, 0.08)',
                         }}
                    >
                         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
                              <Box>
                                   <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#1f2937', textTransform: 'capitalize' }}>
                                        {vehicleType} details
                                   </Typography>
                                   <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Fill in the vehicle specs, registration details, and supporting documents.
                                   </Typography>
                              </Box>
                              <Chip
                                   label="Draft vehicle"
                                   sx={{
                                        alignSelf: { xs: 'flex-start', sm: 'center' },
                                        fontWeight: 700,
                                        color: '#9a4c00',
                                        backgroundColor: 'rgba(245, 131, 0, 0.12)',
                                   }}
                              />
                         </Stack>
                    </Box>

                    <CardContent sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 } }}>
                         <Grid container spacing={3}>
                              <Grid item xs={12} md={8}>
                                   <Stack spacing={3}>
                                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, borderColor: 'rgba(245, 131, 0, 0.15)' }}>
                                             <Stack spacing={2}>
                                                  <Box>
                                                       <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                                                            Vehicle details
                                                       </Typography>
                                                       <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                            Core specifications, pricing, and comfort features.
                                                       </Typography>
                                                  </Box>
                                                  <Grid container spacing={2}>
                                                       {currentVehicleFields.map((field, index) => (
                                                            <Grid item xs={12} sm={6} key={`${field.label}-${index}`}>
                                                                 {renderField(field)}
                                                            </Grid>
                                                       ))}
                                                       <Grid item xs={12}>
                                                            <TextField
                                                                 fullWidth
                                                                 size="small"
                                                                 label="About"
                                                                 variant="outlined"
                                                                 multiline
                                                                 rows={4}
                                                                 value={aboutText}
                                                                 onChange={(e) => setAboutText(e.target.value)}
                                                            />
                                                       </Grid>
                                                  </Grid>

                                                  {/* ── Features (boolean checkboxes) ── */}
                                                  <Divider sx={{ borderColor: 'rgba(245, 131, 0, 0.12)' }} />
                                                  <Box>
                                                       <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                                                            Features
                                                       </Typography>
                                                       <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                                            Toggle the features available in this {vehicleType}.
                                                       </Typography>
                                                       <Stack direction="row" flexWrap="wrap" gap={1.5}>
                                                            {currentFeatureFields.map((field) => renderCheckbox(field))}
                                                       </Stack>
                                                  </Box>
                                             </Stack>
                                        </Paper>

                                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, borderColor: 'rgba(245, 131, 0, 0.15)' }}>
                                             <Stack spacing={2}>
                                                  <Box>
                                                       <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                                                            Compliance details
                                                       </Typography>
                                                       <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                            Registration and insurance information in one place.
                                                       </Typography>
                                                  </Box>
                                                  <Grid container spacing={2}>
                                                       {complianceTextFields.map((field, index) => (
                                                            <Grid item xs={12} sm={6} key={`${field.label}-${index}`}>
                                                                 {renderComplianceField(field)}
                                                            </Grid>
                                                       ))}

                                                       {/* ── Date picker fields ── */}
                                                       {complianceDateFields.map((field) => (
                                                            <Grid item xs={12} sm={6} key={field.key}>
                                                                 {renderDatePicker(field)}
                                                            </Grid>
                                                       ))}
                                                  </Grid>
                                             </Stack>
                                        </Paper>
                                   </Stack>
                              </Grid>

                              <Grid item xs={12} md={4}>
                                   <Paper
                                        variant="outlined"
                                        sx={{
                                             p: { xs: 2.5, md: 3 },
                                             borderRadius: 4,
                                             borderColor: 'rgba(245, 131, 0, 0.15)',
                                             background: 'linear-gradient(180deg, #fffaf4 0%, #ffffff 100%)',
                                             position: 'sticky',
                                             top: 24,
                                        }}
                                   >
                                        <Stack spacing={2.5} alignItems="center" textAlign="center">
                                             <Box
                                                  sx={{
                                                       p: 1,
                                                       borderRadius: '999px',
                                                       background: 'linear-gradient(135deg, rgba(245,131,0,0.16) 0%, rgba(245,131,0,0.04) 100%)',
                                                  }}
                                             >
                                                  <Box
                                                       component="img"
                                                       src={imagePreview || profile}
                                                       alt={`${vehicleType} preview`}
                                                       sx={{
                                                            width: 168,
                                                            height: 168,
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            border: '6px solid #ffffff',
                                                            boxShadow: '0 16px 32px rgba(245, 131, 0, 0.18)',
                                                       }}
                                                  />
                                             </Box>

                                             <Box>
                                                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', textTransform: 'capitalize' }}>
                                                       {vehicleType} image
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                                       Upload a sharp cover photo to make the listing feel premium.
                                                  </Typography>
                                             </Box>

                                             <Button
                                                  component="label"
                                                  role={undefined}
                                                  variant="contained"
                                                  tabIndex={-1}
                                                  startIcon={<CloudUpload />}
                                                  sx={brandButtonSx}
                                             >
                                                  {vehicleType === 'car' ? 'Car Picture' : 'Bike Picture'}
                                                  <VisuallyHiddenInput
                                                       type="file"
                                                       accept="image/*"
                                                       onChange={handleImageChange}
                                                       multiple
                                                       required
                                                  />
                                             </Button>

                                             <Divider flexItem sx={{ borderColor: 'rgba(245, 131, 0, 0.12)' }} />

                                             <Stack spacing={1} sx={{ width: '100%' }}>
                                                  <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.1 }}>
                                                       Checklist
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ color: '#374151' }}>
                                                       Add a clear image, strong pricing, and complete compliance data before publishing.
                                                  </Typography>
                                             </Stack>
                                        </Stack>
                                   </Paper>
                              </Grid>
                         </Grid>
                    </CardContent>
               </Card>

               <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                    <Button
                         variant="contained"
                         size="large"
                         sx={brandButtonSx}
                         onClick={handleSubmit}
                         disabled={submitting || agencyLoading}
                         startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : null}
                    >
                         {submitting ? 'Adding...' : `Add ${vehicleType === 'car' ? 'Car' : 'Bike'}`}
                    </Button>
               </Box>
          </Box>
     );
};

export default AddCars;