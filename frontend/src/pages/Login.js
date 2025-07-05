import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isAdmin ? '/admin' : '/dashboard');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            // Navigation will be handled by useEffect
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');

        const result = await login('guest@sustainhub.com', 'Guestuser321@G');
        
        if (result.success) {
            // Navigation will be handled by useEffect
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                    <Card style={{ width: '450px' }} className="shadow-lg border-0">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 style={{ color: 'var(--primary-dark)' }}>🔐 Welcome Back</h2>
                                <p className="text-muted">Sign in to your SustainHub account</p>
                            </div>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">📧 Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        required
                                        style={{ borderRadius: '10px', padding: '12px' }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">🔒 Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                        style={{ borderRadius: '10px', padding: '12px' }}
                                    />
                                </Form.Group>
                                <Button 
                                    variant="primary" 
                                    type="submit" 
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
                                            Signing in...
                                        </>
                                    ) : (
                                        '🚀 Sign In'
                                    )}                                </Button>
                            </Form>
                            
                            <div className="text-center mt-3">
                                <div className="d-flex align-items-center mb-3">
                                    <hr className="flex-grow-1" />
                                    <span className="px-3 text-muted small">OR</span>
                                    <hr className="flex-grow-1" />
                                </div>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={handleGuestLogin}
                                    className="w-100 fw-semibold"
                                    disabled={loading}
                                    style={{ 
                                        borderRadius: '10px',
                                        padding: '12px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Signing in...
                                        </>
                                    ) : (
                                        '👤 Login with Guest Credentials'
                                    )}
                                </Button>
                            </div>
                            
                            <div className="text-center mt-4">
                                <span className="text-muted">Don't have an account? </span>
                                <Link to="/signup" style={{ color: 'var(--primary-dark)', fontWeight: '600' }}>
                                    Create one here
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        </>
    );
};

export default Login;
