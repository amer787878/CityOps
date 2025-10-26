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
import { CheckSquare, ChevronDown, Eye, MoreVertical } from 'react-feather';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { useGetIssuesQuery, useUpvoteIssueMutation } from "../redux/api/issueAPI";
import FullScreenLoader from "../components/FullScreenLoader";
import { IIssue } from "../redux/api/types";
import { toast } from 'react-toastify';
import GooglePlacesAutocomplete from 'react-google-autocomplete';

const Issues: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<{ category?: string; location?: string; priority?: string }>({});

    const { data: issues, refetch, isLoading } = useGetIssuesQuery(filters);
    const [upvoteIssue] = useUpvoteIssueMutation();

    useEffect(() => {
        refetch();
    }, [refetch, filters]);

    const handleFilterChange = useCallback(
        (key: keyof typeof filters, value: string) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const handleUpvote = useCallback(async (id: string) => {
        console.log(`Upvoted issue with ID: ${id}`);
        try {
            await upvoteIssue(id).unwrap();
            toast.success('Issue upvoted successfully!');
            refetch();
        } catch (error: any) {
            toast.error(`${error.message || error.data.message}`);
        }
    }, []);

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

    const columns: TableColumn<IIssue>[] = [
        {
            name: 'Issue ID',
            selector: (row) => row.issueNumber,
            sortable: true,
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
            cell: (row) => (
                <UncontrolledDropdown>
                    <DropdownToggle tag="div" className="btn btn-sm">
                        <MoreVertical size={14} className="cursor-pointer action-btn" />
                    </DropdownToggle>
                    <DropdownMenu end container="body">
                        <DropdownItem className="w-100" onClick={() => handleUpvote(row._id)}>
                            <CheckSquare size={14} className="mx-1" />
                            <span className="align-middle mx-2">Upvote</span>
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
                            <h3 className="mb-3">Community Issues</h3>
                            <a href="/citizen/issues-submission" className="btn btn-primary">
                                Submit an Issue
                            </a>
                        </Col>
                    </Row>
                    <Row className="my-3">
                        <Col md={4}>
                            <Select
                                styles={customStyles}
                                options={[
                                    { value: 'Road Maintenance', label: 'Road Maintenance' },
                                    { value: 'Waste Disposal', label: 'Waste Disposal' },
                                    { value: 'Streetlight Maintenance', label: 'Streetlight Maintenance' },
                                ]}
                                onChange={(e) => handleFilterChange('category', e?.value || '')}
                                placeholder="Filter by Category"
                                isClearable={true}
                            />
                        </Col>
                        <Col md={4}>
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
                        <Col md={4}>
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

export default Issues;
