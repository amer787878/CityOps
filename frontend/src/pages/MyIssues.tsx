import React, { useState, useEffect } from 'react';
import {
    Col,
    Row,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from "reactstrap";
import DataTable from "react-data-table-component";
import { ChevronDown, Eye, MoreVertical } from "react-feather";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { IIssue } from '../redux/api/types';

const MyIssues: React.FC = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState<IIssue[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<IIssue[]>([]);
    const [filters, setFilters] = useState({
        priority: '',
        status: '',
    });

    const paginationRowsPerPageOptions = [15, 30, 50, 100];

    const columns = () => [
        {
            name: "Issue ID",
            selector: (row: { _id: number }) => row._id,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row: { description: string }) => row.description,
            sortable: true,
            grow: 2,
        },
        {
            name: "Address",
            selector: (row: { address: string }) => row.address,
            sortable: true,
        },
        {
            name: "Priority",
            selector: (row: { priority: string }) => row.priority,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: { status: string }) => row.status,
            sortable: true,
        },
        {
            name: "Date Submitted",
            selector: (row: { dateSubmitted: string }) => row.dateSubmitted,
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row: IIssue) => (
                <div>
                    <UncontrolledDropdown>
                        <DropdownToggle tag="div" className="btn btn-sm">
                            <MoreVertical size={14} className="cursor-pointer action-btn" />
                        </DropdownToggle>
                        <DropdownMenu end container="body">
                            <DropdownItem
                                className="w-100"
                                onClick={() => navigate(`/citizen/issue-detail/${row._id}`)}
                            >
                                <Eye size={14} className="mx-1" />
                                <span className="align-middle mx-2">View Details</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
            ),
        },
    ];

    useEffect(() => {
        // Mock data (Replace this with API call)
        const mockData = [
            {
                _id: 1,
                description: "Pothole on Main Street",
                address: "123 Main St, Cityville",
                priority: "Critical",
                status: "Pending",
                dateSubmitted: "2024-12-10",
            },
            {
                _id: 2,
                description: "Broken streetlight on Elm Ave",
                address: "456 Elm Ave, Cityville",
                priority: "Moderate",
                status: "Resolved",
                dateSubmitted: "2024-12-09",
            },
        ];
        setIssues(mockData);
        setFilteredIssues(mockData);
    }, []);

    const handleFilterChange = (key: string, value: string) => {
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

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            minHeight: "44px",
        }),
        menu: (provided: any) => ({
            ...provided,
            minHeight: "100px",
        }),
    };

    return (
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
                            { value: "Critical", label: "Critical" },
                            { value: "Moderate", label: "Moderate" },
                            { value: "Low", label: "Low" },
                        ]}
                        onChange={(e) => handleFilterChange("priority", e?.value || "")}
                        placeholder="Filter by Priority"
                    />
                </Col>
                <Col md={4}>
                    <Select
                        styles={customStyles}
                        options={[
                            { value: "Pending", label: "Pending" },
                            { value: "Resolved", label: "Resolved" },
                        ]}
                        onChange={(e) => handleFilterChange("status", e?.value || "")}
                        placeholder="Filter by Status"
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <DataTable
                        title="Issues"
                        data={filteredIssues}
                        responsive
                        className="react-dataTable"
                        noHeader
                        pagination
                        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                        columns={columns()}
                        sortIcon={<ChevronDown />}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default MyIssues;
