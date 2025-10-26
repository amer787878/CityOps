/* eslint-disable react-hooks/exhaustive-deps */
import {
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledDropdown,
    Badge,
} from "reactstrap";
import DataTable, { TableColumn } from 'react-data-table-component';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Edit, Eye, MoreVertical } from 'react-feather';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { useGetMyIssuesQuery } from "../redux/api/issueAPI";
import FullScreenLoader from "../components/FullScreenLoader";
import { IIssue } from "../redux/api/types";
import GooglePlacesAutocomplete from 'react-google-autocomplete';

const MyIssues: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<{ status?: string; address?: string; priority?: string }>({});

    const { data: issues, refetch, isLoading } = useGetMyIssuesQuery(filters);

    useEffect(() => {
        refetch();
    }, [refetch, filters]);

    const handleFilterChange = useCallback(
        (key: keyof typeof filters, value: string) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const renderBadge = (type: 'priority' | 'status', value: string) => {
        const badgeColors: Record<string, string> = {
            Critical: 'danger',
            Moderate: 'info',
            Low: 'secondary',
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

    const columns: TableColumn<IIssue>[] = [
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
            selector: (row) => row.priority,
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
            cell: (row) => (
                <UncontrolledDropdown>
                    <DropdownToggle tag="div" className="btn btn-sm">
                        <MoreVertical size={14} className="cursor-pointer action-btn" />
                    </DropdownToggle>
                    <DropdownMenu end container="body">
                        <DropdownItem className="w-100" onClick={() => navigate(`/citizen/issues-update/${row._id}`)}>
                            <Edit size={14} className="mx-1" />
                            <span className="align-middle mx-2">Update</span>
                        </DropdownItem>
                        <DropdownItem
                            className="w-100"
                            onClick={() => navigate(`/citizen/issue-detail/${row._id}`)}
                        >
                            <Eye size={14} className="mx-1" />
                            <span className="align-middle mx-2">View Details</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

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
                <div className="main-board container">
                    <Row className="my-3">
                        <Col>
                            <h3 className="mb-3">My Issues</h3>
                        </Col>
                    </Row>
                    <Row className="my-3">
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
                                isClearable={true}
                            />
                        </Col>
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
                                isClearable={true}
                            />
                        </Col>
                        <Col md={3}>
                            <GooglePlacesAutocomplete
                                apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                                className={`form-control`}
                                onPlaceSelected={(place) => {
                                    handleFilterChange('address', place.formatted_address || '');
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
                                title="Issues"
                                data={issues || []}
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

export default MyIssues;
