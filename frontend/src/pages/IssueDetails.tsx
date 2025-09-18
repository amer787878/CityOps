import React, { useEffect } from 'react';
import { Col, Row, Button, Form, FormGroup, Card, CardBody } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { IComment } from '../redux/api/types';
import { useGetIssueQuery, usePostIssueMutation } from '../redux/api/issueAPI';
import { SubmitHandler, useForm } from 'react-hook-form';
import classnames from 'classnames';
import FullScreenLoader from '../components/FullScreenLoader';
import userImg from '../assets/images/user.png';
import { getDateFormat } from '../utils/Utils';

const IssueDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: issue, refetch: refetchIssue, isLoading } = useGetIssueQuery(id ?? '', {
        skip: !id,
    });
    const [postIssue] = usePostIssueMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IComment>();

    useEffect(() => {
        refetchIssue();
    }, [refetchIssue]);

    const onSubmit: SubmitHandler<IComment> = async (formData) => {
        formData.issueId = id ?? "";
        await postIssue(formData);
        refetchIssue();
    }

    if (isLoading) {
        return (<FullScreenLoader />);
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
                            <>
                                {issue && issue.comments.map((comment: any, index: number) => (
                                    <div className="social-feed-box" key={comment._id} style={{
                                        marginBottom: index === issue.comments.length - 1 ? '0' : 'inherit',
                                        borderBottom: index === issue.comments.length - 1 ? '1px solid #e7eaec' : 'none',
                                    }}>
                                        <div className="social-avatar">
                                            <small className="float-left">
                                                <img alt="image" src={userImg} />
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
                            <div className='mt-3'>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <FormGroup>
                                        <textarea
                                            id="content"
                                            className={`form-control ${classnames({ 'is-invalid': errors.content })}`}
                                            {...register('content', {
                                                required: 'Comment is required.',
                                                minLength: {
                                                    value: 10,
                                                    message: 'Comment must be at least 10 characters long.'
                                                },
                                                maxLength: {
                                                    value: 500,
                                                    message: 'Comment must be less than 500 characters long.'
                                                }
                                            })}
                                        ></textarea>
                                        {errors.content && (
                                            <small className="text-danger">{errors.content.message}</small>
                                        )}
                                    </FormGroup>
                                    <Button color="primary" type="submit">
                                        Submit Comment
                                    </Button>
                                </Form>
                            </div>

                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </div>
    );
};

export default IssueDetails;
