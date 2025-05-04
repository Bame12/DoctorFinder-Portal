// src/components/Doctors/EditDoctor.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage, auth } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import {
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Box,
    MenuItem,
    Snackbar,
    Alert,
    AppBar,
    Toolbar,
    FormControlLabel,
    Switch,
    CircularProgress
} from '@mui/material';
import { ExitToApp as LogoutIcon, Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';

const SPECIALTIES = [
    'General Practitioner', 'Pediatrician', 'Dermatologist', 'Cardiologist',
    'Neurologist', 'Psychiatrist', 'Orthopedist', 'Gynecologist', 'Ophthalmologist',
    'Dentist', 'Otolaryngologist', 'Endocrinologist', 'Gastroenterologist', 'Urologist',
    'Nephrologist', 'Oncologist', 'Neurosurgeon', 'Plastic Surgeon', 'Radiologist', 'Pathologist'
];

function EditDoctor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        email: '',
        phone: '',
        address: '',
        city: 'Gaborone',
        latitude: '',
        longitude: '',
        about: '',
        education: '',
        experience: '',
        isAvailable: true,
        acceptsInsurance: false
    });

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const doctorRef = doc(db, 'doctors', id);
                const docSnapshot = await getDoc(doctorRef);

                if (docSnapshot.exists()) {
                    const doctorData = docSnapshot.data();
                    setFormData({
                        name: doctorData.name || '',
                        specialty: doctorData.specialty || '',
                        email: doctorData.email || '',
                        phone: doctorData.phone || '',
                        address: doctorData.address || '',
                        city: doctorData.city || 'Gaborone',
                        latitude: doctorData.location?.latitude || '',
                        longitude: doctorData.location?.longitude || '',
                        about: doctorData.about || '',
                        education: doctorData.education || '',
                        experience: doctorData.experience || '',
                        isAvailable: doctorData.isAvailable !== undefined ? doctorData.isAvailable : true,
                        acceptsInsurance: doctorData.acceptsInsurance || false
                    });

                    if (doctorData.photoUrl) {
                        setPhotoPreview(doctorData.photoUrl);
                    }
                } else {
                    setError("Doctor not found");
                    setTimeout(() => {
                        navigate('/doctors');
                    }, 2000);
                }
            } catch (error) {
                setError(`Error fetching doctor: ${error.message}`);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchDoctor();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            setPhoto(e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const doctorData = { ...formData };

            // Upload photo if new one selected
            if (photo) {
                const photoRef = storageRef(storage, `doctors/${Date.now()}_${photo.name}`);
                const uploadResult = await uploadBytes(photoRef, photo);
                const photoURL = await getDownloadURL(uploadResult.ref);
                doctorData.photoUrl = photoURL;
            }

            // Create location object
            if (formData.latitude && formData.longitude) {
                doctorData.location = {
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude)
                };
            }

            // Update in Firestore
            const doctorRef = doc(db, 'doctors', id);
            await updateDoc(doctorRef, {
                ...doctorData,
                updatedAt: Date.now(),
                experience: parseInt(formData.experience) || 0
            });

            setSuccessMessage('Doctor updated successfully!');
            setTimeout(() => {
                navigate('/doctors');
            }, 2000);

        } catch (error) {
            setError(`Error updating doctor: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/login');
        });
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Doctor Finder Admin
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/')}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate('/doctors')}>Doctors</Button>
                    <Button color="inherit" onClick={() => navigate('/reports')}>Reports</Button>
                    <Button color="inherit" onClick={handleLogout} endIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1">
                        Edit Doctor
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<BackIcon />}
                        onClick={() => navigate('/doctors')}
                    >
                        Back to List
                    </Button>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Basic Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Basic Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    select
                                    label="Specialty"
                                    name="specialty"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                >
                                    {SPECIALTIES.map((specialty) => (
                                        <MenuItem key={specialty} value={specialty}>
                                            {specialty}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Location Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Location Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Latitude"
                                    name="latitude"
                                    type="number"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Longitude"
                                    name="longitude"
                                    type="number"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Additional Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Additional Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="About"
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Education"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Years of Experience"
                                    name="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Availability */}
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isAvailable}
                                            onChange={handleChange}
                                            name="isAvailable"
                                            color="primary"
                                        />
                                    }
                                    label="Available for appointments"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.acceptsInsurance}
                                            onChange={handleChange}
                                            name="acceptsInsurance"
                                            color="primary"
                                        />
                                    }
                                    label="Accepts medical insurance"
                                />
                            </Grid>

                            {/* Photo Upload */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Doctor Photo
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="photo-upload"
                                    type="file"
                                    onChange={handlePhotoChange}
                                />
                                <label htmlFor="photo-upload">
                                    <Button variant="outlined" component="span">
                                        Upload Photo
                                    </Button>
                                </label>

                                {photoPreview && (
                                    <Box mt={2}>
                                        <img
                                            src={photoPreview}
                                            alt="Doctor preview"
                                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                            {/* Submit Button */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Update Doctor'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>

            {/* Notifications */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={2000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert severity="success" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    );
}

export default EditDoctor;