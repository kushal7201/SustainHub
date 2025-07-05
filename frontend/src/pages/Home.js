import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const Home = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, isAdmin, navigate]);

    return (
        <>
            <Navigation />
            <section id="section">
                <Container>
                    <div className="text-box">
                        <p className="tagline">Spot it. Report it. Sustain it.</p>
                        <p>Join the Sustain Hub movement today!</p>
                        <Link to="/signup">Get Started</Link>
                    </div>
                </Container>
            </section>

            <div className="about-us" id="about-us">
                <h2><b>About Us</b></h2>
                <p>
                    Sustain Hub is a web platform designed to empower citizens to report and
                    track public facility issues within their local community and get reward
                    points. By providing an intuitive interface, Sustain Hub makes it easy
                    for users to pinpoint problems and submit detailed reports, including
                    photos, which can be accessed and addressed by local authorities.
                </p>
            </div>

            <footer className="footer mt-auto py-3 bg-light" id="contact">
                <Container className="text-center">
                    <p>
                        <span className="fw-bold">SustainHub</span>
                        <span className="text-muted"> Copyright © 2025 | All rights reserved</span>
                        <span className="ms-3">
                            <a href="https://github.com/kushal7201/Sustain_Hub_GSC" className="me-2">
                                <img src="/github.png" alt="GitHub" style={{ width: '24px', height: '24px' }} />
                            </a>
                            <a href="mailto:321kushalbansal.kb@gmail.com">
                                <img src="/gmail.png" alt="Email" style={{ width: '24px', height: '24px' }} />
                            </a>
                        </span>
                    </p>
                </Container>
            </footer>
        </>
    );
};

export default Home;
