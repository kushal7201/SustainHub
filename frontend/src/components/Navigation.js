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
                <Navbar.Toggle 
                    aria-controls="basic-navbar-nav"
                />
                <Navbar.Collapse id="basic-navbar-nav" className="dropdown-menu-custom">
                    <Nav className="ms-auto">
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
                            <>                                <Nav.Link as={Link} to={isAdmin ? "/admin" : "/dashboard"} className="px-2">
                                    <svg width="20" height="20" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                                    </svg>
                                    Dashboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/leaderboard" className="px-2">
                                    <svg width="20" height="20" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                        <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.792l4.79 4.792A7 7 0 0 0 7.5 1.018zm1.524.481a5.987 5.987 0 0 1 3.206 8.15l-2.681-2.681 1.017-1.017a.5.5 0 1 0-.707-.707L8.842 6.261 7.825 5.244a.5.5 0 1 0-.707.707l1.017 1.017L5.454 9.649A5.987 5.987 0 0 1 8.976 1.5h.048z"/>
                                        <path d="M2.21 13.061a7 7 0 0 0 3.71 1.928l2.581-2.581L2.21 13.061zM13.79 13.061L7.498 6.77l2.581-2.581a7 7 0 0 0-3.71-1.928L13.79 13.061z"/>
                                    </svg>
                                    Leaderboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/profile" className="px-2">
                                    <svg width="20" height="20" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                    </svg>
                                    Profile
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
