/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Col, Row, Card, CardBody } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { useGetExploreIssueQuery } from '../redux/api/issueAPI';
import FullScreenLoader from '../components/FullScreenLoader';
import userImg from '../assets/images/user.png';
import { getDateFormat } from '../utils/Utils';

const ExploreIssueDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: issue, refetch: refetchIssue, isLoading } = useGetExploreIssueQuery(id ?? '', {
        skip: !id,
    });

    useEffect(() => {
        refetchIssue();
    }, [refetchIssue]);

    if (isLoading) {
        return (<FullScreenLoader />);
    }

    return (
        <div className="container main-board py-4">
            <Card className='issue-card shadow-sm'>
                <CardBody>
                    <Row className="mb-4">
                        <Col>
                            <h3 className="text-primary">Issue Details</h3>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6}>
                            <p><strong>Description:</strong> {issue.description}</p>
                            <p><strong>Address:</strong> {issue.address}</p>
                            <p><strong>Priority:</strong> {issue.priority}</p>
                            <p><strong>Category:</strong> {issue?.category}</p>
                            <p><strong>Status:</strong> {issue.status}</p>
                            {/* {issue.transcription && (
                                <div>
                                    <p><strong>Audio Transcription:</strong></p>
                                    <p>{issue.transcription}</p>
                                </div>
                            )} */}
                        </Col>
                        <Col md={6} className="text-center">
                            {issue.photoUrl && (
                                <div>
                                    <p><strong>Photo:</strong></p>
                                    <img
                                        src={issue.photoUrl}
                                        alt="Issue"
                                        style={{ maxHeight: '300px' }}
                                        className="img-fluid rounded shadow-sm d-block mx-auto mb-3"
                                    />
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <h4 className="text-secondary">Comments</h4>
                            <>
                                {issue && issue.comments.map((comment: any, index: number) => (
                                    <div
                                        className="social-feed-box border rounded p-3 mb-3 shadow-sm"
                                        key={comment._id}
                                    >
                                        <div className="d-flex align-items-center mb-2">
                                            <img
                                                src={userImg}
                                                alt='user'
                                                className="rounded-circle me-2"
                                                style={{ width: '40px', height: '40px' }}
                                            />
                                            <div>
                                                <strong>{comment.createdBy?.fullname}</strong>
                                                <br />
                                                <small className="text-muted">{getDateFormat(comment.createdAt)}</small>
                                            </div>
                                        </div>
                                        <div className="social-body">
                                            <p className="mb-0">
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

export default ExploreIssueDetail;
