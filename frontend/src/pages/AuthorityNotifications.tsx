/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Button,
    Card,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledDropdown,
} from "reactstrap";
import { useEffect, useState } from "react";
import Select from "react-select";
import DataTable, { TableColumn } from "react-data-table-component";
import { toast } from "react-toastify";
import { Bookmark, ChevronDown, MoreVertical } from "react-feather";
import { useGetNotificationsQuery } from "../redux/api/notificationAPI";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // Flatpickr theme
import FullScreenLoader from "../components/FullScreenLoader";
import { getDateFormat } from "../utils/Utils";

const AuthorityNotifications: React.FC = () => {
    const navigate = useNavigate();
    const [type, setType] = useState<string>("");

    // Initial date range state
    const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date(new Date().setDate(new Date().getDate() + 1))]);

    const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

    const queryParams = {
        type,
        startDate: formatToYYYYMMDD(dateRange[0]),
        endDate: formatToYYYYMMDD(dateRange[1]),
    };

    const { data: notifications = [], refetch, isLoading } = useGetNotificationsQuery(queryParams);

    useEffect(() => {
        refetch();
    }, [type, dateRange]);

    const handleMarkAsRead = (id: string) => {
        // Simulate marking notification as read
        toast.success("Notification marked as read.");
    };

    const typeOptions = [
        { value: "New Comment", label: "New Comment" },
        { value: "Critical Issue Reported", label: "Critical Issue Reported" },
    ];

    const handleTypeChange = (selectedOption: any) => {
        setType(selectedOption?.value || "");
    };

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

    const renderBadge = (type: 'read', value: boolean) => {
        const badgeColor = value ? "primary": "danger";
        const badgeName = value ? "Read": "Unread";
        return (
            <Badge color={badgeColor || 'secondary'} className="px-3 py-2" pill>
                {badgeName}
            </Badge>
        );
    };

    const columns: TableColumn<any>[] = [
        {
            name: "Content",
            selector: (row) => row.message,
            sortable: true,
        },
        {
            name: "Type",
            selector: (row) => row.type,
            sortable: true,
        },
        {
            name: "Issue ID",
            selector: (row) => row.issue?.issueNumber,
            cell: (row) => (
                <a href={`/issues/${row.issue?._id}`} className="text-primary">
                    {row.issue?.issueNumber}
                </a>
            ),
        },
        {
            name: "Timestamp",
            selector: (row) => getDateFormat(row.createdAt),
            sortable: true,
        },
        {
            name: "Read",
            cell: (row) => renderBadge('read', row.read),
        },
        {
            name: 'Actions',
            width: '120px',
            cell: (row) => (
                <>
                    {!row.read && (
                        <UncontrolledDropdown>
                            <DropdownToggle tag="div" className="btn btn-sm">
                                <MoreVertical size={14} className="cursor-pointer action-btn" />
                            </DropdownToggle>
                            <DropdownMenu end container="body">
                                <DropdownItem onClick={() => handleMarkAsRead(row.id)}>
                                    <Bookmark size={14} className="mx-1" />
                                    <span className="align-middle mx-2">Mark as Read</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}
                </>
            ),
        },
    ];

    return (
        <>
            {isLoading ? (<FullScreenLoader />) : (
                <div className="main-board container">
                    <Row className="my-3">
                        <Col>
                            <h3 className="mb-3">Notifications</h3>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Select
                                styles={customStyles}
                                options={typeOptions}
                                onChange={handleTypeChange}
                                placeholder="Filter by Type"
                            />
                        </Col>
                        <Col md={4}>
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
                    </Row>

                    <Row>
                        <Col>
                            <Card>
                                <DataTable
                                    title="Notifications"
                                    data={notifications}
                                    columns={columns}
                                    responsive
                                    noHeader
                                    pagination
                                    paginationRowsPerPageOptions={[10, 20, 50]}
                                    sortIcon={<ChevronDown />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </>

    );
};

export default AuthorityNotifications;
