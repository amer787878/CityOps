/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Col, Row, Card, CardBody, Button, FormGroup, Form, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignTeamMutation, useGetIssueQuery, usePostCommentMutation, useUpdateStatusMutation } from '../redux/api/issueAPI';
import FullScreenLoader from '../components/FullScreenLoader';
import userImg from '../assets/images/user.png';
import { getDateFormat } from '../utils/Utils';
import { IComment } from '../redux/api/types';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import classnames from 'classnames';
import { useGetTeamsQuery } from '../redux/api/teamAPI';

const AuthorityIssueDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: issue, refetch: refetchIssue, isLoading } = useGetIssueQuery(id ?? '', { skip: !id });
    const [updateStatus] = useUpdateStatusMutation();
    const [assignTeam] = useAssignTeamMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IComment>();

    const [postComment, { isError, error, isSuccess, data }] = usePostCommentMutation();
    const { data: teams, refetch: refetchTeam } = useGetTeamsQuery();

    const [reassignModal, setReassignModal] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [closeModal, setCloseModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    useEffect(() => {
        refetchIssue();
        refetchTeam();
    }, [refetchIssue, refetchTeam]);

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Note posted successfully!");
        }

        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: any) =>
                    toast.error(el.message, { position: "top-right" })
                );
            } else {
                toast.error(
                    (error as any)?.data?.message || "An unexpected error occurred!",
                    { position: "top-right" }
                );
            }
        }
    }, [isSuccess, isError]);

    if (isLoading) {
        return <FullScreenLoader />;
    }

    const onSubmit: SubmitHandler<IComment> = async (formData) => {
        formData.issueId = id ?? "";
        formData.notificationType = "New Comment";
        await postComment(formData);
        refetchIssue();
    };

    const handleReassignTeam = async () => {
        if (selectedTeam) {
            console.log(selectedTeam)
            await assignTeam({ id, data: { teamId: selectedTeam } });
            toast.success("Team reassigned successfully!");
            setReassignModal(false);
            refetchIssue();
        }
    };

    const handleChangeStatus = async (newStatus: string) => {
        await updateStatus({ id, data: { status: newStatus } });
        toast.success("Status updated successfully!");
        setStatusModal(false);
        refetchIssue();
    };

    const handleCloseIssue = async () => {
        await updateStatus({ id, data: { status: "Closed" } });
        toast.success("Issue closed successfully!");
        setCloseModal(false);
        refetchIssue();
    };

    const isClosed = issue.status === "Closed"; // Added check for "Closed" status

    return (
        <div className="container main-board">
            <Button color="secondary" onClick={() => navigate('/authority/dashboard')} className="mb-3 btn-sm">
                Back
            </Button>
            <Card className="issue-card">
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
                            <p><strong>Category:</strong> {issue.category}</p>
                            <p>
                                <strong>Status:</strong>{' '}
                                <Badge color={
                                    issue.status === 'Pending' ? 'warning' :
                                        issue.status === 'In Progress' ? 'primary' :
                                            issue.status === 'Resolved' ? 'success' :
                                                issue.status === 'Closed' ? 'danger' :
                                                    'secondary'
                                }>
                                    {issue.status}
                                </Badge>
                            </p>

                            <p><strong>Submission Date:</strong> {getDateFormat(issue.createdAt)}</p>
                            <p><strong>Submitted By:</strong> {issue.createdBy?.fullname} (ID: {issue.createdBy?._id})</p>
                        </Col>
                        <Col md={6}>
                            {issue.photoUrl && (
                                <div>
                                    <p><strong>Photo Preview:</strong></p>
                                    <img src={issue.photoUrl} alt="Issue" className="img-fluid rounded mb-3" />
                                </div>
                            )}
                            {/* {issue.audioTranscription && (
                                <div>
                                    <p><strong>Audio Transcription:</strong></p>
                                    <p>{issue.audioTranscription}</p>
                                </div>
                            )} */}
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <h4 className="text-secondary">Assigned Team</h4>
                            <p>
                                <Badge color="danger">
                                    {issue.team ? issue.team.name : 'Unassigned'}
                                </Badge>
                            </p>
                            <Button color="primary" size="sm" onClick={() => setReassignModal(true)} disabled={isClosed}>
                                Reassign Team
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <h4 className="text-secondary">Internal Notes</h4>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <FormGroup>
                                    <textarea
                                        id="content"
                                        className={`form-control ${classnames({ 'is-invalid': errors.content })}`}
                                        placeholder='Add your internal note here...'
                                        {...register('content', {
                                            required: 'Note is required.',
                                            minLength: {
                                                value: 10,
                                                message: 'Note must be at least 10 characters long.'
                                            },
                                            maxLength: {
                                                value: 500,
                                                message: 'Note must be less than 500 characters long.'
                                            }
                                        })}
                                        disabled={isClosed} // Disable when the status is closed
                                    ></textarea>
                                    {errors.content && (
                                        <small className="text-danger">{errors.content.message}</small>
                                    )}
                                </FormGroup>
                                <Button color="primary" className='btn-sm' type="submit" disabled={isClosed}>
                                    Submit Note
                                </Button>
                            </Form>

                            <div className="notes-list mt-4">
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
                                                    {comment.createdBy?.fullname} -{' '}
                                                    <Badge color="info" pill>
                                                        {comment.createdBy?.role}
                                                    </Badge>
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
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button color="success" className="me-2" size="sm" onClick={() => setStatusModal(true)} disabled={isClosed}>
                                Change Status
                            </Button>
                            <Button color="danger" size="sm" onClick={() => setCloseModal(true)} disabled={isClosed}>
                                Close Issue
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Reassign Team Modal */}
            <Modal isOpen={reassignModal} toggle={() => setReassignModal(false)}>
                <ModalHeader toggle={() => setReassignModal(false)}>Reassign Team</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <label>Select Team</label>
                        <select
                            className="form-control"
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            disabled={isClosed} // Disable when the status is closed
                        >
                            <option value="">Select Team</option>
                            {teams?.map((team) => (
                                <option key={team._id} value={team._id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>

                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleReassignTeam} disabled={!selectedTeam || isClosed}>
                        Reassign
                    </Button>
                    <Button color="secondary" onClick={() => setReassignModal(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Change Status Modal */}
            <Modal isOpen={statusModal} toggle={() => setStatusModal(false)}>
                <ModalHeader toggle={() => setStatusModal(false)}>Change Status</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <label>Select Status</label>
                        <select
                            className="form-control"
                            onChange={(e) => handleChangeStatus(e.target.value)}
                            disabled={isClosed} // Disable when the status is closed
                        >
                            <option value="">Select...</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setStatusModal(false)} disabled={isClosed}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Close Issue Modal */}
            <Modal isOpen={closeModal} toggle={() => setCloseModal(false)}>
                <ModalHeader toggle={() => setCloseModal(false)}>Close Issue</ModalHeader>
                <ModalBody>
                    Are you sure you want to close this issue?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={handleCloseIssue} disabled={isClosed}>
                        Yes, Close
                    </Button>
                    <Button color="secondary" onClick={() => setCloseModal(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AuthorityIssueDetails;
