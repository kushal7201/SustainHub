import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };    return (
        <Navbar expand="lg" className="navbar shadow-sm">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
                    🌱 SustainHub
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">                    <Nav className="ms-auto align-items-center">
                        {!isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/" className="px-2">Home</Nav.Link>
                                <Nav.Link href="#about-us" className="px-2">About us</Nav.Link>
                                <Nav.Link href="#contact" className="px-2">Contact us</Nav.Link>
                                <Button 
                                    as={Link} 
                                    to="/login" 
                                    variant="outline-light" 
                                    className="ms-2"
                                    style={{ 
                                        borderRadius: '20px',
                                        padding: '6px 16px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Login
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to={isAdmin ? "/admin" : "/dashboard"} className="px-2">
                                    📊 Dashboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/profile" className="px-2">
                                    👤 Profile
                                </Nav.Link>
                                <Button 
                                    variant="outline-light" 
                                    onClick={handleLogout} 
                                    className="ms-2"
                                    style={{ 
                                        borderRadius: '20px',
                                        padding: '6px 16px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
