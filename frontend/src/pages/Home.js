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
                <Container>                    <div className="text-box">
                        <p className="tagline">🌍 Spot it. Report it. Sustain it.</p>
                        <p>Join the SustainHub movement and help build better communities through citizen engagement</p>
                        <div className="d-flex gap-3 justify-content-center">
                            <Link to="/login" className="btn btn-outline-primary">
                                🔐 Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary">
                                🚀 Get Started
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>            <Container className="my-5">
                <div className="about-us" id="about-us">
                    <div className="text-center mb-5">
                        <h2><b>🌱 About SustainHub</b></h2>
                        <p className="lead">
                            SustainHub empowers citizens to report and track public facility issues in their community 
                            while earning reward points. Our intuitive platform makes it easy to submit detailed reports 
                            with photos and GPS locations, helping local authorities address problems efficiently.
                        </p>
                    </div>
                    
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
                            </div>                        </div>                    </div>
                </div>
            </Container>

            {/* Statistics Section */}
            <section className="py-5" style={{ backgroundColor: 'var(--primary-lightest)' }}>
                <Container>
                    <div className="text-center mb-5">
                        <h2><b>📊 Making a Real Impact</b></h2>
                        <p className="lead text-muted">See how our community is driving positive change</p>
                    </div>
                    <div className="row text-center">
                        <div className="col-md-3 mb-4">
                            <div className="stat-card p-4">
                                <h3 className="display-4 fw-bold text-primary">500+</h3>
                                <p className="text-muted">Issues Reported</p>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="stat-card p-4">
                                <h3 className="display-4 fw-bold text-success">350+</h3>
                                <p className="text-muted">Issues Resolved</p>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="stat-card p-4">
                                <h3 className="display-4 fw-bold text-info">1200+</h3>
                                <p className="text-muted">Active Citizens</p>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="stat-card p-4">
                                <h3 className="display-4 fw-bold text-warning">50+</h3>
                                <p className="text-muted">Communities</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* How It Works Section */}
            <Container className="my-5">
                <div className="text-center mb-5">
                    <h2><b>🔄 How SustainHub Works</b></h2>
                    <p className="lead">Simple steps to make a difference in your community</p>
                </div>
                <div className="row">                    <div className="col-md-3 mb-4 text-center">                        <div className="step-card p-4">
                            <div className="step-number mb-3 d-flex justify-content-center">
                                <span className="d-flex align-items-center justify-content-center text-white fw-bold" style={{width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', backgroundColor: '#819067'}}>1</span>
                            </div>
                            <h5>📱 Sign Up</h5>
                            <p className="text-muted">Create your free account and join our community of change-makers</p>
                        </div>
                    </div>
                    <div className="col-md-3 mb-4 text-center">
                        <div className="step-card p-4">
                            <div className="step-number mb-3 d-flex justify-content-center">
                                <span className="d-flex align-items-center justify-content-center text-white fw-bold" style={{width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', backgroundColor: '#819067'}}>2</span>
                            </div>
                            <h5>📸 Report Issues</h5>
                            <p className="text-muted">Take photos and report public issues with precise GPS locations</p>
                        </div>
                    </div>
                    <div className="col-md-3 mb-4 text-center">
                        <div className="step-card p-4">
                            <div className="step-number mb-3 d-flex justify-content-center">
                                <span className="d-flex align-items-center justify-content-center text-white fw-bold" style={{width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', backgroundColor: '#819067'}}>3</span>
                            </div>
                            <h5>✅ Get Verified</h5>
                            <p className="text-muted">Our admin team reviews and verifies your submitted reports</p>
                        </div>
                    </div>
                    <div className="col-md-3 mb-4 text-center">
                        <div className="step-card p-4">
                            <div className="step-number mb-3 d-flex justify-content-center">
                                <span className="d-flex align-items-center justify-content-center text-white fw-bold" style={{width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', backgroundColor: '#819067'}}>4</span>
                            </div>
                            <h5>🏆 Earn Rewards</h5>
                            <p className="text-muted">Collect points for verified reports and climb the leaderboard</p>
                        </div>
                    </div>
                </div>
            </Container>            {/* Features Section */}
            <section className="py-5" style={{ backgroundColor: '#fefae0' }}>
                <Container>
                    <div className="text-center mb-5">
                        <h2><b>✨ Why Choose SustainHub?</b></h2>
                        <p className="lead">Powerful features designed for effective community engagement</p>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="feature-detail p-4">
                                <h5>🗺️ Interactive Map View</h5>
                                <p>Visualize all reported issues on an interactive map. See problem hotspots and track resolution progress in real-time across your community.</p>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="feature-detail p-4">
                                <h5>📊 Real-time Dashboard</h5>
                                <p>Monitor your contributions with a comprehensive dashboard showing your reports, points earned, and community impact statistics.</p>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="feature-detail p-4">
                                <h5>🏅 Gamified Experience</h5>
                                <p>Stay motivated with our point system and leaderboards. Compete with fellow citizens and become a top contributor in your area.</p>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="feature-detail p-4">
                                <h5>🔒 Secure & Private</h5>
                                <p>Your data is protected with enterprise-grade security. We prioritize your privacy while facilitating transparent community engagement.</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Testimonials Section */}
            <Container className="my-5">
                <div className="text-center mb-5">
                    <h2><b>💬 What Our Community Says</b></h2>
                    <p className="lead">Real stories from citizens making a difference</p>
                </div>
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="testimonial-card p-4 border rounded">
                            <div className="mb-3">
                                <span className="text-warning">⭐⭐⭐⭐⭐</span>
                            </div>
                            <p className="fst-italic">"SustainHub helped me report a broken streetlight that was fixed within a week. The process was so simple and rewarding!"</p>
                            <div className="d-flex align-items-center">
                                <div className="avatar me-3 bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: '40px', height: '40px'}}>
                                    A
                                </div>
                                <div>
                                    <strong>User 1</strong>
                                    <div className="text-muted small">Delhi Resident</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="testimonial-card p-4 border rounded">
                            <div className="mb-3">
                                <span className="text-warning">⭐⭐⭐⭐⭐</span>
                            </div>
                            <p className="fst-italic">"I've earned over 150 points reporting various issues in my neighborhood. It's amazing to see the positive impact!"</p>
                            <div className="d-flex align-items-center">
                                <div className="avatar me-3 bg-success rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: '40px', height: '40px'}}>
                                    R
                                </div>
                                <div>
                                    <strong>User 2</strong>
                                    <div className="text-muted small">Mumbai Resident</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="testimonial-card p-4 border rounded">
                            <div className="mb-3">
                                <span className="text-warning">⭐⭐⭐⭐⭐</span>
                            </div>
                            <p className="fst-italic">"Finally, a platform that makes civic engagement easy and fun. Our community is cleaner and safer thanks to SustainHub."</p>
                            <div className="d-flex align-items-center">
                                <div className="avatar me-3 bg-info rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: '40px', height: '40px'}}>
                                    P
                                </div>
                                <div>
                                    <strong>User 3</strong>
                                    <div className="text-muted small">Bangalore Resident</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            <footer className="footer" id="contact">
                <Container className="text-center">                    <div className="d-flex justify-content-center align-items-center">
                        <span className="me-3"><strong>🌱 SustainHub</strong></span>
                        <span className="me-3 text-muted small">Copyright © {new Date().getFullYear()} SustainHub. All rights reserved.</span>
                        <a href="https://github.com/kushal7201/SustainHub" className="me-2" target="_blank" rel="noopener noreferrer">
                            <img src="/github.png" alt="GitHub" style={{ width: '25px', height: '25px', opacity: 0.8 }} />
                        </a>
                        <a href="mailto:sustainhub.devins@gmail.com">
                            <img src="/gmail.png" alt="Email" style={{ width: '30px', height: '30px', opacity: 0.8 }} />
                        </a>
                    </div>
                </Container>
            </footer>
        </>
    );
};

export default Home;
