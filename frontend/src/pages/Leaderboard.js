import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Pagination, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import API_CONFIG from '../config/api';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        loadLeaderboard(currentPage);
    }, [currentPage]);

    const loadLeaderboard = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_CONFIG.REACT_APP_API_BASE_URL}/users/leaderboard/${page}`
            );
            setLeaderboardData(response.data.users);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            toast.error('Error loading leaderboard data');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getRankDisplay = (rank) => {
        if (rank === 1) return { icon: '🏆', text: `${rank}` };
        return { icon: '', text: `${rank}` };
    };

    const getCurrentUserRank = () => {
        return leaderboardData.find(u => u._id === user?._id)?.rank || null;
    };

    if (loading && leaderboardData.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <Navigation />
            <div style={{ backgroundColor: 'var(--primary-lightest)', minHeight: '100vh' }}>
                <Container className="py-4">
                    <div className="text-center mb-4">
                        <h2 style={{ color: 'var(--primary-dark)' }}>
                            <svg width="40" height="40" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.792l4.79 4.792A7 7 0 0 0 7.5 1.018zm1.524.481a5.987 5.987 0 0 1 3.206 8.15l-2.681-2.681 1.017-1.017a.5.5 0 1 0-.707-.707L8.842 6.261 7.825 5.244a.5.5 0 1 0-.707.707l1.017 1.017L5.454 9.649A5.987 5.987 0 0 1 8.976 1.5h.048z"/>
                                <path d="M2.21 13.061a7 7 0 0 0 3.71 1.928l2.581-2.581L2.21 13.061zM13.79 13.061L7.498 6.77l2.581-2.581a7 7 0 0 0-3.71-1.928L13.79 13.061z"/>
                            </svg>
                            Leaderboard
                        </h2>
                    </div>

                    {getCurrentUserRank() && (
                        <Alert variant="info" className="text-center">
                            <strong>Your Current Rank: </strong>
                            <span className="ms-1 fw-bold fs-5">
                                {getRankDisplay(getCurrentUserRank()).icon} {getRankDisplay(getCurrentUserRank()).text}
                            </span>
                            <span className="ms-2">with {user?.rewards || 0} points</span>
                        </Alert>
                    )}

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <Card className="shadow-lg border-0">
                                <Card.Header style={{ 
                                    backgroundColor: 'var(--primary-medium)', 
                                    color: 'white',
                                    borderRadius: '15px 15px 0 0'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">
                                            <svg width="24" height="24" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                                <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                                                <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                                            </svg>
                                            Top Contributors
                                        </h4>
                                        <Badge bg="light" text="dark">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </Badge>
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {leaderboardData.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No users found on the leaderboard yet.</p>
                                        </div>
                                    ) : (
                                        <Table responsive className="mb-0">
                                            <thead style={{ backgroundColor: 'var(--primary-lightest)' }}>
                                                <tr>
                                                    <th className="text-center" style={{ width: '80px', color: 'var(--primary-dark)' }}>Rank</th>
                                                    <th style={{ color: 'var(--primary-dark)' }}>User</th>
                                                    <th className="text-center" style={{ color: 'var(--primary-dark)' }}>Reward Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboardData.map((userEntry, index) => {
                                                    const rankDisplay = getRankDisplay(userEntry.rank);
                                                    const isCurrentUser = userEntry._id === user?._id;
                                                    
                                                    return (
                                                        <tr 
                                                            key={userEntry._id}
                                                            className={isCurrentUser ? 'table-active' : ''}
                                                            style={{
                                                                backgroundColor: isCurrentUser ? 'var(--primary-lightest)' : 'transparent',
                                                                fontWeight: isCurrentUser ? '600' : 'normal'
                                                            }}
                                                        >
                                                            <td className="text-center py-3">
                                                                <span className="fw-bold fs-5" style={{ color: 'var(--primary-dark)' }}>
                                                                    {rankDisplay.icon} {rankDisplay.text}
                                                                </span>
                                                            </td>                                                            <td className="py-3">
                                                                <div className="d-flex align-items-center">
                                                                    {userEntry.profilePhoto ? (
                                                                        <img 
                                                                            src={userEntry.profilePhoto} 
                                                                            alt={`${userEntry.firstName} ${userEntry.lastName}`}
                                                                            className="rounded-circle me-3"
                                                                            style={{ 
                                                                                width: '40px', 
                                                                                height: '40px', 
                                                                                objectFit: 'cover',
                                                                                border: '2px solid var(--primary-light)'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                                                                             style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-medium)' }}>
                                                                            <span className="text-white fw-bold">
                                                                                {userEntry.firstName?.[0]?.toUpperCase()}{userEntry.lastName?.[0]?.toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="fw-semibold" style={{ color: 'var(--primary-dark)' }}>
                                                                            {userEntry.firstName} {userEntry.lastName}
                                                                            {isCurrentUser && (
                                                                                <Badge bg="success" className="ms-2">You</Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-3">
                                                                <span className="fw-bold fs-5" style={{ color: 'var(--primary-dark)' }}>
                                                                    {userEntry.rewards}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                                
                                {pagination.totalPages > 1 && (
                                    <Card.Footer className="bg-light">
                                        <div className="d-flex justify-content-center">
                                            <Pagination className="mb-0">
                                                <Pagination.Prev 
                                                    disabled={!pagination.hasPreviousPage}
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                />
                                                
                                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                                    <Pagination.Item
                                                        key={page}
                                                        active={page === currentPage}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Pagination.Item>
                                                ))}
                                                
                                                <Pagination.Next 
                                                    disabled={!pagination.hasNextPage}
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                />
                                            </Pagination>
                                        </div>
                                        
                                        <div className="text-center mt-2">
                                            <small className="text-muted">
                                                Showing {leaderboardData.length} of {pagination.totalUsers} users
                                            </small>
                                        </div>
                                    </Card.Footer>
                                )}
                            </Card>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-muted">
                            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                            </svg>
                            Report more issues to earn points and climb the leaderboard!
                        </p>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default Leaderboard;
