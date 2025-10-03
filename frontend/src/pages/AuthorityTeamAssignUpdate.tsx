import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Card, CardBody, Form, Button, Input, Col, Row } from "reactstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import { ITeam, ITeamAssignRequest } from "../redux/api/types";
import { useGetTeamsQuery } from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useGetIssueQuery } from "../redux/api/issueAPI";
import FullScreenLoader from "../components/FullScreenLoader";

const AuthorityTeamAssignUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: issue, refetch: refetchIssue, isLoading: isIssueLoading } = useGetIssueQuery(id ?? "", {
        skip: !id,
    });
    const { data: teams = [], refetch, isLoading: isTeamLoading } = useGetTeamsQuery();
    const [filteredTeams, setFilteredTeams] = useState<ITeam[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);

    const {
        handleSubmit,
        // setError,
        // clearErrors,
    } = useForm<ITeamAssignRequest>();

    useEffect(() => {
        if (teams) {
            setFilteredTeams(teams);
        }
    }, [teams]);

    useEffect(() => {
        refetch();
        refetchIssue();
    }, [refetch, refetchIssue]);

    // const validateAddress = (address: string) => {
    //     if (!address || address.trim().length === 0) {
    //         setError("address", {
    //             type: "manual",
    //             message: "Address cannot be empty.",
    //         });
    //         return false;
    //     }
    //     clearErrors("address");
    //     return true;
    // };

    const onSubmit: SubmitHandler<ITeamAssignRequest> = () => {
        if (!selectedTeam) {
            toast.error("Please select a team to assign.");
            return;
        }

        // Simulate submission
        console.log("Assigned Data:", { issueId: issue?._id, team: selectedTeam });
        toast.success(`Team "${selectedTeam.name}" successfully assigned to the issue.`);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        const filtered = teams.filter(
            (team) =>
                team.name.toLowerCase().includes(query) ||
                team.category.toLowerCase().includes(query)
        );
        setFilteredTeams(filtered);
    };

    const columns: TableColumn<ITeam>[] = [
        {
            name: "Team ID",
            selector: (row) => row.teamNumber,
            sortable: true,
        },
        {
            name: "Team Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Expertise/Category",
            selector: (row) => row.category,
            sortable: true,
        },
        {
            name: "Availability",
            cell: (row) => (
                <span
                    className={row.availability === "Available" ? "text-success" : "text-danger"}
                >
                    {row.availability}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    disabled={row.availability !== "Available"}
                    onClick={() => handleAssignClick(row)}
                >
                    Assign
                </Button>
            ),
        },
    ];

    const handleAssignClick = (team: ITeam) => {
        setSelectedTeam(team);
        toast.info(`Selected Team: ${team.name}`);
    };

    if (isIssueLoading || isTeamLoading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="main-board container">
            <h3 className="my-3">Assign Team</h3>
            <Card className="p-3">
                <CardBody>
                    <div className="issue-summary mb-4">
                        <h5>Issue Summary</h5>
                        <p>
                            <strong>Issue ID:</strong> {issue?.issueNumber}
                        </p>
                        <p>
                            <strong>Description:</strong> {issue?.description}
                        </p>
                        <p>
                            <strong>Reported By:</strong> {issue?.createdBy?.fullname || "N/A"}
                        </p>
                        <p>
                            <strong>Location:</strong> {issue?.address || "N/A"}
                        </p>
                        <Row>
                            <Col md={6}>
                                {issue?.photoUrl && (
                                    <div className="mb-3">
                                        <h5><strong>Photo:</strong></h5>
                                        <div>
                                            <img
                                                src={issue.photoUrl}
                                                className="img-fluid rounded"
                                                alt="issue"
                                                style={{ maxWidth: "300px", maxHeight: "200px" }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Col>
                            <Col md={6}>
                                {issue?.audioUrl && (
                                    <div className="mb-3">
                                        <h5><strong>Audio:</strong></h5>
                                        <audio controls>
                                            <source src={issue.audioUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-3">
                        <Input
                            type="text"
                            placeholder="Search by team name or category..."
                            onChange={handleSearch}
                            disabled={isTeamLoading}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredTeams}
                        pagination
                        highlightOnHover
                        progressPending={isTeamLoading}
                        noDataComponent={<div>No teams found</div>}
                    />

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="text-end mt-3">
                            <Button type="submit" color="success">
                                Confirm Assignment
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default AuthorityTeamAssignUpdate;
