import React, { useState, useEffect } from 'react';
import { Col, Row, Button, Card, CardBody, Input, Form, FormGroup, Label } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronDown, Edit, Plus, X } from 'react-feather';

interface IStatusHistory {
    status: string;
    timestamp: string;
    updatedBy: string;
}

interface INote {
    id: number;
    author: string;
    timestamp: string;
    content: string;
}

interface IIssue {
    id: number;
    description: string;
    photo?: string;
    audioTranscription?: string;
    address: string;
    priority: string;
    category: string;
    submissionDate: string;
    submittedBy: { name: string; id: number };
    assignedTeam?: string;
    statusHistory: IStatusHistory[];
    notes: INote[];
    location: { lat: number; lng: number };
}

const AuthorityIssueDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [issue, setIssue] = useState<IIssue | null>(null);
    const [newNote, setNewNote] = useState<string>('');

    useEffect(() => {
        // Mock data or fetch issue details from API using `id`
        const mockData: IIssue = {
            id: Number(id),
            description: 'Pothole on Main Street needs urgent repair.',
            photo: '/path/to/photo.jpg',
            audioTranscription: 'Pothole near 123 Main St. Danger for vehicles.',
            address: '123 Main St, Cityville',
            priority: 'Critical',
            category: 'Road Maintenance',
            submissionDate: '2024-12-01',
            submittedBy: { name: 'John Doe', id: 42 },
            assignedTeam: 'Team A',
            statusHistory: [
                { status: 'Pending', timestamp: '2024-12-01 10:00 AM', updatedBy: 'System' },
                { status: 'In Progress', timestamp: '2024-12-03 09:00 AM', updatedBy: 'Admin User' },
            ],
            notes: [
                { id: 1, author: 'Admin User', timestamp: '2024-12-03 09:30 AM', content: 'Team dispatched for inspection.' },
            ],
            location: { lat: 40.712776, lng: -74.005974 },
        };

        setIssue(mockData);
    }, [id]);

    const handleAddNote = () => {
        if (!newNote) return;

        const newNoteObject: INote = {
            id: Date.now(),
            author: 'Admin User',
            timestamp: new Date().toLocaleString(),
            content: newNote,
        };

        setIssue((prev) =>
            prev
                ? { ...prev, notes: [...prev.notes, newNoteObject] }
                : null
        );
        setNewNote('');
    };

    const handleReassignTeam = () => {
        // Logic to reassign team (e.g., open modal or API integration)
        console.log('Reassigning Team...');
    };

    const handleChangeStatus = () => {
        // Logic to change status (e.g., open modal or API integration)
        console.log('Changing Status...');
    };

    const handleCloseIssue = () => {
        // Logic to close issue (e.g., API integration)
        console.log('Closing Issue...');
    };

    if (!issue) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <Row className="my-3">
                <Col>
                    <h3>Issue Details (ID: {issue.id})</h3>
                </Col>
            </Row>
            <Row className="my-3">
                <Col md={8}>
                    <Card>
                        <CardBody>
                            <h5>Description</h5>
                            <p>{issue.description}</p>
                            {issue.photo && (
                                <>
                                    <h5>Photo</h5>
                                    <img src={issue.photo} alt="Issue" className="img-fluid" />
                                </>
                            )}
                            {issue.audioTranscription && (
                                <>
                                    <h5>Audio Transcription</h5>
                                    <p>{issue.audioTranscription}</p>
                                </>
                            )}
                            <h5>Address</h5>
                            <p>{issue.address}</p>
                            {/* <MapContainer
                                // center={[issue.location.lat, issue.location.lng]}
                                zoom={13}
                                style={{ height: '300px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[issue.location.lat, issue.location.lng]} />
                            </MapContainer> */}
                            <h5>Priority</h5>
                            <p>{issue.priority}</p>
                            <h5>Category</h5>
                            <p>{issue.category}</p>
                            <h5>Submission Date</h5>
                            <p>{issue.submissionDate}</p>
                            <h5>Submitted By</h5>
                            <p>{issue.submittedBy.name} (ID: {issue.submittedBy.id})</p>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <CardBody>
                            <h5>Assigned Team</h5>
                            <p>{issue.assignedTeam || 'Unassigned'}</p>
                            <Button color="primary" onClick={handleReassignTeam}>
                                <Plus size={14} /> Reassign Team
                            </Button>
                        </CardBody>
                    </Card>
                    <Card className="mt-3">
                        <CardBody>
                            <h5>Status History</h5>
                            <ul>
                                {issue.statusHistory.map((status, index) => (
                                    <li key={index}>
                                        <strong>{status.status}</strong> - {status.timestamp} by {status.updatedBy}
                                    </li>
                                ))}
                            </ul>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row className="my-3">
                <Col>
                    <Card>
                        <CardBody>
                            <h5>Internal Notes</h5>
                            <ul>
                                {issue.notes.map((note) => (
                                    <li key={note.id}>
                                        <strong>{note.author}</strong> ({note.timestamp}): {note.content}
                                    </li>
                                ))}
                            </ul>
                            <Form inline className="mt-3">
                                <FormGroup>
                                    <Label for="noteInput" className="mr-2">
                                        Add Note
                                    </Label>
                                    <Input
                                        type="textarea"
                                        id="noteInput"
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="mr-2"
                                    />
                                    <Button color="primary" onClick={handleAddNote}>
                                        <Plus size={14} /> Add Note
                                    </Button>
                                </FormGroup>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button color="warning" className="mr-2" onClick={handleChangeStatus}>
                        <Edit size={14} /> Change Status
                    </Button>
                    <Button color="danger" onClick={handleCloseIssue}>
                        <X size={14} /> Close Issue
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default AuthorityIssueDetail;
