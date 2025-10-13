/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import { CheckSquare, ChevronDown, MoreVertical, Trash2 } from 'react-feather';
import { PendingSubmission, ReportedComment } from '../redux/api/types';
import { useGetModerationQuery } from '../redux/api/moderationAPI';

const AdminModerationPage: React.FC = () => {

    const { data: moderationData = {}, refetch, isLoading } = useGetModerationQuery();

    useEffect(() => {
        refetch();
    }, [refetch]);

    console.log(moderationData)

    const [rejectReason, setRejectReason] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedIssue, setSelectedIssue] = useState<string>('');

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const handleReject = (id: string) => {
        setSelectedIssue(id);
        toggleModal();
    };

    const handleApproveSubmission = (id: string) => {
        
    };

    const handleRejectSubmission = () => {
        
        toggleModal();
    };

    const handleApproveComment = (issueId: string) => {
        
    };

    const handleDeleteComment = (issueId: string) => {
        
    };

    // Define columns for Pending Submissions table
    const pendingColumns: TableColumn<PendingSubmission>[] = [
        {
            name: 'Issue ID',
            selector: row => row.issueNumber,
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Submitted By',
            selector: row => row.createdBy?.fullname,
            sortable: true,
        },
        {
            name: 'Photo',
            cell: (row) => (
                row.photoUrl ? <img src={row.photoUrl} alt="Issue" width="50" height="50" /> : 'No photo'
            ),
            sortable: false,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <UncontrolledDropdown>
                    <DropdownToggle tag="div" className="btn btn-sm">
                        <MoreVertical size={14} className="cursor-pointer action-btn" />
                    </DropdownToggle>
                    <DropdownMenu end container="body">
                        <DropdownItem className="w-100" onClick={() => handleApproveSubmission(row._id)}>
                            <CheckSquare size={14} className="mx-1" />
                            <span className="align-middle mx-2">Approve</span>
                        </DropdownItem>
                        <DropdownItem className="w-100" onClick={() => handleReject(row._id)}>
                            <Trash2 size={14} className="mx-1" />
                            <span className="align-middle mx-2">Reject</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

    // Define columns for Reported Comments table
    const reportedColumns: TableColumn<ReportedComment>[] = [
        {
            name: 'Comment',
            selector: row => row.content,
            sortable: true,
        },
        {
            name: 'Issue ID',
            selector: row => row.issue?.issueNumber,
            sortable: true,
        },
        {
            name: 'Flag Reason',
            selector: row => row.flagReason,
            sortable: true,
        },
        {
            name: 'Reported By',
            selector: row => row.createdBy?.fullname,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <UncontrolledDropdown>
                    <DropdownToggle tag="div" className="btn btn-sm">
                        <MoreVertical size={14} className="cursor-pointer action-btn" />
                    </DropdownToggle>
                    <DropdownMenu end container="body">
                        <DropdownItem className="w-100" onClick={() => handleApproveComment(row.issueId)}>
                            <CheckSquare size={14} className="mx-1" />
                            <span className="align-middle mx-2">Approve</span>
                        </DropdownItem>
                        <DropdownItem className="w-100" onClick={() => handleDeleteComment(row.issueId)}>
                            <Trash2 size={14} className="mx-1" />
                            <span className="align-middle mx-2">Reject</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

    return (
        <Container className='main-board'>
            <Row className="my-4">
                <Col>
                    <h3>Admin Moderation Page</h3>
                </Col>
            </Row>

            <Row className='my-3'>
                <Col>
                    <h5>Pending Submissions</h5>
                    <DataTable
                        columns={pendingColumns}
                        data={moderationData.pendingSubmissionIssues}
                        pagination
                        responsive
                        noHeader
                        paginationRowsPerPageOptions={[15, 30, 50, 100]}
                        sortIcon={<ChevronDown />}
                    />
                </Col>
            </Row>

            <Row className='my-3'>
                <Col>
                    <h5>Reported Comments</h5>
                    <DataTable
                        columns={reportedColumns}
                        data={moderationData.reportedComments}
                        pagination
                        noHeader
                        paginationRowsPerPageOptions={[15, 30, 50, 100]}
                        responsive
                        sortIcon={<ChevronDown />}
                    />
                </Col>
            </Row>

            {/* Modal for rejecting submission */}
            <Modal isOpen={modalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Reject Submission</ModalHeader>
                <ModalBody>
                    <Input
                        type="textarea"
                        placeholder="Enter rejection reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleRejectSubmission}>
                        Submit
                    </Button>{' '}
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default AdminModerationPage;
