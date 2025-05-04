// src/components/Doctors/EditDoctor.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { database, storage, auth } from '../../firebase/firebase';
import { ref, get, set } from 'firebase/database';
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
                const doctorRef = ref(database, `doctors/${id}`);
                const snapshot = await get(doctorRef);

                if (snapshot.exists()) {
                    const doctorData = snapshot.val();
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

            // Update in Realtime Database
            const doctorRef = ref(database, `doctors/${id}`);
            await set(doctorRef, {
                ...doctorData,
                id: id,
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
                            {/* Same form fields as AddDoctor component */}
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

                            {/* Continue with all form fields similar to AddDoctor... */}

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

            {/* Same notifications as AddDoctor component */}
        </>
    );
}

export default EditDoctor;