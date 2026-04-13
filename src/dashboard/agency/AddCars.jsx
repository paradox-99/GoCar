// import useAxiosPublic from '../../hooks/useAxiosPublic';
// import useRole from '../../hooks/useRole';
import { Autocomplete, Box, Button, Card, CardContent, Checkbox, Chip, Divider, FormControlLabel, Grid, Paper, Stack, styled, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { CloudUpload } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
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

const carTypeOptions = [
     'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible',
     'Wagon', 'Minivan', 'Pickup Truck', 'Crossover', 'Sports Car',
     'Luxury', 'Electric', 'Hybrid', 'Compact', 'Micro Car',
     'Off-Road', 'Limousine', 'Van', 'MPV',
];

const bikeBrandOptions = [
     'Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Ducati',
     'BMW Motorrad', 'Harley-Davidson', 'KTM', 'Royal Enfield', 'Triumph',
     'Aprilia', 'Bajaj', 'TVS', 'Hero', 'Benelli',
     'Husqvarna', 'Indian', 'MV Agusta', 'Piaggio', 'Vespa',
     'CFMoto', 'Zero Motorcycles', 'Energica', 'Norton', 'Moto Guzzi',
];

const vehicleFields = [
     { label: 'Brand', fieldType: 'select', options: carBrandOptions },
     { label: 'Model' },
     { label: 'Car Type', fieldType: 'select', options: carTypeOptions },
     { label: 'Trim Level' },
     { label: 'Build Year', type: 'number' },
     { label: 'Seats', type: 'number' },
     { label: 'Mileage', type: 'number' },
     { label: 'Fuel' },
     { label: 'Gear', type: 'number' },
     { label: 'Transmission Type' },
     { label: 'Rental Price', type: 'number' },
];

const featureFields = [
     { label: 'AC', key: 'air_conditioning' },
     { label: 'Bluetooth', key: 'bluetooth' },
     { label: 'GPS', key: 'gps' },
     { label: 'Heater', key: 'heater' },
     { label: 'Central Locking', key: 'central_locking' },
];

const bikeFields = [
     { label: 'Brand', fieldType: 'select', options: bikeBrandOptions },
     { label: 'Model' },
     { label: 'Bike Type' },
     { label: 'Build Year', type: 'number' },
     { label: 'Mileage', type: 'number' },
     { label: 'Fuel' },
     { label: 'Fuel Capacity', type: 'number' },
     { label: 'Engine Capacity', type: 'number' },
     { label: 'Gear', type: 'number' },
     { label: 'Engine Start Type' },
     { label: 'Helmet Count', type: 'number' },
     { label: 'Rental Price', type: 'number' },
];

const bikeFeatureFields = [
     { label: 'ABS', key: 'abs' },
     { label: 'Disk Brake', key: 'disk_brake' },
];

const complianceTextFields = [
     { label: 'License Number' },
     { label: 'Fitness Certificate' },
     { label: 'Issuing Authority' },
     { label: 'Insurance Number' },
     { label: 'Insurance Provider' },
     { label: 'Insurance Coverage Type' },
];

const complianceDateFields = [
     { label: 'License Expire Date', key: 'licenseExpireDate' },
     { label: 'Insurance Start Date', key: 'insuranceStartDate' },
     { label: 'Insurance End Date', key: 'insuranceEndDate' },
];

const AddCars = () => {
     // const role = useRole();
     // const axiosPublic = useAxiosPublic();
     const [imagePreview, setImagePreview] = useState(null);
     const [vehicleType, setVehicleType] = useState(null);
     const [features, setFeatures] = useState({});
     const [dates, setDates] = useState({});

     const handleFeatureToggle = (key) => {
          setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
     };

     const handleDateChange = (key, value) => {
          setDates((prev) => ({ ...prev, [key]: value }));
     };

     const handleImageChange = (event) => {
          const file = event.target.files[0];
          if (file) {
               const reader = new FileReader();
               reader.onload = (e) => {
                    setImagePreview(e.target.result);
               };
               reader.readAsDataURL(file);
          } else {
               setImagePreview(null);
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
                    multiline={field.multiline}
                    rows={field.rows}
                    type={field.type || 'text'}
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
                              onClick={() => setVehicleType('car')}
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
                              onClick={() => setVehicleType('bike')}
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
                         onClick={() => setVehicleType('car')}
                    >
                         Add Car
                    </Button>
                    <Button 
                         variant={vehicleType === 'bike' ? 'contained' : 'outlined'} 
                         sx={vehicleType === 'bike' ? brandButtonSx : outlinedBrandButtonSx}
                         onClick={() => setVehicleType('bike')}
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
                                                                 {renderField(field)}
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
                    <Button variant="contained" size="large" sx={brandButtonSx}>
                         Add {vehicleType === 'car' ? 'Car' : 'Bike'}
                    </Button>
               </Box>
          </Box>
     );
};

export default AddCars;