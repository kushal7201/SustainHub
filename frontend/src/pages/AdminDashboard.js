import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Card, Row, Col, Form, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import API_CONFIG from '../config/api';

// Helper functions for map clustering
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

// Group issues by location with zoom-level based tolerance
const groupIssuesByLocation = (issues, zoomLevel = 5) => {
    const groups = [];
    // Dynamic tolerance based on zoom level - more tolerance when zoomed out
    const baseTolerance = 0.0001; // ~11 meters at zoom 18
    const tolerance = baseTolerance * Math.pow(2, (18 - zoomLevel)); // Exponential scaling
    
    issues.forEach(issue => {
        if (!issue.latitude || !issue.longitude) return;
        const lat = parseFloat(issue.latitude);
        const lng = parseFloat(issue.longitude);
        // Find existing group within tolerance
        const existingGroup = groups.find(group => {
            const latDiff = Math.abs(group.lat - lat);
            const lngDiff = Math.abs(group.lng - lng);
            return latDiff <= tolerance && lngDiff <= tolerance;
        });
        if (existingGroup) {
            existingGroup.issues.push(issue);
        } else {
            groups.push({ lat, lng, issues: [issue] });
        }
    });
    return groups;
};

const getStatusCounts = (issues) => {
    return issues.reduce((counts, issue) => {
        counts[issue.status] = (counts[issue.status] || 0) + 1;
        return counts;
    }, {});
};

const getPrimaryStatus = (statusCounts) => {
    const priorityOrder = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'REJECTED', 'RESOLVED'];
    for (const status of priorityOrder) {
        if (statusCounts[status] > 0) {
            return status;
        }
    }
    return 'PENDING';
};

