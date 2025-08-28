import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Card, CardBody, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

interface IPendingIssue {
    id: number;
    description: string;
    submittedBy: string;
    photo?: string;
}

interface IReportedComment {
    id: number;
    content: string;
    linkedIssueId: number;
    flagReason: string;
    reportedBy: string;
}

const AdminModeration: React.FC = () => {
    const [pendingIssues, setPendingIssues] = useState<IPendingIssue[]>([]);
    const [reportedComments, setReportedComments] = useState<IReportedComment[]>([]);
    const [rejectReason, setRejectReason] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Mock data or fetch from API
        const mockIssues: IPendingIssue[] = [
            {
                id: 1,
                description: 'Broken streetlight near Elm Avenue.',
                submittedBy: 'John Doe',
                photo: '/path/to/photo1.jpg',
            },
            {
                id: 2,
                description: 'Overflowing garbage bin on Main Street.',
                submittedBy: 'Jane Smith',
                photo: '/path/to/photo2.jpg',
            },
        ];

        const mockComments: IReportedComment[] = [
            {
                id: 1,
                content: 'This issue is stupid.',
                linkedIssueId: 101,
                flagReason: 'Inappropriate language',
                reportedBy: 'Alice Johnson',
            },
            {
                id: 2,
                content: 'Not relevant to this issue.',
                linkedIssueId: 102,
                flagReason: 'Off-topic comment',
                reportedBy: 'Bob Williams',
            },
        ];

        setPendingIssues(mockIssues);
        setReportedComments(mockComments);
    }, []);

    const handleApproveIssue = (id: number) => {
        // Approve issue logic
        setPendingIssues((prev) => prev.filter((issue) => issue.id !== id));
        console.log(`Issue ${id} approved.`);
    };

    const handleRejectIssue = (id: number) => {
        setSelectedIssueId(id);
        setModalOpen(true);
    };

    const confirmRejectIssue = () => {
        if (selectedIssueId !== null) {
            // Reject issue logic
            setPendingIssues((prev) => prev.filter((issue) => issue.id !== selectedIssueId));
            console.log(`Issue ${selectedIssueId} rejected. Reason: ${rejectReason}`);
        }
        setRejectReason('');
        setModalOpen(false);
    };

    const handleApproveComment = (id: number) => {
        // Approve comment logic
        setReportedComments((prev) => prev.filter((comment) => comment.id !== id));
        console.log(`Comment ${id} approved.`);
    };

    const handleDeleteComment = (id: number) => {
        // Delete comment logic
        setReportedComments((prev) => prev.filter((comment) => comment.id !== id));
        console.log(`Comment ${id} deleted.`);
    };

    return (
        <div className="container">
            <Row className="my-3">
                <Col>
                    <h3>Moderation</h3>
                </Col>
            </Row>

            <Row className="my-3">
                <Col md={6}>
                    <Card>
                        <CardBody>
                            <h5>Pending Submissions</h5>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Issue ID</th>
                                        <th>Description</th>
                                        <th>Submitted By</th>
                                        <th>Photo</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingIssues.map((issue) => (
                                        <tr key={issue.id}>
                                            <td>{issue.id}</td>
                                            <td>{issue.description}</td>
                                            <td>{issue.submittedBy}</td>
                                            <td>
                                                {issue.photo ? (
                                                    <img
                                                        src={issue.photo}
                                                        alt="Issue"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    'No Photo'
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    onClick={() => handleApproveIssue(issue.id)}
                                                >
                                                    Approve
                                                </Button>{' '}
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleRejectIssue(issue.id)}
                                                >
                                                    Reject
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <CardBody>
                            <h5>Reported Comments</h5>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Comment</th>
                                        <th>Linked Issue</th>
                                        <th>Reason</th>
                                        <th>Reported By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportedComments.map((comment) => (
                                        <tr key={comment.id}>
                                            <td>{comment.content}</td>
                                            <td>
                                                <Button
                                                    color="link"
                                                    onClick={() => navigate(`/admin/issues/${comment.linkedIssueId}`)}
                                                >
                                                    {comment.linkedIssueId}
                                                </Button>
                                            </td>
                                            <td>{comment.flagReason}</td>
                                            <td>{comment.reportedBy}</td>
                                            <td>
                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    onClick={() => handleApproveComment(comment.id)}
                                                >
                                                    Approve
                                                </Button>{' '}
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Reject Issue Modal */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Reject Issue</ModalHeader>
                <ModalBody>
                    <Input
                        type="textarea"
                        placeholder="Provide a reason for rejection"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={confirmRejectIssue}>
                        Confirm
                    </Button>{' '}
                    <Button color="secondary" onClick={() => setModalOpen(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AdminModeration;
