import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import API_CONFIG from '../config/api';

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);useEffect(() => {
        loadIssueDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);    const loadIssueDetails = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.REACT_APP_API_BASE_URL}/issues/${id}`);
            setIssue(response.data);
        } catch (error) {
            console.error('Error loading issue details:', error);
            toast.error('Error loading issue details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };    const updateStatus = async (status) => {
        if (!isAdmin) return;

        setUpdating(true);
        try {
            const response = await axios.put(
                `${API_CONFIG.REACT_APP_API_BASE_URL}/issues/${id}/status`,
                { status }
            );
            setIssue(response.data);
            
            let message = 'Status updated successfully!';
            if (issue.status === 'PENDING' && status === 'ACCEPTED') {
                message += ' User has been awarded 10 reward points.';
            }
            
            toast.success(message);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Error updating status');
        } finally {
            setUpdating(false);
        }
    };

    // Get available actions based on current status
    const getAvailableActions = (currentStatus) => {
        switch (currentStatus) {
            case 'PENDING':
                return [
                    { status: 'ACCEPTED', label: '✅ Accept', variant: 'success' },
                    { status: 'REJECTED', label: '❌ Reject', variant: 'danger' }
                ];
            case 'ACCEPTED':
                return [
                    { status: 'IN_PROGRESS', label: '🔄 Mark In Progress', variant: 'warning' }
                ];
            case 'IN_PROGRESS':
                return [
                    { status: 'RESOLVED', label: '✅ Mark Resolved', variant: 'success' }
                ];
            case 'REJECTED':
            case 'RESOLVED':
            default:
                return []; // No actions available for final states
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'danger';
            case 'ACCEPTED': return 'info';
            case 'REJECTED': return 'secondary';
            case 'IN_PROGRESS': return 'warning';
            case 'RESOLVED': return 'success';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Navigation />
                <Container className="py-4">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </Container>
            </>
        );
    }

    if (!issue) {
        return (
            <>
                <Navigation />
                <Container className="py-4">
                    <Alert variant="danger">Issue not found</Alert>
                </Container>
            </>
        );
    }    return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container className="py-4">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <Card className="shadow-lg border-0">
                                <Card.Header style={{ 
                                    backgroundColor: 'var(--primary-medium)', 
                                    color: 'white',
                                    borderRadius: '15px 15px 0 0'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h3 className="mb-0">📋 Issue Details</h3>
                                        <Badge bg={getStatusVariant(issue.status)} className="fs-6">
                                            {issue.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-4">
                                                <h5 style={{ color: 'var(--primary-dark)' }}>🏷️ Category</h5>
                                                <p className="text-muted">{issue.category}</p>
                                            </div>

                                            <div className="mb-4">
                                                <h5 style={{ color: 'var(--primary-dark)' }}>📝 Description</h5>
                                                <p className="text-muted">{issue.description}</p>
                                            </div>

                                            <div className="mb-4">
                                                <h5 style={{ color: 'var(--primary-dark)' }}>📍 Location</h5>
                                                <p className="text-muted">
                                                    <strong>Latitude:</strong> {issue.latitude}<br />
                                                    <strong>Longitude:</strong> {issue.longitude}
                                                </p>
                                            </div>

                                            <div className="mb-4">
                                                <h5 style={{ color: 'var(--primary-dark)' }}>👤 Reported By</h5>
                                                <div className="p-3 rounded" style={{ backgroundColor: 'var(--primary-lightest)' }}>
                                                    <p className="mb-1"><strong>{issue.userId.firstName} {issue.userId.lastName}</strong></p>
                                                    <p className="mb-1 text-muted">{issue.userId.email}</p>
                                                    {issue.userId.phone && <p className="mb-0 text-muted">📱 {issue.userId.phone}</p>}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h5 style={{ color: 'var(--primary-dark)' }}>📅 Reported On</h5>
                                                <p className="text-muted">{formatDate(issue.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="mb-4">
                                                <h5 style={{ color: 'var(--primary-dark)' }}>📷 Issue Photo</h5>
                                                <img 
                                                    src={issue.imageUrl} 
                                                    alt="Issue" 
                                                    className="img-fluid rounded shadow-sm"
                                                    style={{ 
                                                        maxHeight: '400px', 
                                                        objectFit: 'cover',
                                                        width: '100%',
                                                        border: '3px solid var(--primary-light)'
                                                    }}
                                                />
                                            </div>                                            {isAdmin && (
                                                <div className="mt-4">
                                                    <h5 style={{ color: 'var(--primary-dark)' }}>⚙️ Update Status</h5>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        {getAvailableActions(issue.status).length === 0 ? (
                                                            <div className="alert alert-info">
                                                                <small>
                                                                    {issue.status === 'REJECTED' ? 
                                                                        '❌ This issue has been rejected and cannot be modified.' :
                                                                        '✅ This issue has been resolved and cannot be modified.'
                                                                    }
                                                                </small>
                                                            </div>
                                                        ) : (
                                                            getAvailableActions(issue.status).map((action) => (
                                                                <Button 
                                                                    key={action.status}
                                                                    variant={action.variant}
                                                                    onClick={() => updateStatus(action.status)}
                                                                    disabled={updating}
                                                                    style={{ borderRadius: '10px' }}
                                                                >
                                                                    {updating ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                            Updating...
                                                                        </>
                                                                    ) : (
                                                                        action.label
                                                                    )}
                                                                </Button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center mt-4">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                                            style={{ 
                                                borderRadius: '20px',
                                                padding: '10px 25px'
                                            }}
                                        >
                                            ← Back to Dashboard
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default IssueDetails;
