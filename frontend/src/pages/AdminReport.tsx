/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Button,
  Alert,
} from "reactstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GooglePlacesAutocomplete from "react-google-autocomplete";
import { useGetAdminReportQuery } from "../redux/api/reportAPI";

interface UserActivityData {
  name: string;
  issues: number;
  comments: number;
}

interface IssueStatisticsData {
  category: string;
  totalIssues: number;
  resolvedIssues: number;
}

interface EngagementData {
  issue: string;
  upvotes: number;
  comments: number;
}

type ReportData = UserActivityData | IssueStatisticsData | EngagementData;

interface Filters {
  startDate: Date | null;
  endDate: Date | null;
  userRole: string;
  location: string;
  reportType: "userActivity" | "issueStatistics" | "engagement";
}

const AdminReport: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    startDate: null,
    endDate: null,
    userRole: "",
    location: "",
    reportType: "userActivity",
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [columns, setColumns] = useState<TableColumn<ReportData>[]>([]);

  const { data, refetch, isError, isLoading } = useGetAdminReportQuery({
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
    userRole: filters.userRole,
    location: filters.location,
    reportType: filters.reportType,
  });

  const reportData: ReportData[] = data?.success && Array.isArray(data.chartData) ? data.chartData : [];

  const handleFilterChange = (name: keyof Filters, value: any) => {
    if (name === "startDate" && filters.endDate && value instanceof Date && value > filters.endDate) {
      setValidationError("Start Date cannot be greater than End Date.");
      return;
    }

    if (name === "endDate" && filters.startDate && value instanceof Date && filters.startDate > value) {
      setValidationError("End Date cannot be earlier than Start Date.");
      return;
    }

    setValidationError(null);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const updateColumns = (reportType: Filters["reportType"]) => {
    let dynamicColumns: TableColumn<ReportData>[] = [];

    if (reportType === "userActivity") {
      dynamicColumns = [
        { name: "Name", selector: (row) => (row as UserActivityData).name, sortable: true },
        { name: "Issues Submitted", selector: (row) => (row as UserActivityData).issues, sortable: true },
        { name: "Comments Posted", selector: (row) => (row as UserActivityData).comments, sortable: true },
      ];
    } else if (reportType === "issueStatistics") {
      dynamicColumns = [
        { name: "Category", selector: (row) => (row as IssueStatisticsData).category, sortable: true },
        { name: "Total Issues", selector: (row) => (row as IssueStatisticsData).totalIssues, sortable: true },
        { name: "Resolved Issues", selector: (row) => (row as IssueStatisticsData).resolvedIssues, sortable: true },
      ];
    } else if (reportType === "engagement") {
      dynamicColumns = [
        { name: "Issue", selector: (row) => (row as EngagementData).issue, sortable: true },
        { name: "Upvotes", selector: (row) => (row as EngagementData).upvotes, sortable: true },
        { name: "Comments", selector: (row) => (row as EngagementData).comments, sortable: true },
      ];
    }

    setColumns(dynamicColumns);
  };


  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Report Data", 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [columns.map((col) => col.name as string)],
      body: reportData.map((row: any) =>
        columns.map((col) => (col.selector ? col.selector(row) : ""))
      ),
    });

    doc.save(`${filters.reportType}_report.pdf`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map((row: any) =>
        columns.reduce((acc, col) => {
          acc[col.name as string] = col.selector ? col.selector(row) : "";
          return acc;
        }, {} as Record<string, any>)
      )
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
    XLSX.writeFile(workbook, `${filters.reportType}_report.xlsx`);
  };

  useEffect(() => {
    updateColumns(filters.reportType);
  }, [filters.reportType]);

  return (
    <Container className="main-board">
      <Row>
        <Col md={3}>
          <Card>
            <CardBody>
              <h5>Filters</h5>
              <Form>
                {validationError && (
                  <Alert color="danger" className="mb-3">
                    {validationError}
                  </Alert>
                )}
                <FormGroup>
                  <Label for="startDate">Start Date</Label>
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => handleFilterChange("startDate", date)}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                    placeholderText="Select start date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="endDate">End Date</Label>
                  <div>
                    <DatePicker
                      selected={filters.endDate}
                      onChange={(date) => handleFilterChange("endDate", date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                      placeholderText="Select end date"
                    />
                  </div>

                </FormGroup>
                <FormGroup>
                  <Label for="reportType">Report Type</Label>
                  <select
                    id="reportType"
                    value={filters.reportType}
                    className="form-control"
                    onChange={(e) => handleFilterChange("reportType", e.target.value)}
                  >
                    <option value="userActivity">User Activity</option>
                    <option value="issueStatistics">Issue Statistics</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <Label for="userRole">User Role</Label>
                  <select
                    id="userRole"
                    value={filters.userRole}
                    className="form-control"
                    onChange={(e) => handleFilterChange("userRole", e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="Citizen">Citizen</option>
                    <option value="Authority">Authority</option>
                    <option value="Admin">Admin</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <Label for="location">Location</Label>
                  <GooglePlacesAutocomplete
                    apiKey={process.env.REACT_APP_GOOGLE_API_KEY || ""}
                    className="form-control"
                    onPlaceSelected={(place) =>
                      handleFilterChange("location", place.formatted_address || "")
                    }
                    options={{
                      types: ["address"],
                      componentRestrictions: { country: "IL" },
                    }}
                  />
                </FormGroup>
                <Button color="primary" block onClick={refetch} disabled={!!validationError}>
                  Apply Filters
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col md={9}>
          <Card>
            <CardBody>
              <h5>Report Data</h5>
              {isLoading ? (
                <p>Loading...</p>
              ) : isError ? (
                <Alert color="danger">Error loading data. Please try again later.</Alert>
              ) : (
                <>
                  <DataTable
                    columns={columns}
                    data={reportData}
                    pagination
                    highlightOnHover
                  />
                  <div className="d-flex justify-content-end mt-3">
                    <Button color="success" className="me-2" onClick={exportToExcel}>
                      Export to Excel
                    </Button>
                    <Button color="danger" onClick={exportToPDF}>
                      Export to PDF
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminReport;
