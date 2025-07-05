import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

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
    }, [issues]);

    const loadIssues = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/issues/admin/map`);
            setIssues(response.data);
        } catch (error) {
            console.error('Error loading issues:', error);
        }
    };

    const initializeMap = async () => {
        // Load Geoapify script dynamically
        if (!window.geoapify) {
            const script = document.createElement('script');
            script.src = `https://maps.geoapify.com/v1/sdk/maps.js?apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`;
            script.onload = () => createMap();
            document.head.appendChild(script);
        } else {
            createMap();
        }
    };

    const createMap = () => {
        if (!window.geoapify || !mapRef.current) return;

        // Initialize map
        const map = new window.geoapify.Map({
            center: [77.02, 28.65], // Delhi coordinates
            zoom: 5,
            style: 'https://maps.geoapify.com/v1/styles/osm-bright/style.json',
            apiKey: process.env.REACT_APP_GEOAPIFY_API_KEY
        });

        map.on('load', () => {
            // Add markers for each issue
            issues.forEach(issue => {
                const marker = new window.geoapify.Marker({
                    color: getMarkerColor(issue.status)
                })
                .setLngLat([parseFloat(issue.longitude), parseFloat(issue.latitude)])
                .addTo(map);

                // Add popup
                const popup = new window.geoapify.Popup({
                    offset: 25
                })
                .setHTML(`
                    <div>
                        <h6>${issue.category}</h6>
                        <p>Status: ${issue.status}</p>
                        <button onclick="window.viewIssueDetails('${issue._id}')" class="btn btn-sm btn-primary">
                            View Details
                        </button>
                    </div>
                `);

                marker.setPopup(popup);
            });
        });

        // Mount map to container
        map.getContainer().style.height = '70vh';
        mapRef.current.appendChild(map.getContainer());
        mapInstanceRef.current = map;

        // Global function for popup button
        window.viewIssueDetails = (issueId) => {
            navigate(`/issue/${issueId}`);
        };
    };

    const getMarkerColor = (status) => {
        switch (status) {
            case 'PENDING': return '#dc3545'; // Red
            case 'IN_PROGRESS': return '#ffc107'; // Yellow
            case 'RESOLVED': return '#28a745'; // Green
            default: return '#6c757d'; // Gray
        }
    };

    return (
        <>
            <Navigation />
            <Container fluid className="py-4">
                <h3 className="text-center mb-4">Welcome back, {user?.firstName} {user?.lastName}</h3>
                
                <div className="mb-3">
                    <p className="mb-0">Click on a marker to see the details:</p>
                    <div className="d-flex gap-3 mt-2">
                        <span><span style={{color: '#dc3545'}}>●</span> Pending</span>
                        <span><span style={{color: '#ffc107'}}>●</span> In Progress</span>
                        <span><span style={{color: '#28a745'}}>●</span> Resolved</span>
                    </div>
                </div>
                
                <div 
                    ref={mapRef} 
                    className="map-container border rounded"
                    style={{ height: '70vh', width: '100%' }}
                >
                    {!window.geoapify && (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading map...</span>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </>
    );
};

export default AdminDashboard;
