// import useAxiosPublic from '../../hooks/useAxiosPublic';
// import useRole from '../../hooks/useRole';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Paper, Stack, styled, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { CloudUpload } from '@mui/icons-material';
import profile from "../../assets/travel.png"

const vehicleFields = [
     { label: 'Brand' },
     { label: 'Model' },
     { label: 'Car Type' },
     { label: 'Trim Level' },
     { label: 'Build Year' },
     { label: 'Seats' },
     { label: 'Mileage' },
     { label: 'Fuel' },
     { label: 'Gear' },
     { label: 'Transmission Type' },
     { label: 'Rental Price' },
];

const featureFields = [
     { label: 'AC' },
     { label: 'Bluetooth' },
     { label: 'GPS' },
     { label: 'Heater' },
     { label: 'Central Locking' },
];

const complianceFields = [
     { label: 'License Number' },
     { label: 'License Expire Date' },
     { label: 'Fitness Certificate' },
     { label: 'Issuing Authority' },
     { label: 'Insurance Number' },
     { label: 'Insurance Provider' },
     { label: 'Insurance Start Date' },
     { label: 'Insurance End Date' },
     { label: 'Insurance Coverage Type' },
];

const AddCars = () => {
     // const role = useRole();
     // const axiosPublic = useAxiosPublic();
     const [imagePreview, setImagePreview] = useState(null);

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
          '&:hover': {
               background: 'linear-gradient(135deg, #e67600 0%, #f58300 100%)',
               boxShadow: '0 14px 28px rgba(245, 131, 0, 0.3)',
          },
     };

     const renderField = (field) => (
          <TextField
               key={field.label}
               fullWidth
               size="small"
               label={field.label}
               variant="outlined"
               multiline={field.multiline}
               rows={field.rows}
               type={field.type}
          />
     );

     return (
          <Box
               sx={{
                    px: { xs: 2, md: 4 },
                    py: { xs: 2, md: 4 },
                    minHeight: '100%',
                    background: 'linear-gradient(180deg, rgba(245,131,0,0.08) 0%, rgba(255,255,255,1) 18%, rgba(255,250,244,1) 100%)',
               }}
          >
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
                                   Add cars with a polished, structured flow.
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
                                        Submit a single car now. You can come back and add another vehicle after this one is saved.
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
                                   <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#1f2937' }}>
                                        Car details
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
                                                       {vehicleFields.map((field, index) => (
                                                            <Grid item xs={12} sm={6} key={`${field.label}-${index}`}>
                                                                 {renderField(field)}
                                                            </Grid>
                                                       ))}
                                                       {featureFields.map((field, index) => (
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
                                                       {complianceFields.map((field, index) => (
                                                            <Grid item xs={12} sm={6} key={`${field.label}-${index}`}>
                                                                 {renderField(field)}
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
                                                       alt="Car preview"
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
                                                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                                                       Vehicle image
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
                                                  Car Picture
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
                         Add Car
                    </Button>
               </Box>
          </Box>
     );
};

export default AddCars;