import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const UserDashboard = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: 'Garbage Dump',
        description: '',
        image: null
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({
                ...formData,
                image: e.target.files[0]
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.image) {
            toast.error('Please select an image');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Submitting issue...');

        try {
            // Get current location
            const location = await getCurrentLocation();

            // Upload image first
            const imageFormData = new FormData();
            imageFormData.append('image', formData.image);

            const uploadResponse = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/upload/image`,
                imageFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Create issue
            const issueData = {
                category: formData.category,
                description: formData.description,
                longitude: location.longitude,
                latitude: location.latitude,
                imageUrl: uploadResponse.data.url
            };

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/issues`, issueData);

            toast.update(toastId, {
                render: 'Issue submitted successfully! You earned 10 reward points.',
                type: 'success',
                isLoading: false,
                autoClose: 5000
            });

            // Reset form
            setFormData({
                category: 'Garbage Dump',
                description: '',
                image: null
            });
            
            // Reset file input
            const fileInput = document.getElementById('image');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error submitting issue:', error);
            toast.update(toastId, {
                render: error.response?.data?.message || 'Error submitting issue',
                type: 'error',
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <h3 className="mb-4">Welcome Back, {user?.firstName} {user?.lastName}!</h3>
                
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <Card>
                            <Card.Body>
                                <h4 className="text-center mb-4">Report a Problem</h4>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Category</Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Garbage Dump">Garbage Dump</option>
                                            <option value="Street Light Repair">Street Light Repair</option>
                                            <option value="Something else">Something else</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the issue in detail..."
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Upload a photo</Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="image"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        variant="success" 
                                        className="w-100"
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Issue'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default UserDashboard;
