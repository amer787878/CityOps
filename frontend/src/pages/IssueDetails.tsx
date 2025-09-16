import React, { useState, useEffect } from 'react';
import { Col, Row, Input, Button, Form, FormGroup, Card, CardBody } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { IComment } from '../redux/api/types';
import { useGetIssueQuery } from '../redux/api/issueAPI';

const IssueDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: issue, refetch: refetchIssue } = useGetIssueQuery(id ?? '', {
        skip: !id,
    });

    useEffect(() => {
        refetchIssue();
    }, [refetchIssue]);

    const [newComment, setNewComment] = useState<string>('');
    const [comments, setComments] = useState<IComment[]>([]);

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim()) return;

        const newCommentObj: IComment = {
            id: comments.length + 1,
            author: 'Current User', // Replace with actual user
            timestamp: new Date().toLocaleString(),
            content: newComment.trim(),
        };

        setComments((prevComments) => [...prevComments, newCommentObj]);
        setNewComment('');
    };

    if (!issue) {
        return <div>Loading issue details...</div>;
    }

    return (
        <div className="container main-board">
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
                            <div className="comments-list">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="mb-3">
                                        <strong>{comment.author}</strong>
                                        <span className="text-muted"> ({comment.timestamp})</span>
                                        <p>{comment.content}</p>
                                        <hr />
                                    </div>
                                ))}
                            </div>
                            <Form onSubmit={(e) => e.preventDefault()}>
                                <FormGroup>
                                    <Input
                                        type="textarea"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={handleCommentChange}
                                    />
                                </FormGroup>
                                <Button color="primary" onClick={handleCommentSubmit}>
                                    Submit Comment
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </div>
    );
};

export default IssueDetails;