const formatDateHelper = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const createClusterPopupContent = (issues) => {
    const statusCounts = getStatusCounts(issues);
    return `
        <div style="min-width: 300px; max-height: 350px; overflow-y: auto;">
            <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                <h6 style="margin: 0; color: #333; font-weight: bold;">
                    📍 ${issues.length} Issues at this Location
                </h6>
                <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
                    ${Object.entries(statusCounts).map(([status, count]) => 
                        `<span style="
                            background-color: ${getMarkerColor(status)}; 
                            color: white; 
                            padding: 2px 6px; 
                            border-radius: 10px; 
                            font-size: 10px; 
                            font-weight: bold;">
                            ${status}: ${count}
                        </span>`
                    ).join('')}
                </div>
            </div>
            <div style="max-height: 250px; overflow-y: auto;">
                ${issues.map((issue, index) => `
                    <div style="
                        margin-bottom: 10px; 
                        padding: 8px; 
                        border: 1px solid #e0e0e0; 
                        border-radius: 6px;
                        background-color: #f9f9f9;">
                        <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 4px;">
                            <h6 style="margin: 0; color: #333; font-size: 13px; flex-grow: 1;">
                                ${issue.category}
                            </h6>
                            <span style="
                                background-color: ${getMarkerColor(issue.status)}; 
                                color: white; 
                                padding: 1px 5px; 
                                border-radius: 8px; 
                                font-size: 9px; 
                                font-weight: bold;
                                margin-left: 8px;">
                                ${issue.status}
                            </span>
                        </div>
                        <p style="margin: 4px 0; color: #666; font-size: 11px;">
                            By: ${issue.userId?.firstName || 'Unknown'} ${issue.userId?.lastName || 'User'}
                        </p>
                        <p style="margin: 4px 0; color: #666; font-size: 11px;">
                            ${formatDateHelper(issue.createdAt)}
                        </p>
                        ${issue.description ? `
                            <p style="margin: 4px 0; color: #555; font-size: 11px; 
                               max-height: 30px; overflow: hidden; text-overflow: ellipsis;">
                                ${issue.description.length > 80 ? issue.description.substring(0, 80) + '...' : issue.description}
                            </p>
                        ` : ''}
                        <button onclick="window.viewIssueDetails('${issue._id}')" 
                                style="
                                    background-color: #007bff; 
                                    color: white; 
                                    border: none; 
                                    padding: 3px 8px; 
                                    border-radius: 4px; 
                                    cursor: pointer; 
                                    font-size: 10px;
                                    margin-top: 4px;">
                            View Details
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const AdminDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [sortBy, setSortBy] = useState('latest');
    const [selectedIssue, setSelectedIssue] = useState(null);
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
    }, [issues]);    const loadIssues = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.REACT_APP_API_BASE_URL}/issues/admin/map`);
            setIssues(response.data);
        } catch (error) {
            console.error('Error loading issues:', error);
        }
    };    const getSortedIssues = () => {
        const sortedIssues = [...issues];
        
        switch (sortBy) {
            case 'latest':
                return sortedIssues.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
            case 'oldest':
                return sortedIssues.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateA - dateB;
                });
            case 'pending':
                return sortedIssues.filter(issue => issue.status === 'PENDING');
            case 'accepted':
                return sortedIssues.filter(issue => issue.status === 'ACCEPTED');
            case 'in_progress':
                return sortedIssues.filter(issue => issue.status === 'IN_PROGRESS');
            case 'resolved':
                return sortedIssues.filter(issue => issue.status === 'RESOLVED');
            case 'rejected':
                return sortedIssues.filter(issue => issue.status === 'REJECTED');
            default:
                return sortedIssues;
        }
    };

    const handleIssueClick = (issue) => {
        setSelectedIssue(issue);
        if (mapInstanceRef.current && issue.latitude && issue.longitude) {
            mapInstanceRef.current.setView([parseFloat(issue.latitude), parseFloat(issue.longitude)], 15);
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'danger';
            case 'ACCEPTED': return 'info';
            case 'REJECTED': return 'secondary';
            case 'IN_PROGRESS': return 'warning';
            case 'RESOLVED': return 'success';
            default: return 'secondary';
        }
    };    const formatDate = (dateString) => {
        return formatDateHelper(dateString);
    };const createMap = useCallback(() => {
        try {
            if (!window.L || !mapRef.current) return;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
            const map = window.L.map(mapRef.current, {
                preferCanvas: true
            }).setView([28.65, 77.02], 5);
            window.L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
                maxZoom: 20,
                id: 'osm-bright',
            }).addTo(map);

            // Function to add markers based on current zoom level
            const addMarkers = () => {
                // Clear existing markers
                map.eachLayer((layer) => {
                    if (layer instanceof window.L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                const currentZoom = map.getZoom();
                const locationGroups = groupIssuesByLocation(issues, currentZoom);
                
                locationGroups.forEach(group => {
                    const { lat, lng, issues: groupIssues } = group;
                    if (groupIssues.length === 1) {
                        const issue = groupIssues[0];
                        const marker = window.L.marker([lat, lng], {
                            icon: window.L.divIcon({
                                className: 'custom-marker',
                                html: `<div style="background-color: ${getMarkerColor(issue.status)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }).addTo(map);
                        marker.bindPopup(createClusterPopupContent([issue]));
                    } else {
                        // Multiple issues at (almost) same location
                        const primaryStatus = getPrimaryStatus(getStatusCounts(groupIssues));
                        const marker = window.L.marker([lat, lng], {
                            icon: window.L.divIcon({
                                className: 'custom-marker',
                                html: `<div style="background-color: ${getMarkerColor(primaryStatus)}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; color: #fff;">${groupIssues.length}</div>`,
                                iconSize: [26, 26],
                                iconAnchor: [13, 13]
                            })
                        }).addTo(map);
                        marker.bindPopup(createClusterPopupContent(groupIssues));
                    }
                });
            };

            setTimeout(() => {
                try {
                    addMarkers();
                    map.invalidateSize();
                } catch (error) {
                    console.error('Error adding markers:', error);
                }
            }, 100);

            // Add zoom event listener to re-cluster markers
            map.on('zoomend', () => {
                addMarkers();
            });

            mapInstanceRef.current = map;
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
    }, [createMap]);    return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container fluid className="py-4">                    <div className="text-center mb-4">
                        <h3 style={{ color: 'var(--primary-dark)' }}>
                            <svg width="30" height="30" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"/>
                            </svg>
                            Admin Dashboard
                        </h3>
                        <p className="text-muted">Monitor and manage community issues</p>
                    </div>
                    
                    <Row className="g-4">
                        {/* Map Section */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0" style={{ color: 'var(--primary-dark)' }}>
                                            📍 Issue Locations Map
                                        </h5>
                                        <div className="d-flex gap-3 flex-wrap">
                                            <span><span style={{color: '#dc3545', fontSize: '1.2rem'}}>●</span> Pending</span>
                                            <span><span style={{color: '#17a2b8', fontSize: '1.2rem'}}>●</span> Accepted</span>
                                            <span><span style={{color: '#6c757d', fontSize: '1.2rem'}}>●</span> Rejected</span>
                                            <span><span style={{color: '#ffc107', fontSize: '1.2rem'}}>●</span> In Progress</span>
                                            <span><span style={{color: '#28a745', fontSize: '1.2rem'}}>●</span> Resolved</span>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-3">Click on any marker to view detailed information. Markers cluster automatically based on zoom level - zoom in to see individual issues.</p>
                                    
                                    <div 
                                        ref={mapRef} 
                                        className="map-container border-0 shadow-lg"
                                        style={{ 
                                            height: '65vh', 
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
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Issue List Section */}
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0" style={{ color: 'var(--primary-dark)' }}>
                                            📋 Issues List
                                        </h5>
                                        <Badge className='total-issues'>{issues.length} Total</Badge>
                                    </div>
                                    
                                    {/* Sort Dropdown */}
                                    <Form.Select 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="mb-3"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <option value="latest">Latest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="pending">Pending Only</option>
                                        <option value="accepted">Accepted Only</option>
                                        <option value="in_progress">In Progress Only</option>
                                        <option value="resolved">Resolved Only</option>
                                        <option value="rejected">Rejected Only</option>
                                    </Form.Select>

                                    {/* Issues List */}
                                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                        {getSortedIssues().length === 0 ? (
                                            <div className="text-center py-4">
                                                <p className="text-muted">No issues found for the selected filter.</p>
                                            </div>
                                        ) : (
                                            getSortedIssues().map((issue, index) => (
                                                <Card 
                                                    key={issue._id} 
                                                    className={`mb-2 border-0 shadow-sm cursor-pointer ${selectedIssue?._id === issue._id ? 'border-primary' : ''}`}
                                                    style={{ 
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                        borderLeft: selectedIssue?._id === issue._id ? '4px solid var(--primary-medium)' : '4px solid transparent'
                                                    }}
                                                    onClick={() => handleIssueClick(issue)}
                                                >
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1" style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                                                                    {issue.category}
                                                                </h6>                                                                <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                                                                    By: {issue.userId?.firstName || 'Unknown'} {issue.userId?.lastName || 'User'}
                                                                </p>
                                                                <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                                                                    {formatDate(issue.createdAt)}
                                                                </p>
                                                            </div>
                                                            <Badge bg={getStatusBadgeVariant(issue.status)} className="ms-2">
                                                                {issue.status}
                                                            </Badge>
                                                        </div>
                                                        
                                                        {issue.description && (
                                                            <p className="mb-2 text-muted" style={{ 
                                                                fontSize: '0.85rem',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {issue.description}
                                                            </p>
                                                        )}
                                                        
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">
                                                                📍 Lat: {parseFloat(issue.latitude).toFixed(4)}, Lng: {parseFloat(issue.longitude).toFixed(4)}
                                                            </small>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/issue/${issue._id}`);
                                                                }}
                                                                style={{ fontSize: '0.75rem' }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default AdminDashboard;
