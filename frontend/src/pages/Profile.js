import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import API_CONFIG from '../config/api';

const Profile = () => {
    const { user, updateUser } = useAuth();    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        rewards: 0,
        profilePhoto: null
    });
    const [loading, setLoading] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                rewards: user.rewards || 0,
                profilePhoto: null
            });
            setCurrentProfilePhoto(user.profilePhoto || null);
        }
    }, [user]);    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({
                ...formData,
                profilePhoto: e.target.files[0]
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handlePhotoUpload = async () => {
        if (!formData.profilePhoto) return null;

        setPhotoUploading(true);
        try {
            const photoFormData = new FormData();
            photoFormData.append('image', formData.profilePhoto);

            const uploadResponse = await axios.post(
                `${API_CONFIG.REACT_APP_API_BASE_URL}/upload/image`,
                photoFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return uploadResponse.data.url;
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Error uploading profile photo');
            return null;
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload photo if selected
            let profilePhotoUrl = currentProfilePhoto;
            if (formData.profilePhoto) {
                profilePhotoUrl = await handlePhotoUpload();
                if (!profilePhotoUrl) {
                    setLoading(false);
                    return;
                }
            }            const response = await axios.put(`${API_CONFIG.REACT_APP_API_BASE_URL}/users/profile`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address,
                profilePhoto: profilePhotoUrl
            });

            updateUser(response.data);
            setCurrentProfilePhoto(profilePhotoUrl);
            setFormData(prev => ({ ...prev, profilePhoto: null }));
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
                                </Card.Header>                                <Card.Body className="p-4">
                                    {/* Reward Points and Profile Photo Section - Side by Side */}
                                    <div className="row mb-4">
                                        {user?.role === 'USER' && (
                                            <div className="col-md-6">
                                                <Alert variant="info" className="text-center h-100 d-flex flex-column justify-content-center">
                                                    <h5 className="mb-2">
                                                        <svg width="24" height="24" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                                            <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
                                                            <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
                                                        </svg>
                                                        Reward Points
                                                    </h5>
                                                    <h2 style={{ color: 'var(--primary-dark)' }}>{formData.rewards}</h2>
                                                    <small>Keep reporting issues to earn more points!</small>
                                                </Alert>
                                            </div>
                                        )}
                                        
                                        <div className={user?.role === 'USER' ? 'col-md-6' : 'col-12'}>
                                            <div className="text-center">
                                                <div className="position-relative d-inline-block">
                                                    {currentProfilePhoto ? (
                                                        <img 
                                                            src={currentProfilePhoto} 
                                                            alt="Profile" 
                                                            className="rounded-circle border"
                                                            style={{ 
                                                                width: '120px', 
                                                                height: '120px', 
                                                                objectFit: 'cover',
                                                                border: '4px solid var(--primary-light) !important'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="rounded-circle d-flex align-items-center justify-content-center border"
                                                            style={{ 
                                                                width: '120px', 
                                                                height: '120px', 
                                                                backgroundColor: 'var(--primary-medium)',
                                                                border: '4px solid var(--primary-light) !important'
                                                            }}
                                                        >
                                                            <span className="text-white fw-bold" style={{ fontSize: '2rem' }}>
                                                                {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                                                            </svg>
                                                            Profile Photo
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleChange}
                                                            className="mb-2"
                                                            style={{ borderRadius: '8px' }}
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Choose a profile photo (JPG, PNG, etc.)
                                                        </Form.Text>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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
                                            className="w-100 fw-semibold"                                            disabled={loading || photoUploading}
                                            style={{ 
                                                borderRadius: '10px',
                                                padding: '12px',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {loading || photoUploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    {photoUploading ? 'Uploading Photo...' : 'Updating...'}
                                                </>
                                            ) : (
                                                <span>
                                                    <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                                                    </svg>
                                                    Update Profile
                                                </span>
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
