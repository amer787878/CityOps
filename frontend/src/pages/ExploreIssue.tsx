/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardText,
    CardImg,
    Badge,
    Button,
    Spinner,
} from "reactstrap";
import { useGetExploreIssuesQuery } from "../redux/api/issueAPI";
import { getDateFormat } from "../utils/Utils";
import { Link } from "react-router-dom";

const ExploreIssue: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const issuesPerPage = 12;

    const {
        data: response,
        isLoading,
        refetch,
    } = useGetExploreIssuesQuery({ page: currentPage, limit: issuesPerPage });

    const issues = response?.data || [];
    const totalPages = response?.totalPages || 0;

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
            refetch();
        }
    };

    return (
        <Container className="main-board">
            <h2 className="mb-4 text-center">Explore Issues</h2>

            {isLoading ? (
                <div className="text-center">
                    <Spinner color="primary" />
                    <p>Loading issues...</p>
                </div>
            ) : (
                <>
                    {issues.length > 0 ? (
                        <Row>
                            {issues.map((issue) => (
                                <Col md={3} sm={6} xs={12} className="mb-4" key={issue._id}>
                                    <Card className="h-100 shadow-sm d-flex flex-column">
                                        <CardImg
                                            top
                                            src={
                                                issue.photoUrl ||
                                                "https://via.placeholder.com/150" // Placeholder if no image is available
                                            }
                                            alt={"Issue Image"}
                                            style={{
                                                height: "200px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <CardBody className="d-flex flex-column">
                                            <div className="mb-3">
                                                <Badge
                                                    color="info"
                                                    className="me-2"
                                                >
                                                    {issue.category}
                                                </Badge>
                                                <Badge
                                                    color={
                                                        issue.status === "Open"
                                                            ? "success"
                                                            : "danger"
                                                    }
                                                >
                                                    {issue.status}
                                                </Badge>
                                            </div>
                                            <CardText className="text-muted">
                                                <strong>Created:</strong> {getDateFormat(issue.createdAt)}
                                            </CardText>
                                            <Button
                                                tag={Link}
                                                to={`/explore-issues/detail/${issue._id}`}
                                                color="primary"
                                                className="mt-auto"
                                                style={{
                                                    borderRadius: "20px",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <p className="text-center">No issues found.</p>
                    )}

                    {/* Centered Pagination */}
                    <div className="d-flex justify-content-center align-items-center mt-4">
                        <Button
                            color="secondary"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="me-3"
                        >
                            Previous
                        </Button>
                        <p className="mb-0">
                            Page {currentPage} of {totalPages}
                        </p>
                        <Button
                            color="secondary"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="ms-3"
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </Container>
    );
};

export default ExploreIssue;
