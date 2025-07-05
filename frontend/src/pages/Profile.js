import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import API_CONFIG from '../config/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        rewards: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                rewards: user.rewards || 0
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`${API_CONFIG.REACT_APP_API_BASE_URL}/users/profile`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address
            });

            updateUser(response.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };    return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container className="py-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <Card className="shadow-lg border-0">
                                <Card.Header style={{ 
                                    backgroundColor: 'var(--primary-medium)', 
                                    color: 'white',
                                    borderRadius: '15px 15px 0 0'
                                }}>
                                    <h3 className="text-center mb-0">
                                        <svg width="30" height="30" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                        </svg> 
                                    My Profile</h3>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    {user?.role === 'USER' && (
                                        <Alert variant="info" className="text-center mb-4">
                                            <h5 className="mb-2">🏆 Reward Points</h5>
                                            <h2 style={{ color: 'var(--primary-dark)' }}>{formData.rewards}</h2>
                                            <small>Keep reporting issues to earn more points!</small>
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">👤 First Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ borderRadius: '10px', padding: '12px' }}
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">👤 Last Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ borderRadius: '10px', padding: '12px' }}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">📧 Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                className="bg-light"
                                                style={{ borderRadius: '10px', padding: '12px' }}
                                            />
                                            <Form.Text className="text-muted">
                                                Email cannot be changed
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">📱 Phone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter your phone number"
                                                style={{ borderRadius: '10px', padding: '12px' }}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">🏠 Address</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Enter your address"
                                                style={{ borderRadius: '10px' }}
                                            />
                                        </Form.Group>

                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            className="w-100 fw-semibold"
                                            disabled={loading}
                                            style={{ 
                                                borderRadius: '10px',
                                                padding: '12px',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                '💾 Update Profile'
                                            )}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default Profile;
