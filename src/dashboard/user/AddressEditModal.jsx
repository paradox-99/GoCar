import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress } from "@mui/material";
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const AddressEditModal = ({ open, onClose, addressData, userId, onAddressUpdated }) => {
     const axiosPublic = useAxiosPublic();
     const [editData, setEditData] = useState(addressData || {});
     const [isLoading, setIsLoading] = useState(false);

     const handleChange = (field, value) => {
          setEditData(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const handleSave = async () => {
          if (!editData.city || !editData.area || !editData.postcode) {
               toast.error('Please fill all required fields');
               return;
          }
          setIsLoading(true);
          try {
               await axiosPublic.patch(`/userRoute/updateUserAddress/${userId}`, {
                    city: editData.city,
                    area: editData.area,
                    postcode: editData.postcode,
                    display_name: editData.display_name || editData.display_address
               });
               toast.success('Address updated successfully!');
               onAddressUpdated();
               onClose();
          } catch (error) {
               toast.error('Failed to update address');
               console.error(error);
          } finally {
               setIsLoading(false);
          }
     };

     return (
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
               <DialogTitle>Edit Address</DialogTitle>
               <DialogContent className="pt-6">
                    <Grid container spacing={3}>
                         <Grid item xs={12} sm={6}>
                              <TextField
                                   fullWidth
                                   label="City"
                                   value={editData.city || ''}
                                   onChange={(e) => handleChange('city', e.target.value)}
                                   required
                                   size="small"
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
                         </Grid>
                         <Grid item xs={12} sm={6}>
                              <TextField
                                   fullWidth
                                   label="Area"
                                   value={editData.area || ''}
                                   onChange={(e) => handleChange('area', e.target.value)}
                                   required
                                   size="small"
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
                         </Grid>
                         <Grid item xs={12} sm={6}>
                              <TextField
                                   fullWidth
                                   label="Postcode"
                                   value={editData.postcode || ''}
                                   onChange={(e) => handleChange('postcode', e.target.value)}
                                   required
                                   size="small"
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
                         </Grid>
                         <Grid item xs={12}>
                              <TextField
                                   fullWidth
                                   label="Detailed Address"
                                   value={editData.display_name || editData.display_address || ''}
                                   onChange={(e) => handleChange('display_name', e.target.value)}
                                   multiline
                                   rows={3}
                                   size="small"
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
                         </Grid>
                    </Grid>
               </DialogContent>
               <DialogActions className="p-4">
                    <Button onClick={onClose} disabled={isLoading}>
                         Cancel
                    </Button>
                    <Button
                         onClick={handleSave}
                         variant="contained"
                         disabled={isLoading}
                         sx={{
                              background: '#10b981',
                              '&:hover': { background: '#059669' },
                         }}
                    >
                         {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
               </DialogActions>
          </Dialog>
     );
};

export default AddressEditModal;
