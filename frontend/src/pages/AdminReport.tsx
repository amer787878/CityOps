import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Button,
  Input,
  Table,
  FormGroup,
  Label,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminReport: React.FC = () => {
  const [reportType, setReportType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // Fetch reports data (mock or API call)
    const mockData = [
      {
        id: 1,
        type: 'User Activity',
        description: 'Issues submitted by users',
        date: '2024-12-01',
        details: 'Detailed user activity report.',
      },
      {
        id: 2,
        type: 'Issue Statistics',
        description: 'Issues by category',
        date: '2024-12-02',
        details: 'Statistics for issues reported.',
      },
      {
        id: 3,
        type: 'Engagement Report',
        description: 'Comments and upvotes on issues',
        date: '2024-12-03',
        details: 'Engagement details.',
      },
    ];
    setReports(mockData);
    setFilteredReports(mockData);
  }, []);

  const handleFilter = () => {
    let filtered = reports;

    if (reportType) {
      filtered = filtered.filter((report) => report.type === reportType);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(
        (report) =>
          new Date(report.date) >= startDate && new Date(report.date) <= endDate
      );
    }

    setFilteredReports(filtered);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // Implement export logic
    alert(`Exporting reports as ${format}`);
  };

  const reportTypeOptions = [
    { value: 'User Activity', label: 'User Activity Report' },
    { value: 'Issue Statistics', label: 'Issue Statistics Report' },
    { value: 'Engagement Report', label: 'Engagement Report' },
  ];

  return (
    <div className="container">
      <Row className="my-3">
        <Col>
          <h3>Admin Reports</h3>
        </Col>
      </Row>
      <Row className="my-3">
        <Col md={4}>
          <FormGroup>
            <Label for="reportType">Report Type</Label>
            <Select
              options={reportTypeOptions}
              onChange={(option) => setReportType(option?.value || null)}
              placeholder="Select Report Type"
            />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup>
            <Label>Date Range</Label>
            <div className="d-flex">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Start Date"
                className="form-control me-2"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="End Date"
                className="form-control"
              />
            </div>
          </FormGroup>
        </Col>
      </Row>
      <Row className="my-3">
        <Col>
          <Button color="primary" onClick={handleFilter} className="me-3">
            Filter
          </Button>
          <Button color="secondary" onClick={() => handleExport('pdf')} className="me-3">
            Export to PDF
          </Button>
          <Button color="secondary" onClick={() => handleExport('excel')}>
            Export to Excel
          </Button>
        </Col>
      </Row>
      <Row className="my-3">
        <Col>
          <Table bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Description</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={report.id}>
                    <td>{index + 1}</td>
                    <td>{report.type}</td>
                    <td>{report.description}</td>
                    <td>{report.date}</td>
                    <td>{report.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default AdminReport;