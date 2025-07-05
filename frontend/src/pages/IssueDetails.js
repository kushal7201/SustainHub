import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        loadIssueDetails();
    }, [id]);

    const loadIssueDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/issues/${id}`);
            setIssue(response.data);
            setNewStatus(response.data.status);
        } catch (error) {
            console.error('Error loading issue details:', error);
            toast.error('Error loading issue details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async () => {
        if (!isAdmin || newStatus === issue.status) return;

        setUpdating(true);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/issues/${id}/status`,
                { status: newStatus }
            );
            setIssue(response.data);
            toast.success('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'danger';
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
    }

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <Card>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <h3>Issue Details</h3>
                                    <Badge bg={getStatusVariant(issue.status)} className="fs-6">
                                        {issue.status.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <h5>Category</h5>
                                        <p className="text-muted">{issue.category}</p>

                                        <h5>Description</h5>
                                        <p className="text-muted">{issue.description}</p>

                                        <h5>Location</h5>
                                        <p className="text-muted">
                                            Latitude: {issue.latitude}<br />
                                            Longitude: {issue.longitude}
                                        </p>

                                        <h5>Reported By</h5>
                                        <p className="text-muted">
                                            {issue.userId.firstName} {issue.userId.lastName}<br />
                                            {issue.userId.email}
                                            {issue.userId.phone && <><br />Phone: {issue.userId.phone}</>}
                                        </p>

                                        <h5>Reported On</h5>
                                        <p className="text-muted">{formatDate(issue.createdAt)}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <h5>Issue Photo</h5>
                                        <img 
                                            src={issue.imageUrl} 
                                            alt="Issue" 
                                            className="img-fluid rounded mb-3"
                                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                                        />

                                        {isAdmin && (
                                            <div className="mt-4">
                                                <h5>Update Status</h5>
                                                <div className="d-flex gap-2">
                                                    <Form.Select 
                                                        value={newStatus} 
                                                        onChange={(e) => setNewStatus(e.target.value)}
                                                        style={{ width: 'auto' }}
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="RESOLVED">Resolved</option>
                                                    </Form.Select>
                                                    <Button 
                                                        variant="primary" 
                                                        onClick={updateStatus}
                                                        disabled={updating || newStatus === issue.status}
                                                    >
                                                        {updating ? 'Updating...' : 'Update'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                                    >
                                        Back to Dashboard
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default IssueDetails;
