import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Button, Alert } from 'reactstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ReportData {
  id: string;
  name: string;
  value: string;
  details?: string;
}

interface Filters {
  startDate: Date | null;
  endDate: Date | null;
  userRole: string;
  location: string;
}

const AdminReport: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    startDate: null,
    endDate: null,
    userRole: '',
    location: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const [reportData, setReportData] = useState<ReportData[]>([
    { id: '1', name: 'John Doe', value: 'Issues Submitted: 10', details: 'Details about activity' },
    { id: '2', name: 'Jane Smith', value: 'Comments Posted: 20', details: 'Details about engagement' },
  ]);

  const columns: TableColumn<ReportData>[] = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Value',
      selector: (row) => row.value,
      sortable: true,
    },
    {
      name: 'Details',
      selector: (row) => row.details || 'N/A',
      sortable: false,
    },
  ];

  const handleFilterChange = (name: keyof Filters, value: Date | string | null) => {
    if (name === 'startDate' && filters.endDate && value instanceof Date && value > filters.endDate) {
      setValidationError('Start Date cannot be greater than End Date.');
      return;
    }

    if (name === 'endDate' && filters.startDate && value instanceof Date && filters.startDate > value) {
      setValidationError('End Date cannot be earlier than Start Date.');
      return;
    }

    setValidationError(null);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    console.log(filters)
    // Fetch and filter data based on filters
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('System-Wide Analytics Report', 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Name', 'Value', 'Details']],
      body: reportData.map((row) => [row.id, row.name, row.value, row.details || 'N/A']),
    });

    doc.save('report.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, 'report.xlsx');
  };

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
                    onChange={(date) => handleFilterChange('startDate', date)}
                    dateFormat="yyyy-MM-dd"
                    className="form-control w-100"
                    placeholderText="Select start date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="endDate">End Date</Label>
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    dateFormat="yyyy-MM-dd"
                    className="form-control w-100"
                    placeholderText="Select end date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="userRole">User Role</Label>
                  <select
                    name="userRole"
                    id="userRole"
                    value={filters.userRole}
                    className="form-control"
                    onChange={(e) => handleFilterChange('userRole', e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <Label for="location">Location</Label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="Enter location"
                    value={filters.location}
                    className="form-control"
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </FormGroup>
                <Button color="primary" onClick={applyFilters} block>
                  Apply Filters
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md={9}>
          <Card>
            <CardBody>
              <h5>System-Wide Reports</h5>
              <DataTable
                columns={columns}
                data={reportData}
                pagination
                responsive
              />
              <Row className="mt-3">
                <Col>
                  <Button color="secondary" onClick={exportToPDF}>
                    Download as PDF
                  </Button>{' '}
                  <Button color="secondary" onClick={exportToExcel}>
                    Export to Excel
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminReport;
