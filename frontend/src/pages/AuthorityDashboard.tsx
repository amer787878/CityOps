/* eslint-disable react-hooks/exhaustive-deps */
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
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from 'reactstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { Archive, ChevronDown, Eye, MoreVertical, Trash } from 'react-feather';
import { useDeleteIssueMutation, useGetIssuesQuery } from '../redux/api/issueAPI';
import FullScreenLoader from '../components/FullScreenLoader';
import { IIssue } from '../redux/api/types';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import GooglePlacesAutocomplete from 'react-google-autocomplete';
import { toast } from 'react-toastify';

const AuthorityDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalDeleteVisibility, setModalDeleteVisibility] = useState<boolean>(false);

    const [deleteIssue] = useDeleteIssueMutation();

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
        })(),
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

    const toggleDeleteModal = (id: string | null = null) => {
        setSelectedId(id);
        setModalDeleteVisibility(!modalDeleteVisibility);
    };

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

    // Only re-fetch when filters or issues data change
    useEffect(() => {
        if (filters) {
            refetch();
        }
    }, [filters, refetch]);

    useEffect(() => {
        if (issues) {
            calculateStats(issues); // Calculate statistics based on the issues
        }
    }, [issues]);

    const renderBadge = (type: 'priority' | 'status', value: string) => {
        const badgeColors: Record<string, string> = {
            Low: 'primary',
            Moderate: 'info',
            Critical: 'danger',
            'In Progress': 'primary',
            Pending: 'warning',
            Resolved: 'success',
            Closed: 'danger',  // color for Closed status
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
            selector: (row) =>
                row.description.length > 30
                    ? `${row.description.substring(0, 30)}...`
                    : row.description,
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
            selector: (row) => row.upvoteCount,
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
                        <DropdownItem onClick={() => navigate(`/authority/issue-detail/${row._id}`)}>
                            <Eye size={14} className="mx-1" />
                            <span className="align-middle mx-2">View</span>
                        </DropdownItem>
                        <DropdownItem
                            className="w-100"
                            onClick={() => navigate(`/authority/issues-update/${row._id}`)}
                        >
                            <Archive size={14} className="mx-1" />
                            <span className="align-middle mx-2">Edit</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => toggleDeleteModal(row._id)}>
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
        const resolved = data.filter((issue) => issue.status === 'Resolved' || issue.status === 'Closed').length;
        const critical = data.filter((issue) => issue.priority === 'Critical').length;
        if (
            stats.total !== total ||
            stats.pending !== pending ||
            stats.inProgress !== inProgress ||
            stats.resolved !== resolved ||
            stats.critical !== critical
        ) {
            setStats({ total, pending, inProgress, resolved, critical });
        }
    };

    // Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleDeleteIssue = async () => {
        try {
            if (selectedId) {
                await deleteIssue(selectedId).unwrap();
                toast.success('Issue deleted successfully');
                refetch();
            }
        } catch (error: any) {
            toast.error(`${error.message || error.data.message}`);
        } finally {
            setModalDeleteVisibility(false);
        }
    };

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
                                    { value: 'Streetlight Maintenance', label: 'Streetlight Maintenance' },
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
                                    handleFilterChange('location', place.formatted_address || '');
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

                    <Modal isOpen={modalDeleteVisibility} toggle={() => toggleDeleteModal()}>
                        <ModalHeader toggle={() => toggleDeleteModal()}>Delete Confirmation</ModalHeader>
                        <ModalBody>Are you sure you want to delete?</ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={handleDeleteIssue}>Delete</Button>
                            <Button color="secondary" onClick={() => toggleDeleteModal()} outline>No</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default AuthorityDashboard;
