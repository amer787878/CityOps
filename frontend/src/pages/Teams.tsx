/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Button,
    Card,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    UncontrolledDropdown,
} from "reactstrap";
import {
    useDeleteTeamMutation,
    useGetTeamsQuery,
} from "../redux/api/teamAPI";
import FullScreenLoader from "../components/FullScreenLoader";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { toast } from "react-toastify";
import { ITeam } from "../redux/api/types";
import { Archive, ChevronDown, MoreVertical, Trash2 } from "react-feather";
import teamImg from "../assets/images/team.png";

const Teams: React.FC = () => {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalDeleteVisibility, setModalDeleteVisibility] = useState<boolean>(
        false
    );
    const [deleteTeam] = useDeleteTeamMutation();
    const { data: teams, refetch, isLoading } = useGetTeamsQuery();

    useEffect(() => {
        refetch();
    }, [refetch]);

    const toggleDeleteModal = (id: string | null = null) => {
        setSelectedId(id);
        setModalDeleteVisibility(!modalDeleteVisibility);
    };

    const renderImage = (image: string) => {
        if (image) {
            return (
                <img
                    src={image}
                    alt="Team"
                    className="img-fluid"
                    style={{ maxWidth: "50px", maxHeight: "50px", borderRadius: '25px' }}
                />
            );
        }
        return (
            <img
                src={teamImg}
                alt="Team"
                className="img-fluid"
                style={{ maxWidth: "50px", maxHeight: "50px" }}
            />
        );;
    };

    const handleDeleteTeam = async () => {
        try {
            if (selectedId) {
                await deleteTeam(selectedId).unwrap();
                toast.success("Team deleted successfully");
                refetch();
            }
        } catch (error: any) {
            const errorMessage =
                error?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        } finally {
            setModalDeleteVisibility(false);
        }
    };

    const renderBadge = (type: 'availability', value: string) => {
        const badgeColors: Record<string, string> = {
            Available: 'success',
            Busy: 'primary',
        };
        return (
            <Badge color={badgeColors[value] || 'secondary'} className="p-2" pill>
                {value}
            </Badge>
        );
    };

    const columns: TableColumn<ITeam>[] = [
        {
            name: "",
            width: "100px",
            cell: (row) => renderImage(row.image),
        },
        {
            name: "Team ID",
            width: "100px",
            selector: (row) => row.teamNumber,
            sortable: true,
        },
        {
            name: "Team Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Expertise/Category",
            selector: (row) => row.category,
            sortable: true,
        },
        {
            name: "Availability",
            cell: (row) => renderBadge('availability', row.availability),
            sortable: true,
        },
        {
            name: "Actions",
            width: "120px",
            cell: (row) => (
                <UncontrolledDropdown>
                    <DropdownToggle tag="div" className="btn btn-sm">
                        <MoreVertical size={14} className="cursor-pointer action-btn" />
                    </DropdownToggle>
                    <DropdownMenu end container="body">
                        <DropdownItem
                            className="w-100"
                            onClick={() => navigate(`/authority/team-update/${row._id}`)}
                        >
                            <Archive size={14} className="mx-1" />
                            <span className="align-middle mx-2">Edit</span>
                        </DropdownItem>

                        <DropdownItem onClick={() => toggleDeleteModal(row._id)}>
                            <Trash2 size={14} className="mx-1" />
                            <span className="align-middle mx-2">Delete</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

    return (
        <>
            {isLoading ? (
                <FullScreenLoader />
            ) : (
                <div className="main-board container">
                    <Row className="my-3">
                        <Col>
                            <h3 className="mb-3">Team Management</h3>
                            <a href="/authority/team-create" className="btn btn-outline-primary btn-sm">
                                Create Team
                            </a>
                        </Col>
                    </Row>
                    <Row className="my-3">
                        <Col>
                            <Card>
                                {isLoading ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : (
                                    <DataTable
                                        title="Teams"
                                        data={teams || []}
                                        responsive
                                        className="react-dataTable"
                                        noHeader
                                        pagination
                                        paginationRowsPerPageOptions={[15, 30, 50, 100]}
                                        columns={columns}
                                        sortIcon={<ChevronDown />}
                                        highlightOnHover
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Modal
                        isOpen={modalDeleteVisibility}
                        toggle={() => toggleDeleteModal()}
                    >
                        <ModalHeader toggle={() => toggleDeleteModal()}>
                            Delete Confirmation
                        </ModalHeader>
                        <ModalBody>
                            Are you sure you want to delete this team?
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={handleDeleteTeam}>
                                Delete
                            </Button>
                            <Button
                                color="secondary"
                                onClick={() => toggleDeleteModal()}
                                outline
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default Teams;
