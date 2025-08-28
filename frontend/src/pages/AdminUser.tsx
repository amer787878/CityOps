import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Row,
    Col,
    Card,
    CardBody,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';
import Select from 'react-select';

interface IUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

const AdminUser: React.FC = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
    const [filters, setFilters] = useState({
        role: '',
        status: '',
    });
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        // Mock data or fetch from API
        const mockUsers: IUser[] = [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Citizen', status: 'Active' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Authority', status: 'Suspended' },
            { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active' },
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
    }, []);

    useEffect(() => {
        let data = users;

        if (filters.role) {
            data = data.filter((user) => user.role === filters.role);
        }

        if (filters.status) {
            data = data.filter((user) => user.status === filters.status);
        }

        setFilteredUsers(data);
    }, [filters, users]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleEditRole = (user: IUser) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setModalOpen(true);
    };

    const handleConfirmRoleChange = () => {
        if (selectedUser) {
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === selectedUser.id ? { ...user, role: newRole } : user
                )
            );
            console.log(`Role updated for ${selectedUser.name} to ${newRole}`);
        }
        setModalOpen(false);
    };

    const handleSuspendAccount = (id: number) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, status: 'Suspended' } : user
            )
        );
        console.log(`User ${id} suspended.`);
    };

    const handleDeleteAccount = (id: number) => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        console.log(`User ${id} deleted.`);
    };

    const roleOptions = [
        { value: 'Citizen', label: 'Citizen' },
        { value: 'Authority', label: 'Authority' },
        { value: 'Admin', label: 'Admin' },
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Suspended', label: 'Suspended' },
    ];

    return (
        <div className="container">
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
                    />
                </Col>
                <Col md={4}>
                    <Select
                        options={statusOptions}
                        onChange={(e) => handleFilterChange('status', e?.value || '')}
                        placeholder="Filter by Status"
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <CardBody>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{user.status}</td>
                                            <td>
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    onClick={() => handleEditRole(user)}
                                                >
                                                    Edit Role
                                                </Button>{' '}
                                                <Button
                                                    color="warning"
                                                    size="sm"
                                                    onClick={() => handleSuspendAccount(user.id)}
                                                >
                                                    Suspend
                                                </Button>{' '}
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteAccount(user.id)}
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

            {/* Edit Role Modal */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Edit Role</ModalHeader>
                <ModalBody>
                    <Select
                        options={roleOptions}
                        value={roleOptions.find((option) => option.value === newRole)}
                        onChange={(e) => setNewRole(e?.value || '')}
                        placeholder="Select a new role"
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleConfirmRoleChange}>
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

export default AdminUser;