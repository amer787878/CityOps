import React, { useState, useEffect } from 'react';
import {
    Col,
    Row,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
    Card,
    CardBody,
    Badge,
} from 'reactstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Edit, Eye, MoreVertical, Plus, Trash } from 'react-feather';
import { useGetIssuesQuery } from '../redux/api/issueAPI';
import FullScreenLoader from '../components/FullScreenLoader';
import { IIssue } from '../redux/api/types';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import GooglePlacesAutocomplete from 'react-google-autocomplete';

const AuthorityDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState<[Date, Date]>([
        (() => {
            const date = new Date();
            date.setDate(date.getDate() - 15);
            return new Date(date);
        })(),
        (() => {
            const date = new Date();
            date.setDate(date.getDate() + 15);
            return new Date(date);
        })()
    ]);

    const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

    // Filters state
    const [filters, setFilters] = useState({
        priority: '',
        status: '',
        category: '',
        startDate: formatToYYYYMMDD(dateRange[0]),
        endDate: formatToYYYYMMDD(dateRange[1]),
        location: '',
    });

    // Query to fetch issues
    const { data: issues = [], refetch, isLoading } = useGetIssuesQuery(filters);

    // Statistics state
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
    });

    // Re-fetch issues when filters are updated
    useEffect(() => {
        refetch();
        calculateStats(issues); // Calculate statistics based on the issues
    }, [refetch, issues]);

    const renderBadge = (type: 'priority' | 'status', value: string) => {
        const badgeColors: Record<string, string> = {
            Low: 'primary',
            Moderate: 'info',
            Critical: 'danger',
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

    // Define table columns
    const columns: TableColumn<IIssue>[] = [
        {
            name: 'Issue ID',
            selector: (row) => row.issueNumber,
            sortable: true,
            grow: 1,
        },
        {
            name: 'Description',
            selector: (row) => row.description,
            sortable: true,
            grow: 2,
        },
        {
            name: 'Address',
            selector: (row) => row.address,
            sortable: true,
        },
        {
            name: 'Priority',
            cell: (row) => renderBadge('priority', row.priority),
            sortable: true,
        },
        {
            name: 'Category',
            selector: (row) => row?.category,
            sortable: true,
        },
        {
            name: 'Status',
            cell: (row) => renderBadge('status', row.status),
            sortable: true,
        },
        {
            name: 'Upvotes',
            selector: (row) => row.upvotes,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row: IIssue) => (
                <UncontrolledDropdown>
                    <DropdownToggle tag="div" className="btn btn-sm">
                        <MoreVertical size={14} className="cursor-pointer action-btn" />
                    </DropdownToggle>
                    <DropdownMenu end container="body">
                        <DropdownItem onClick={() => navigate(`/authority/issues/${row._id}`)}>
                            <Eye size={14} className="mx-1" />
                            <span className="align-middle mx-2">View</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => handleAssignTeam(row._id)}>
                            <Plus size={14} className="mx-1" />
                            <span className="align-middle mx-2">Assign Team</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => handleChangeStatus(row._id)}>
                            <Edit size={14} className="mx-1" />
                            <span className="align-middle mx-2">Change Status</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => handleAddNotes(row._id)}>
                            <Plus size={14} className="mx-1" />
                            <span className="align-middle mx-2">Add Notes</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => handleDeleteIssue(row._id)}>
                            <Trash size={14} className="mx-1" />
                            <span className="align-middle mx-2">Delete</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

    // Calculate statistics
    const calculateStats = (data: IIssue[]) => {
        const total = data.length;
        const pending = data.filter((issue) => issue.status === 'Pending').length;
        const inProgress = data.filter((issue) => issue.status === 'In Progress').length;
        const resolved = data.filter((issue) => issue.status === 'Resolved').length;
        const critical = data.filter((issue) => issue.priority === 'Critical').length;
        setStats({ total, pending, inProgress, resolved, critical });
    };

    // Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Placeholder event handlers
    const handleAssignTeam = (id: number) => alert(`Assign Team to Issue ID: ${id}`);
    const handleChangeStatus = (id: number) => alert(`Change Status of Issue ID: ${id}`);
    const handleAddNotes = (id: number) => alert(`Add Notes to Issue ID: ${id}`);
    const handleDeleteIssue = (id: number) => alert(`Delete Issue ID: ${id}`);

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            minHeight: '44px',
        }),
        menu: (provided: any) => ({
            ...provided,
            minHeight: '100px',
        }),
    };

    return (
        <>
            {isLoading ? (
                <FullScreenLoader />
            ) : (
                <div className="container main-board">
                    <Row className="my-3">
                        <Col>
                            <h3>Authority Dashboard</h3>
                        </Col>
                    </Row>
                    <Row>
                        {[
                            { label: 'Total Issues', value: stats.total, color: 'bg-primary' },
                            { label: 'Pending Issues', value: stats.pending, color: 'bg-warning' },
                            { label: 'Resolved Issues', value: stats.resolved, color: 'bg-success' },
                            { label: 'In Progress Issues', value: stats.inProgress, color: 'bg-info' },
                        ].map((stat, index) => (
                            <Col md={3} key={index}>
                                <Card className={stat.color}>
                                    <CardBody>
                                        <div className="text-white">
                                            <h6 className="text-uppercase mb-3 font-size-16">
                                                {stat.label}
                                            </h6>
                                            <h2 className="mb-4">{stat.value}</h2>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <Row className="my-3">
                        <Col md={2}>
                            <Select
                                styles={customStyles}
                                options={[
                                    { value: 'Critical', label: 'Critical' },
                                    { value: 'Moderate', label: 'Moderate' },
                                    { value: 'Low', label: 'Low' },
                                ]}
                                onChange={(e) => handleFilterChange('priority', e?.value)}
                                placeholder="Filter by Priority"
                                isClearable={true}
                            />
                        </Col>
                        <Col md={2}>
                            <Select
                                styles={customStyles}
                                options={[
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'In Progress', label: 'In Progress' },
                                    { value: 'Resolved', label: 'Resolved' },
                                ]}
                                onChange={(e) => handleFilterChange('status', e?.value)}
                                placeholder="Filter by Status"
                                isClearable={true}
                            />
                        </Col>
                        <Col md={2}>
                            <Select
                                styles={customStyles}
                                options={[
                                    { value: 'Road Maintenance', label: 'Road Maintenance' },
                                    { value: 'Waste Disposal', label: 'Waste Disposal' },
                                    { value: 'Streetlight Repair', label: 'Streetlight Repair' },
                                ]}
                                onChange={(e) => handleFilterChange('category', e?.value)}
                                placeholder="Filter by Category"
                                isClearable={true}
                            />
                        </Col>
                        <Col md={3}>
                            <Flatpickr
                                options={{
                                    mode: "range",
                                    dateFormat: "Y-m-d",
                                    defaultDate: dateRange,
                                }}
                                value={dateRange}
                                onChange={(selectedDates: Date[]) => {
                                    if (selectedDates.length === 2) {
                                        setDateRange([selectedDates[0], selectedDates[1]]);
                                    }
                                }}
                                className="form-control"
                            />
                        </Col>
                        <Col md={3}>
                            <GooglePlacesAutocomplete
                                apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                                className={`form-control`}
                                onPlaceSelected={(place) => {
                                    handleFilterChange('location',  place.formatted_address || '');
                                }}
                                options={{
                                    types: ['address'],
                                    componentRestrictions: { country: 'IL' },
                                }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable
                                title="Reported Issues"
                                data={issues}
                                responsive
                                className="react-dataTable"
                                noHeader
                                pagination
                                paginationRowsPerPageOptions={[15, 30, 50, 100]}
                                columns={columns}
                                sortIcon={<ChevronDown />}
                            />
                        </Col>
                    </Row>
                </div>
            )}
        </>
    );
};

export default AuthorityDashboard;
