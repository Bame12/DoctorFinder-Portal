// src/components/Doctors/DoctorList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import {
    Container,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Box,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    AppBar,
    Toolbar,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { signOut } from 'firebase/auth';

function DoctorList() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('');
    const [specialties, setSpecialties] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const doctorsRef = collection(db, 'doctors');
            const unsubscribe = onSnapshot(doctorsRef, (snapshot) => {
                const doctorsList = [];
                const specialtiesSet = new Set();

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    doctorsList.push({
                        id: doc.id,
                        ...data
                    });

                    if (data.specialty) {
                        specialtiesSet.add(data.specialty);
                    }
                });

                setDoctors(doctorsList);
                setSpecialties(Array.from(specialtiesSet));
                setLoading(false);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        } catch (error) {
            console.error("Error fetching doctors: ", error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/login');
        });
    };

    const handleDeleteClick = (doctor) => {
        setDoctorToDelete(doctor);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (doctorToDelete) {
            try {
                const doctorRef = doc(db, 'doctors', doctorToDelete.id);
                await deleteDoc(doctorRef);
                setDeleteDialogOpen(false);
                setDoctorToDelete(null);
            } catch (error) {
                console.error("Error deleting doctor: ", error);
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDoctorToDelete(null);
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.address?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty = filterSpecialty === '' || doctor.specialty === filterSpecialty;

        return matchesSearch && matchesSpecialty;
    });

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

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1">
                        Manage Doctors
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/doctors/add')}
                    >
                        Add New Doctor
                    </Button>
                </Box>

                <Paper sx={{ p: 2, mb: 4 }}>
                    <Box display="flex" gap={2} mb={3}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flexGrow: 1 }}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Specialty</InputLabel>
                            <Select
                                value={filterSpecialty}
                                label="Specialty"
                                onChange={(e) => setFilterSpecialty(e.target.value)}
                            >
                                <MenuItem value="">All Specialties</MenuItem>
                                {specialties.map((specialty) => (
                                    <MenuItem key={specialty} value={specialty}>
                                        {specialty}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {loading ? (
                        <Typography>Loading doctors...</Typography>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Specialty</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Address</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredDoctors.length > 0 ? (
                                            filteredDoctors.map((doctor) => (
                                                <TableRow key={doctor.id}>
                                                    <TableCell>{doctor.name}</TableCell>
                                                    <TableCell>{doctor.specialty}</TableCell>
                                                    <TableCell>{doctor.email}</TableCell>
                                                    <TableCell>{doctor.phone}</TableCell>
                                                    <TableCell>{doctor.address}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteClick(doctor)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No doctors found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box mt={2} display="flex" justifyContent="flex-end">
                                <Typography variant="body2">
                                    Total: {filteredDoctors.length} doctors
                                </Typography>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete Dr. {doctorToDelete?.name}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default DoctorList;