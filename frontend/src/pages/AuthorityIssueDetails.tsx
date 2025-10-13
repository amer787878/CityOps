/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Col, Row, Card, CardBody, Button } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetIssueQuery } from '../redux/api/issueAPI';
import FullScreenLoader from '../components/FullScreenLoader';
import userImg from '../assets/images/user.png';
import { getDateFormat } from '../utils/Utils';

const AuthorityIssueDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // 👈 useNavigate hook
    const { data: issue, refetch: refetchIssue, isLoading } = useGetIssueQuery(id ?? '', {
        skip: !id,
    });

    useEffect(() => {
        refetchIssue();
    }, [refetchIssue]);

    if (isLoading) {
        return (<FullScreenLoader />);
    }

    return (
        <div className="container main-board">
            <Button color="secondary" onClick={() => navigate(-1)} className="mb-3"> {/* 👈 Back Button */}
                Back
            </Button>
            <Card className='issue-card'>
                <CardBody>
                    <Row className="my-3">
                        <Col>
                            <h3>Issue Details</h3>
                        </Col>
                    </Row>
                    <Row className="my-3">
                        <Col md={6}>
                            <p><strong>Description:</strong> {issue.description}</p>
                            <p><strong>Address:</strong> {issue.address}</p>
                            <p><strong>Priority:</strong> {issue.priority}</p>
                            <p><strong>Status:</strong> {issue.status}</p>
                        </Col>
                        <Col md={6}>
                            {issue.photoUrl && (
                                <div>
                                    <p><strong>Photo:</strong></p>
                                    <img src={issue.photoUrl} alt="Issue" className="img-fluid mb-3" />
                                </div>
                            )}
                            {issue.audioTranscription && (
                                <div>
                                    <p><strong>Audio Transcription:</strong></p>
                                    <p>{issue.audioTranscription}</p>
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="my-3">
                        <Col>
                            <h4>Comments</h4>
                            <>
                                {issue && issue.comments.map((comment: any, index: number) => (
                                    <div className="social-feed-box" key={comment._id} style={{
                                        marginBottom: index === issue.comments.length - 1 ? '0' : 'inherit',
                                        borderBottom: index === issue.comments.length - 1 ? '1px solid #e7eaec' : 'none',
                                    }}>
                                        <div className="social-avatar">
                                            <small className="float-left">
                                                <img src={userImg} alt='user' />
                                            </small>
                                            <div className="media-body">
                                                <div>
                                                    {comment.createdBy?.fullname}
                                                </div>
                                                <small className="text-muted">{getDateFormat(comment.createdAt)}</small>
                                            </div>
                                        </div>
                                        <div className="social-body">
                                            <p>
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
};

export default AuthorityIssueDetails;
