import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import API_CONFIG from '../config/api';

const UserDashboard = () => {
    const { user } = useAuth();    const [formData, setFormData] = useState({
        category: 'Garbage Dump',
        customCategory: '',
        description: '',
        image: null
    });const [loading, setLoading] = useState(false);
    const [locationPermission, setLocationPermission] = useState(null); // null, 'granted', 'denied', 'prompt'
    const [locationError, setLocationError] = useState(null);
    const [userIssues, setUserIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(true);    // Check location permission status on component mount
    useEffect(() => {
        checkLocationPermission();
        loadUserIssues();
    }, []);

    const loadUserIssues = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.REACT_APP_API_BASE_URL}/issues/user/my-issues`);
            setUserIssues(response.data);
        } catch (error) {
            console.error('Error loading user issues:', error);
            toast.error('Failed to load issue history');
        } finally {
            setIssuesLoading(false);
        }
    };

    const checkLocationPermission = async () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            setLocationPermission('denied');
            return;
        }

        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                setLocationPermission(permission.state);
                
                if (permission.state === 'denied') {
                    setLocationError('Location access is required to submit issues. Please enable location permissions and refresh the page.');
                } else {
                    setLocationError(null);
                }

                // Listen for permission changes
                permission.addEventListener('change', () => {
                    setLocationPermission(permission.state);
                    if (permission.state === 'granted') {
                        setLocationError(null);
                        toast.success('Location permission granted! You can now submit issues.');
                    } else if (permission.state === 'denied') {
                        setLocationError('Location access is required to submit issues. Please enable location permissions and refresh the page.');
                    }
                });
            }
        } catch (error) {
            console.log('Permission API not supported, will check on first location request');
        }
    };

    const requestLocationPermission = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationPermission('granted');
                setLocationError(null);
                toast.success('Location permission granted! You can now submit issues.');
            },
            (error) => {
                setLocationPermission('denied');
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Location access denied. Please enable location permissions in your browser settings and try again.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Location information is unavailable. Please check your GPS/WiFi connection.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Location request timed out. Please try again.');
                        break;
                    default:
                        setLocationError('An unknown error occurred while accessing location.');
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

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
    };    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                setLocationError('Geolocation is not supported');
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationPermission('granted');
                    setLocationError(null);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    setLocationPermission('denied');
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location permissions and try again.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable. Please check your GPS/WiFi connection.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred while accessing location.';
                            break;
                    }
                    setLocationError(errorMessage);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.image) {
            toast.error('Please select an image');
            return;
        }

        // Validate custom category if "Something else" is selected
        if (formData.category === 'Something else' && !formData.customCategory.trim()) {
            toast.error('Please specify the category');
            return;
        }

        // Check if location permission is explicitly denied
        if (locationPermission === 'denied') {
            toast.error('Location permission is required to submit issues. Please enable location access.');
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
                `${API_CONFIG.REACT_APP_API_BASE_URL}/upload/image`,
                imageFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );            // Create issue
            const issueData = {
                category: formData.category === 'Something else' ? formData.customCategory : formData.category,
                description: formData.description,
                longitude: location.longitude,
                latitude: location.latitude,
                imageUrl: uploadResponse.data.url
            };

            await axios.post(`${API_CONFIG.REACT_APP_API_BASE_URL}/issues`, issueData);            toast.update(toastId, {
                render: 'Issue submitted successfully! It will be reviewed by admin.',
                type: 'success',
                isLoading: false,
                autoClose: 5000
            });            // Reset form
            setFormData({
                category: 'Garbage Dump',
                customCategory: '',
                description: '',
                image: null
            });
              // Reset file input
            const fileInput = document.getElementById('image');
            if (fileInput) fileInput.value = '';

            // Reload user issues
            loadUserIssues();

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
    };    return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container className="py-4">
                    <div className="text-center mb-4">
                        <h3 style={{ color: 'var(--primary-dark)' }}>
                            👋 Welcome Back, {user?.firstName} {user?.lastName}!
                        </h3>
                        <p className="text-muted">Help make your community better by reporting issues</p>
                    </div>
                    
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <Card className="shadow-lg border-0">
                                <Card.Header style={{ 
                                    backgroundColor: 'var(--primary-medium)', 
                                    color: 'white',
                                    borderRadius: '15px 15px 0 0'
                                }}>
                                    <h4 className="text-center mb-0">📝 Report a Problem</h4>
                                </Card.Header>                                <Card.Body className="p-4">
                                    {locationError && (
                                        <Alert variant="warning" className="mb-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <strong>📍 Location Access Required</strong>
                                                    <p className="mb-2 mt-1">{locationError}</p>
                                                </div>
                                                {locationPermission !== 'granted' && (
                                                    <Button 
                                                        variant="outline-warning" 
                                                        size="sm"
                                                        onClick={requestLocationPermission}
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        Enable Location
                                                    </Button>
                                                )}
                                            </div>
                                        </Alert>
                                    )}
                                    
                                    <Form onSubmit={handleSubmit}>                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                🏷️ Select Category
                                            </Form.Label>
                                            <Form.Select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                style={{ borderRadius: '10px' }}
                                            >
                                                <option value="Garbage Dump">🗑️ Garbage Dump</option>
                                                <option value="Street Light Repair">💡 Street Light Repair</option>
                                                <option value="Something else">🔧 Something else</option>
                                            </Form.Select>
                                        </Form.Group>

                                        {formData.category === 'Something else' && (
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold">
                                                    ✏️ Specify Category
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="customCategory"
                                                    value={formData.customCategory}
                                                    onChange={handleChange}
                                                    placeholder="Enter the category (e.g., Road Damage, Water Leak, etc.)"
                                                    required={formData.category === 'Something else'}
                                                    style={{ borderRadius: '10px' }}
                                                />
                                            </Form.Group>
                                        )}

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                📝 Description
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Describe the issue in detail... (e.g., location, severity, any safety concerns)"
                                                required
                                                style={{ borderRadius: '10px' }}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">
                                                📷 Upload a photo
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                id="image"
                                                accept=".jpg,.jpeg,.png"
                                                onChange={handleChange}
                                                required
                                                style={{ borderRadius: '10px' }}
                                            />
                                            <Form.Text className="text-muted">
                                                Accepted formats: JPG, JPEG, PNG (Max size: 5MB)
                                            </Form.Text>
                                        </Form.Group>                                        <Button 
                                            type="submit" 
                                            variant="success" 
                                            className="w-100 fw-semibold"
                                            disabled={loading || locationPermission === 'denied'}
                                            style={{ 
                                                borderRadius: '10px',
                                                padding: '12px',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Submitting...
                                                </>
                                            ) : locationPermission === 'denied' ? (
                                                <>🚫 Enable Location First</>
                                            ) : (
                                                <>🚀 Submit Issue</>
                                            )}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                              <div className="text-center mt-4">
                                <Alert variant="info" className="d-inline-block">
                                    <strong>💡 Tip:</strong> You'll earn 10 reward points when admin accepts and starts working on your issue!
                                </Alert>
                            </div>
                        </div>
                    </div>

                    {/* Issue History Section */}
                    <div className="row justify-content-center mt-5">
                        <div className="col-md-10">
                            <Card className="shadow-lg border-0">
                                <Card.Header style={{ 
                                    backgroundColor: 'var(--primary-medium)', 
                                    color: 'white',
                                    borderRadius: '15px 15px 0 0'
                                }}>
                                    <h4 className="text-center mb-0">📋 Your Issue History</h4>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    {issuesLoading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Loading your issues...</p>
                                        </div>
                                    ) : userIssues.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-muted mb-0">� No issues reported yet. Submit your first issue above!</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {userIssues.map((issue) => (
                                                <div key={issue._id} className="col-md-6 mb-3">
                                                    <Card className="h-100 border-0 shadow-sm">
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <h6 className="fw-bold text-primary mb-1">{issue.category}</h6>
                                                                <Badge 
                                                                    bg={
                                                                        issue.status === 'PENDING' ? 'warning' :
                                                                        issue.status === 'ACCEPTED' ? 'info' :
                                                                        issue.status === 'REJECTED' ? 'danger' :
                                                                        issue.status === 'IN_PROGRESS' ? 'primary' :
                                                                        'success'
                                                                    }
                                                                    className="text-white"
                                                                >
                                                                    {issue.status === 'PENDING' ? '⏳ Pending' :
                                                                     issue.status === 'ACCEPTED' ? '✅ Accepted' :
                                                                     issue.status === 'REJECTED' ? '❌ Rejected' :
                                                                     issue.status === 'IN_PROGRESS' ? '🔄 In Progress' :
                                                                     '✅ Resolved'}
                                                                </Badge>
                                                            </div>                                                            <p className="text-muted small mb-2">
                                                                {issue.description.length > 100 
                                                                    ? `${issue.description.substring(0, 100)}...` 
                                                                    : issue.description}
                                                            </p>
                                                            {issue.imageUrl && (
                                                                <div className="mb-3">                                                                    <img 
                                                                        src={issue.imageUrl} 
                                                                        alt="Issue" 
                                                                        className="img-fluid rounded issue-image" 
                                                                        style={{ 
                                                                            maxHeight: '150px', 
                                                                            width: '100%', 
                                                                            objectFit: 'cover',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        onClick={() => window.open(issue.imageUrl, '_blank')}
                                                                        title="Click to view full size"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">
                                                                    📅 {new Date(issue.createdAt).toLocaleDateString()}
                                                                </small>
                                                                {issue.status === 'IN_PROGRESS' && (
                                                                    <small className="text-success fw-bold">
                                                                        +10 pts earned!
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default UserDashboard;
