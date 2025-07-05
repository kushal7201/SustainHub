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
            <Navigation />            <section id="section">
                <Container>
                    <div className="text-box">
                        <p className="tagline">🌍 Spot it. Report it. Sustain it.</p>
                        <p>Join the SustainHub movement and help build better communities through citizen engagement</p>
                        <Link to="/signup">🚀 Get Started</Link>
                    </div>
                </Container>
            </section>

            <Container className="my-5">
                <div className="about-us" id="about-us">
                    <h2><b>🌱 About SustainHub</b></h2>
                    <p className="lead">
                        SustainHub empowers citizens to report and track public facility issues in their community 
                        while earning reward points. Our intuitive platform makes it easy to submit detailed reports 
                        with photos and GPS locations, helping local authorities address problems efficiently.
                    </p>
                    
                    <div className="row mt-5">
                        <div className="col-md-4 mb-4">
                            <div className="feature-card">
                                <h4>📍 Report Issues</h4>
                                <p>Easily report public issues with photos and precise GPS location tagging</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="feature-card">
                                <h4>🏆 Earn Rewards</h4>
                                <p>Get reward points for every verified issue you report to the community</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="feature-card">
                                <h4>👥 Build Community</h4>
                                <p>Work together to create sustainable and livable communities for everyone</p>
                            </div>
                        </div>                    </div>
                </div>
            </Container>            <footer className="footer" id="contact">
                <Container className="text-center">
                    <div className="d-flex justify-content-center align-items-center">
                        <span className="me-3"><strong>🌱 SustainHub</strong></span>
                        <span className="me-3 text-muted small">Copyright © 2025 SustainHub. All rights reserved.</span>
                        <a href="https://github.com/kushal7201/Sustain_Hub_GSC" className="me-2" target="_blank" rel="noopener noreferrer">
                            <img src="/github.png" alt="GitHub" style={{ width: '25px', height: '25px', opacity: 0.8 }} />
                        </a>
                        <a href="mailto:321kushalbansal.kb@gmail.com">
                            <img src="/gmail.png" alt="Email" style={{ width: '30px', height: '30px', opacity: 0.8 }} />
                        </a>
                    </div>
                </Container>
            </footer>
        </>
    );
};

export default Home;
