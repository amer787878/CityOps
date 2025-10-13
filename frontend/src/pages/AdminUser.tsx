import React, { useState, useEffect } from 'react';
import {
    Button,
    Row,
    Col,
    Card,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useDeleteUserMutation, useGetUsersQuery, useSuspendUserMutation } from '../redux/api/userAPI';
import { IUser } from '../redux/api/types';
import { Edit, ChevronDown, MoreVertical, Slash, Trash2 } from 'react-feather';
import FullScreenLoader from '../components/FullScreenLoader';
import { useNavigate } from 'react-router-dom';

const AdminUser: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalDeleteVisibility, setModalDeleteVisibility] = useState<boolean>(false);
    const [modalSuspendVisibility, setModalSuspendVisibility] = useState<boolean>(false);
    const navigate = useNavigate();

    const queryParams = {
        status: status,
        role: role
    };
    const { data: users, refetch, isLoading } = useGetUsersQuery(queryParams);
    const [deleteUser] = useDeleteUserMutation();
    const [suspendUser] = useSuspendUserMutation();

    useEffect(() => {
        refetch();
    }, [status, role, refetch]);

    const handleFilterChange = (filterKey: 'role' | 'status', value: string) => {
        if (filterKey === 'role') setRole(value);
        if (filterKey === 'status') setStatus(value);
    };

    const toggleDeleteModal = (id: string | null = null) => {
        setSelectedId(id);
        setModalDeleteVisibility(!modalDeleteVisibility);
    };

    const toggleSuspendModal = (id: string | null = null) => {
        setSelectedId(id);
        setModalSuspendVisibility(!modalSuspendVisibility);
    };

    const handleDeleteUser = async () => {
        try {
            if (selectedId) {
                await deleteUser(selectedId).unwrap();
                toast.success('User deleted successfully');
                refetch();
            }
        } catch (error: any) {
            toast.error(`${error.message || error.data.message}`);
        } finally {
            setModalDeleteVisibility(false);
        }
    };

    const handleSuspendUser = async () => {
        try {
            if (selectedId) {
                await suspendUser(selectedId).unwrap();
                toast.success('User suspended successfully!');
                refetch();
            }
        } catch (error: any) {
            toast.error(`${error.message || error.data.message}`);
        } finally {
            setModalSuspendVisibility(false);
        }
    };

    const roleOptions = [
        { value: 'Admin', label: 'Admin' },
        { value: 'Authority', label: 'Authority' },
        { value: 'Citizen', label: 'Citizen' },
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Suspended', label: 'Suspended' },
    ];

    const renderBadge = (type: 'role' | 'status', value: string) => {
        const badgeColors: Record<string, string> = {
            Admin: 'info',
            Citizen: 'success',
            Authority: 'primary',
            Active: 'primary',
            Pending: 'warning',
            Suspended: 'danger',
        };
        return (
            <Badge color={badgeColors[value] || 'secondary'} className="px-3 py-2" pill>
                {value}
            </Badge>
        );
    };

    const columns: TableColumn<IUser>[] = [
        {
            name: 'Fullname',
            selector: (row) => row.fullname,
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row) => row.email,
            sortable: true,
        },
        {
            name: 'Role',
            cell: (row) => renderBadge('role', row.role),
        },
        {
            name: 'Status',
            cell: (row) => renderBadge('status', row.status),
        },
        {
            name: 'Actions',
            width: '120px',
            cell: (row) => (
                <>
                    {row.role !== 'Admin' && (
                        <UncontrolledDropdown>
                            <DropdownToggle tag="div" className="btn btn-sm">
                                <MoreVertical size={14} className="cursor-pointer action-btn" />
                            </DropdownToggle>
                            <DropdownMenu end container="body">
                                <DropdownItem className="w-100" onClick={() => navigate(`/admin/users/${row._id}`)}>
                                    <Edit size={14} className="mx-1" />
                                    <span className="align-middle mx-2">Edit</span>
                                </DropdownItem>
                                <DropdownItem onClick={() => toggleSuspendModal(row._id)}>
                                    <Slash size={14} className="mx-1" />
                                    <span className="align-middle mx-2">Suspend</span>
                                </DropdownItem>
                                <DropdownItem onClick={() => toggleDeleteModal(row._id)}>
                                    <Trash2 size={14} className="mx-1" />
                                    <span className="align-middle mx-2">Delete</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}
                </>
            ),
        },
    ];

    return (
        <>
            {isLoading ? (
                <FullScreenLoader />
            ) : (
                <div className="container main-board">
                    <Row className="my-3">
                        <Col>
                            <h3>User Management</h3>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Select
                                options={roleOptions}
                                onChange={(e) => handleFilterChange('role', e?.value || '')}
                                placeholder="Filter by Role"
                                isClearable={true}
                            />
                        </Col>
                        <Col md={4}>
                            <Select
                                options={statusOptions}
                                onChange={(e) => handleFilterChange('status', e?.value || '')}
                                placeholder="Filter by Status"
                                isClearable={true}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Card>
                                <DataTable
                                    title="Users"
                                    data={users || []}
                                    responsive
                                    className="react-dataTable"
                                    noHeader
                                    pagination
                                    paginationRowsPerPageOptions={[15, 30, 50, 100]}
                                    columns={columns}
                                    sortIcon={<ChevronDown />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Modal isOpen={modalDeleteVisibility} toggle={() => toggleDeleteModal()}>
                        <ModalHeader toggle={() => toggleDeleteModal()}>Delete Confirmation</ModalHeader>
                        <ModalBody>Are you sure you want to delete?</ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={handleDeleteUser}>Delete</Button>
                            <Button color="secondary" onClick={() => toggleDeleteModal()} outline>No</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={modalSuspendVisibility} toggle={() => toggleSuspendModal()}>
                        <ModalHeader toggle={() => toggleSuspendModal()}>Suspend Confirmation</ModalHeader>
                        <ModalBody>Are you sure you want to suspend?</ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={handleSuspendUser}>Suspend</Button>
                            <Button color="secondary" onClick={() => toggleSuspendModal()} outline>No</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default AdminUser;
