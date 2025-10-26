/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label
} from 'reactstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import { CheckSquare, ChevronDown, MoreVertical, Trash2 } from 'react-feather';
import {
    useGetModerationQuery, useRejectSubmissionMutation, useApproveSubmissionMutation,
    useApproveCommentMutation, useRejectCommentMutation
} from '../redux/api/moderationAPI';

const AdminModerationPage: React.FC = () => {
    const { data: moderationData = { pendingSubmissionIssues: [], reportedComments: [] }, refetch } = useGetModerationQuery();

    const [rejectSubmission] = useRejectSubmissionMutation();
    const [approveSubmission] = useApproveSubmissionMutation();
    const [approveComment] = useApproveCommentMutation();
    const [rejectComment] = useRejectCommentMutation();

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);  // For image modal
    const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
    const [modalType, setModalType] = useState<"issue" | "comment">("issue");
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState<string>("");
    const [photoUrl, setPhotoUrl] = useState<string>("");  // To store the clicked photo URL

    useEffect(() => {
        refetch();
    }, [refetch]);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        setRejectReason(""); // Reset reason field on close
    };

    const toggleImageModal = () => {
        setImageModalOpen(!imageModalOpen);
    };

    // Open Modal for Approval/Rejection
    const openModal = (id: string, action: "approve" | "reject", type: "issue" | "comment") => {
        setCurrentId(id);
        setModalAction(action);
        setModalType(type);
        setModalOpen(true);
    };

    // Handle Confirm Action
    const handleConfirmAction = async () => {
        if (!currentId) return;

        if (modalAction === "approve") {
            modalType === "issue" ? await approveSubmission(currentId) : await approveComment(currentId);
        } else {
            if (!rejectReason.trim()) return alert("Reject reason is required!");
            modalType === "issue"
                ? await rejectSubmission({ id: currentId, reason: rejectReason })
                : await rejectComment({ id: currentId, reason: rejectReason });
        }

        refetch();
        toggleModal();
    };

    // Pending Submission Columns (Issues)
    const pendingSubmissionColumns: TableColumn<any>[] = [
        {
            name: 'Issue Number',
            selector: row => row.issueNumber,
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description?.length > 30 ? `${row.description.slice(0, 30)}...` : row.description,
            sortable: true,
        },
        {
            name: 'Photo Preview',
            cell: row => row.photoUrl ? 
                <img 
                    src={row.photoUrl} 
                    alt="photo-preview" 
                    style={{ maxWidth: 50, maxHeight: 50, cursor: 'pointer' }} 
                    onClick={() => { setPhotoUrl(row.photoUrl); toggleImageModal(); }}  // Open image modal on click
                /> : null,
            sortable: false,
        },
        {
            name: 'Submitted By',
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
                        <DropdownItem className="w-100" onClick={() => openModal(row._id, "approve", "issue")}>
                            <CheckSquare size={14} className="mx-1" />
                            <span className="align-middle mx-2">Approve</span>
                        </DropdownItem>
                        <DropdownItem className="w-100" onClick={() => openModal(row._id, "reject", "issue")}>
                            <Trash2 size={14} className="mx-1" />
                            <span className="align-middle mx-2">Reject</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

    // Reported Comments Columns
    const reportedCommentColumns: TableColumn<any>[] = [
        {
            name: 'Comment',
            selector: row => row.content?.length > 30 ? `${row.content.slice(0, 30)}...` : row.content,
            sortable: true,
        },
        {
            name: 'Issue ID',
            selector: row => row.issue?.issueNumber,
            sortable: true,
        },
        {
            name: 'Reported By',
            selector: row => row.createdBy?.fullname,
            sortable: true,
        },
        {
            name: 'Rejection Reason',
            selector: row => row.reason || 'N/A', // Show reason if available, otherwise 'N/A'
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
                        <DropdownItem className="w-100" onClick={() => openModal(row._id, "approve", "comment")}>
                            <CheckSquare size={14} className="mx-1" />
                            <span className="align-middle mx-2">Approve</span>
                        </DropdownItem>
                        <DropdownItem className="w-100" onClick={() => openModal(row._id, "reject", "comment")}>
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
            <Row className="my-3">
                <Col>
                    <h3>Moderation</h3>
                </Col>
            </Row>
            <Row className='my-3'>
                <Col>
                    <h5>Pending Submissions</h5>
                    <DataTable
                        columns={pendingSubmissionColumns}
                        data={moderationData.pendingSubmissionIssues || []}
                        pagination
                        noHeader
                        paginationRowsPerPageOptions={[15, 30, 50, 100]}
                        responsive
                        sortIcon={<ChevronDown />}
                    />
                </Col>
            </Row>
            <Row className='my-3'>
                <Col>
                    <h5>Reported Comments</h5>
                    <DataTable
                        columns={reportedCommentColumns}
                        data={moderationData.reportedComments || []}
                        pagination
                        noHeader
                        paginationRowsPerPageOptions={[15, 30, 50, 100]}
                        responsive
                        sortIcon={<ChevronDown />}
                    />
                </Col>
            </Row>

            {/* Modal for Approve/Reject */}
            <Modal isOpen={modalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>
                    {modalAction === "approve"
                        ? `Approve ${modalType === "issue" ? "Submission" : "Comment"}`
                        : `Reject ${modalType === "issue" ? "Submission" : "Comment"}`}
                </ModalHeader>
                <ModalBody>
                    {modalAction === "approve" ? (
                        <p>Are you sure you want to approve this {modalType === "issue" ? "submission" : "comment"}?</p>
                    ) : (
                        <>
                            <Label for="rejectReason">Reject Reason <span className="text-danger">*</span></Label>
                            <Input
                                type="textarea"
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                required
                            />
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                    <Button color={modalAction === "approve" ? "success" : "danger"} onClick={handleConfirmAction}>
                        {modalAction === "approve" ? "Approve" : "Reject"}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal for Photo Preview */}
            <Modal isOpen={imageModalOpen} toggle={toggleImageModal}>
                <ModalHeader toggle={toggleImageModal}>Photo Preview</ModalHeader>
                <ModalBody>
                    <img src={photoUrl} alt="Full size" style={{ width: '100%' }} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleImageModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default AdminModerationPage;
