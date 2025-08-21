import { Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from "reactstrap";
import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';
import { CheckSquare, ChevronDown, Eye, MoreVertical } from 'react-feather';
import Select from 'react-select';
import { Input } from 'reactstrap';
import { useNavigate } from "react-router-dom";

interface IIssue {
    id: number;
    description: string;
    address: string;
    priority: string;
    status: string;
    upvotes: number;
}

const Issues: React.FC = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState<IIssue[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<IIssue[]>([]);
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        priority: ''
    });

    const paginationRowsPerPageOptions = [15, 30, 50, 100];

    const columns = () => [
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
                <div>
                    <UncontrolledDropdown>
                        <DropdownToggle tag="div" className="btn btn-sm">
                            <MoreVertical size={14} className="cursor-pointer action-btn" />
                        </DropdownToggle>
                        <DropdownMenu end container="body">
                            <DropdownItem className="w-100" onClick={() => handleUpvote(row.id)}>
                                <CheckSquare size={14} className="mx-1" />
                                <span className="align-middle mx-2">Upvote</span>
                            </DropdownItem>
                            <DropdownItem className="w-100" onClick={() => navigate(`/citizen/issue-detail/${row.id}`)}>
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
        // Mock data or fetch from API
        const mockData = [
            {
                id: 1,
                description: 'Pothole on Main Street',
                address: '123 Main St, Cityville',
                priority: 'High',
                status: 'Open',
                upvotes: 5,
            },
            {
                id: 2,
                description: 'Broken streetlight on Elm Ave',
                address: '456 Elm Ave, Cityville',
                priority: 'Medium',
                status: 'In Progress',
                upvotes: 3,
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

        setFilteredIssues(data);
    }, [filters, issues]);

    const handleUpvote = (id: number) => {
        setIssues((prev) =>
            prev.map((issue) =>
                issue.id === id ? { ...issue, upvotes: issue.upvotes + 1 } : issue
            )
        );
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

export default Issues;
