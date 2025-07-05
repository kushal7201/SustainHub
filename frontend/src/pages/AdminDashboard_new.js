import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import API_CONFIG from '../config/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadIssues();
    }, []);

    useEffect(() => {
        if (issues.length > 0 && !mapInstanceRef.current) {
            initializeMap();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [issues]);

    const loadIssues = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.REACT_APP_API_BASE_URL}/issues/admin/map`);
            setIssues(response.data);
        } catch (error) {
            console.error('Error loading issues:', error);
        }
    };

    const createMap = useCallback(() => {
        try {
            if (!window.L || !mapRef.current) return;

            // Clear existing map instance
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            // Initialize Leaflet map
            const map = window.L.map(mapRef.current, {
                preferCanvas: true
            }).setView([28.65, 77.02], 5);

            // Add Geoapify tile layer
            window.L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
                maxZoom: 20,
                id: 'osm-bright',
            }).addTo(map);

            // Wait for map to initialize before adding markers
            setTimeout(() => {
                try {
                    // Add markers for each issue
                    issues.forEach(issue => {
                        if (issue.latitude && issue.longitude) {
                            const marker = window.L.marker([parseFloat(issue.latitude), parseFloat(issue.longitude)], {
                                icon: window.L.divIcon({
                                    className: 'custom-marker',
                                    html: `<div style="background-color: ${getMarkerColor(issue.status)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })
                            }).addTo(map);

                            // Add popup
                            marker.bindPopup(`
                                <div style="min-width: 200px;">
                                    <h6 style="margin-bottom: 8px; color: #333;">${issue.category}</h6>
                                    <p style="margin-bottom: 8px; color: #666;">Status: <strong>${issue.status}</strong></p>
                                    <button onclick="window.viewIssueDetails('${issue._id}')" 
                                            style="background-color: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                        View Details
                                    </button>
                                </div>
                            `);
                        }
                    });

                    // Force map resize
                    map.invalidateSize();
                } catch (error) {
                    console.error('Error adding markers:', error);
                }
            }, 100);

            mapInstanceRef.current = map;

            // Global function for popup button
            window.viewIssueDetails = (issueId) => {
                navigate(`/issue/${issueId}`);
            };
        } catch (error) {
            console.error('Error creating map:', error);
        }
    }, [issues, navigate]);

    const initializeMap = useCallback(async () => {
        try {
            // Load Leaflet CSS and JS
            if (!window.L) {
                // Load Leaflet CSS
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(linkElement);

                // Load Leaflet JS
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => {
                    setTimeout(createMap, 100);
                };
                script.onerror = () => {
                    console.error('Failed to load Leaflet');
                };
                document.head.appendChild(script);
            } else {
                createMap();
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }, [createMap]);

    const getMarkerColor = (status) => {
        switch (status) {
            case 'PENDING': return '#dc3545'; // Red
            case 'ACCEPTED': return '#17a2b8'; // Info/Cyan
            case 'REJECTED': return '#6c757d'; // Gray
            case 'IN_PROGRESS': return '#ffc107'; // Yellow
            case 'RESOLVED': return '#28a745'; // Green
            default: return '#6c757d'; // Gray
        }
    };

    return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container fluid className="py-4">
                    <div className="text-center mb-4">
                        <h3 style={{ color: 'var(--primary-dark)' }}>
                            👨‍💼 Admin Dashboard - Welcome back, {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-muted">Monitor and manage community issues</p>
                    </div>
                    
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0" style={{ color: 'var(--primary-dark)' }}>
                                    📍 Issue Locations Map
                                </h5>
                                <div className="d-flex gap-3">
                                    <span><span style={{color: '#dc3545', fontSize: '1.2rem'}}>●</span> Pending</span>
                                    <span><span style={{color: '#17a2b8', fontSize: '1.2rem'}}>●</span> Accepted</span>
                                    <span><span style={{color: '#6c757d', fontSize: '1.2rem'}}>●</span> Rejected</span>
                                    <span><span style={{color: '#ffc107', fontSize: '1.2rem'}}>●</span> In Progress</span>
                                    <span><span style={{color: '#28a745', fontSize: '1.2rem'}}>●</span> Resolved</span>
                                </div>
                            </div>
                            <p className="text-muted mb-3">Click on any marker to view detailed information about the issue</p>
                        </Card.Body>
                    </Card>
                    
                    <div 
                        ref={mapRef} 
                        className="map-container border-0 shadow-lg"
                        style={{ 
                            height: '70vh', 
                            width: '100%',
                            minHeight: '500px',
                            borderRadius: '15px',
                            overflow: 'hidden'
                        }}
                    >
                        {!window.L && (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ backgroundColor: 'var(--white)' }}>
                                <div className="spinner-border mb-3" style={{ color: 'var(--primary-medium)' }} role="status">
                                    <span className="visually-hidden">Loading map...</span>
                                </div>
                                <p className="text-muted">Loading interactive map...</p>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </>
    );
};

export default AdminDashboard;
