import { useNavigate } from "react-router-dom";
import { Badge, Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from "reactstrap";
import { useGetTeamIssuesQuery } from "../redux/api/issueAPI";
import { useEffect } from "react";
import { ChevronDown, Layers, MoreVertical } from "react-feather";
import { ITeamIssue } from "../redux/api/types";
import DataTable, { TableColumn } from "react-data-table-component";
import FullScreenLoader from "../components/FullScreenLoader";

const AuthorityTeamAssign: React.FC = () => {
    const navigate = useNavigate();

    const { data: issues, refetch, isLoading } = useGetTeamIssuesQuery({});

    useEffect(() => {
        refetch();
    }, [refetch]);

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

    const columns: TableColumn<ITeamIssue>[] = [
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
                        <DropdownItem className="w-100" onClick={() => navigate(`/authority/team-assigns/assign/${row._id}`)}>
                            <Layers size={14} className="mx-1" />
                            <span className="align-middle mx-2">Team Assign</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            ),
        },
    ];

    return (
        <>
            {isLoading ? (<FullScreenLoader />) : (
                <div className="main-board container">
                    <Row className="my-3">
                        <Col>
                            <h3>Team Assign</h3>
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

    )
}

export default AuthorityTeamAssign;