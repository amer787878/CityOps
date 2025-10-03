/* eslint-disable react-hooks/exhaustive-deps */
import {
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledDropdown,
    Input,
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

const MyIssues: React.FC = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<{ category?: string; location?: string; priority?: string }>({});

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
            High: 'info',
            Medium: 'success',
            Low: 'primary',
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
                        <Col md={4}>
                            <Select
                                styles={customStyles}
                                options={[
                                    { value: 'High', label: 'High' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'Low', label: 'Low' },
                                ]}
                                onChange={(e) => handleFilterChange('priority', e?.value || '')}
                                placeholder="Filter by Priority"
                            />
                        </Col>
                        <Col md={4}>
                            <Input
                                type="text"
                                placeholder="Filter by Location"
                                onChange={(e) => handleFilterChange('location', e.target.value)}
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
