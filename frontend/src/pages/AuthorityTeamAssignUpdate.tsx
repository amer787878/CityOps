/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Card, CardBody, Form, Button, Input, Col, Row } from "reactstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import { ITeam, ITeamAssignRequest } from "../redux/api/types";
import { useGetTeamsQuery } from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useAssignTeamMutation, useGetIssueQuery } from "../redux/api/issueAPI";
import FullScreenLoader from "../components/FullScreenLoader";

const AuthorityTeamAssignUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: issue, refetch: refetchIssue, isLoading: isIssueLoading } = useGetIssueQuery(id ?? "", {
        skip: !id,
    });

    const [assignTeam, { isLoading, isSuccess, error, isError, data }] = useAssignTeamMutation();

    const { data: teams = [], refetch, isLoading: isTeamLoading } = useGetTeamsQuery();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(""); // Define the searchQuery state

    const { handleSubmit } = useForm<ITeamAssignRequest>();

    useEffect(() => {
        if (issue?.team) {
            setSelectedTeamId(issue.team._id); // Pre-select the assigned team
        }
    }, [issue]);

    useEffect(() => {
        refetch();
        refetchIssue();
    }, [refetch, refetchIssue]);

    const onSubmit: SubmitHandler<ITeamAssignRequest> = () => {
        if (!selectedTeamId) {
            toast.error("Please select a team to assign.");
            return;
        }

        // const selectedTeam = teams.find((team) => team._id === selectedTeamId);
        // console.log("Assigned Data:", { issueId: issue?._id, team: selectedTeam });
        assignTeam({ id: issue?._id, data: { teamId: selectedTeamId } });
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value); // Update searchQuery state
    };

    const handleAssignClick = (team: ITeam) => {
        if (team._id === selectedTeamId) {
            toast.info(`Team "${team.name}" is already assigned.`);
            return;
        }
        setSelectedTeamId(team._id);
        toast.info(`Selected Team: ${team.name}`);
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
        }
        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: any) =>
                    toast.error(el.message, {
                        position: "top-right",
                    })
                );
            } else {
                const errorMsg =
                    (error as any)?.data?.message || (error as any)?.data || "Assignment failed";
                toast.error(errorMsg, {
                    position: "top-right",
                });
            }
        }
    }, [isLoading, isSuccess, isError, error, data]);

    // Using useMemo to filter teams based on searchQuery
    const filteredTeams = useMemo(() => {
        return teams.filter((team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teams, searchQuery]);

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
                <div className="d-flex align-items-center">
                    <Button
                        color={row.availability !== "Available" || selectedTeamId === row._id ? "success" : "primary"}
                        size="sm"
                        disabled={row.availability !== "Available" || selectedTeamId === row._id}
                        onClick={() => handleAssignClick(row)}
                    >
                        {selectedTeamId === row._id ? "Assigned" : "Assign"}
                    </Button>
                    {selectedTeamId === row._id && (
                        <span className="text-success ms-2">✔ Currently Assigned</span>
                    )}
                </div>
            ),
        },
    ];

    if (isIssueLoading || isTeamLoading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="main-board container">
            <h3 className="my-3">Assign Team</h3>
            <Card className="p-3">
                <CardBody>
                    {/* Issue Details */}
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
                                        <img
                                            src={issue.photoUrl}
                                            className="img-fluid rounded"
                                            alt="issue"
                                            style={{ maxWidth: "300px", maxHeight: "200px" }}
                                            draggable="false"
                                        />
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

                    {/* DataTable */}
                    <DataTable
                        columns={columns}
                        data={filteredTeams}
                        pagination
                        highlightOnHover
                        progressPending={isTeamLoading}
                        noDataComponent={<div>No teams found</div>}
                    />

                    {/* Confirm Assignment Button */}
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
