import React, { useState, useEffect } from 'react';
import { Col, Row, Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Card, CardBody } from 'reactstrap';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Edit, Eye, Plus, Trash } from 'react-feather';

interface IIssue {
    id: number;
    description: string;
    address: string;
    submittedBy: string;
    priority: string;
    status: string;
    upvotes: number;
}

const AuthorityDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState<IIssue[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<IIssue[]>([]);
    const [filters, setFilters] = useState({
        priority: '',
        status: '',
        category: '',
        dateRange: { startDate: null as Date | null, endDate: null as Date | null },
        location: '',
    });

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
    });

    const paginationRowsPerPageOptions = [10, 25, 50];

    const columns = [
        {
            name: 'Issue ID',
            selector: (row: { id: number }) => row.id,
            sortable: true,
            grow: 1,
        },
        {
            name: 'Description',
            selector: (row: { description: string }) => row.description,
            sortable: true,
            grow: 2,
        },
        {
            name: 'Address',
            selector: (row: { address: string }) => row.address,
            sortable: true,
        },
        {
            name: 'Submitted By',
            selector: (row: { submittedBy: string }) => row.submittedBy,
            sortable: true,
        },
        {
            name: 'Priority',
            selector: (row: { priority: string }) => row.priority,
            sortable: true,
        },
        {
            name: 'Status',
            selector: (row: { status: string }) => row.status,
            sortable: true,
        },
        {
            name: 'Upvotes',
            selector: (row: { upvotes: number }) => row.upvotes,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row: IIssue) => (
                <div className="d-flex align-items-center">
                    <Button color="primary" size="sm" onClick={() => navigate(`/authority/issues/${row.id}`)}>
                        <Eye size={14} /> View
                    </Button>
                    <Button
                        color="warning"
                        size="sm"
                        className="mx-1"
                        onClick={() => handleAssignTeam(row.id)}
                    >
                        <Plus size={14} /> Assign Team
                    </Button>
                    <UncontrolledDropdown>
                        <DropdownToggle className="btn btn-sm">
                            <ChevronDown size={14} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => handleChangeStatus(row.id)}>
                                <Edit size={14} /> Change Status
                            </DropdownItem>
                            <DropdownItem onClick={() => handleAddNotes(row.id)}>
                                <Plus size={14} /> Add Notes
                            </DropdownItem>
                            <DropdownItem onClick={() => handleDeleteIssue(row.id)}>
                                <Trash size={14} /> Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
            ),
        },
    ];

    useEffect(() => {
        // Mock data or fetch from API
        const mockData = [
            {
                id: 1,
                description: 'Pothole on Main Street',
                address: '123 Main St, Cityville',
                submittedBy: 'John Doe',
                priority: 'Critical',
                status: 'Pending',
                upvotes: 10,
            },
            {
                id: 2,
                description: 'Broken streetlight',
                address: '456 Elm St, Cityville',
                submittedBy: 'Jane Smith',
                priority: 'Moderate',
                status: 'In Progress',
                upvotes: 8,
            },
        ];
        setIssues(mockData);
        setFilteredIssues(mockData);
        calculateStats(mockData);
    }, []);

    const calculateStats = (data: IIssue[]) => {
        const total = data.length;
        const pending = data.filter((issue) => issue.status === 'Pending').length;
        const inProgress = data.filter((issue) => issue.status === 'In Progress').length;
        const resolved = data.filter((issue) => issue.status === 'Resolved').length;
        const critical = data.filter((issue) => issue.priority === 'Critical').length;
        setStats({ total, pending, inProgress, resolved, critical });
    };

    const handleFilterChange = (key: string, value: string | Date | null) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        let data = issues;

        if (filters.priority) {
            data = data.filter((issue) => issue.priority === filters.priority);
        }
        if (filters.status) {
            data = data.filter((issue) => issue.status === filters.status);
        }

        setFilteredIssues(data);
    }, [filters, issues]);

    const handleAssignTeam = (id: number) => {
        // Open modal to assign team
    };

    const handleChangeStatus = (id: number) => {
        // Open modal or dropdown to change status
    };

    const handleAddNotes = (id: number) => {
        // Open modal to add internal notes
    };

    const handleDeleteIssue = (id: number) => {
        // API call to delete the issue
    };

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            minHeight: '44px', // Set the minimum height
        }),
        menu: (provided: any) => ({
            ...provided,
            minHeight: '100px', // Minimum height for the dropdown menu
        }),
    };

    return (
        <div className="container main-board">
            <Row className="my-3">
                <Col>
                    <h3>Authority Dashboard</h3>
                </Col>
            </Row>
            <Row>
                <Col md={3}>
                    <Card className="bg-primary">
                        <CardBody>
                            <div className="text-white">
                                <h6 className="text-uppercase mb-3 font-size-16 text-white">Total Issues</h6>
                                <h2 className="mb-4 text-white">1,587</h2>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-warning">
                        <CardBody>
                            <div className="text-white">
                                <h6 className="text-uppercase mb-3 font-size-16 text-white">Pending Issues</h6>
                                <h2 className="mb-4 text-white">10</h2>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-success">
                        <CardBody>
                            <div className="text-white">
                                <h6 className="text-uppercase mb-3 font-size-16 text-white">Resolved Issues</h6>
                                <h2 className="mb-4 text-white">1100</h2>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-info">
                        <CardBody>
                            <div className="text-white">
                                <h6 className="text-uppercase mb-3 font-size-16 text-white">InProgress Issues</h6>
                                <h2 className="mb-4 text-white">1</h2>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row className="my-3">
                <Col md={3}>
                    <Select
                        styles={customStyles}
                        options={[
                            { value: 'Critical', label: 'Critical' },
                            { value: 'Moderate', label: 'Moderate' },
                            { value: 'Low', label: 'Low' },
                        ]}
                        onChange={(e) => handleFilterChange('priority', e?.value || '')}
                        placeholder="Filter by Priority"
                    />
                </Col>
                <Col md={3}>
                    <Select
                        styles={customStyles}
                        options={[
                            { value: 'Pending', label: 'Pending' },
                            { value: 'In Progress', label: 'In Progress' },
                            { value: 'Resolved', label: 'Resolved' },
                        ]}
                        onChange={(e) => handleFilterChange('status', e?.value || '')}
                        placeholder="Filter by Status"
                    />
                </Col>
                <Col md={3}>
                    <DatePicker
                        selected={filters.dateRange.startDate}
                        onChange={(date) => handleFilterChange('startDate', date)}
                        placeholderText="Start Date"
                        className="form-control"
                    />
                </Col>
                <Col md={3}>
                    <DatePicker
                        selected={filters.dateRange.endDate}
                        onChange={(date) => handleFilterChange('endDate', date)}
                        placeholderText="End Date"
                        className="form-control"
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <DataTable
                        title="Reported Issues"
                        data={filteredIssues}
                        responsive
                        className="react-dataTable"
                        noHeader
                        pagination
                        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                        columns={columns}
                        sortIcon={<ChevronDown />}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default AuthorityDashboard;
