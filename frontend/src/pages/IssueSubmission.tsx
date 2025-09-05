/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Input, Form, FormGroup, Label, Card, CardBody } from 'reactstrap';
import classnames from "classnames";
import GooglePlacesAutocomplete from 'react-google-autocomplete';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IssueSubmissionRequest } from '../redux/api/types';

const IssueSubmission: React.FC = () => {
    const navigate = useNavigate();

    const [description, setDescription] = useState<string>('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [address, setAddress] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<IssueSubmissionRequest>();

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     // Validation
    //     if (!description && !photo && !audio) {
    //         alert('Please provide at least one input: description, photo, or audio.');
    //         return;
    //     }
    //     if (!address) {
    //         alert('Address is required.');
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     // Simulate submission
    //     const formData = new FormData();
    //     formData.append('description', description);
    //     if (photo) formData.append('photo', photo);
    //     if (audio) formData.append('audio', audio);
    //     formData.append('address', address);

    //     // Simulate AI processing and backend submission
    //     setTimeout(() => {
    //         alert('Issue submitted successfully! AI-generated classification and priority will be displayed.');
    //         navigate('/my-issues'); // Redirect to My Issues Page
    //     }, 2000);
    // };

    const handleCancel = () => {
        navigate('/');
    };

    const onSubmit: SubmitHandler<IssueSubmissionRequest> = (data) => {
    };

    return (
        <div className="container main-board">
            <h3 className="my-3">Report an Issue</h3>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <textarea
                                className={`form-control ${classnames({ 'is-invalid': errors.description })}`}
                                id="description"
                                {...register('description', { required: true })}
                            ></textarea>
                            {errors.description && <small className="text-danger">Description is required.</small>}
                        </FormGroup>

                        <FormGroup>
                            <Label for="photo">Upload a Photo (optional)</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            />
                        </FormGroup>

                        {/* Audio Recording */}
                        <FormGroup>
                            <Label for="audio">Record an Audio Message (optional)</Label>
                            <Input
                                id="audio"
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudio(e.target.files?.[0] || null)}
                            />
                        </FormGroup>

                        {/* Address Field */}
                        <FormGroup>
                            <Label for="address">Address</Label>
                            <GooglePlacesAutocomplete
                                apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                                onPlaceSelected={(place) => setAddress(place.formatted_address || '')}
                                options={{
                                    types: ['address'],
                                    componentRestrictions: { country: 'IL' }, // Restrict to Israel
                                }}
                                className="form-control"
                            />
                            {Object.keys(errors).length && errors.address ? (
                                <small className="text-danger mt-1">{errors.address.message}</small>
                            ) : null}
                        </FormGroup>

                        {/* Buttons */}
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                                <Button
                                    type="button"
                                    color="secondary"
                                    className="ms-3"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default IssueSubmission;
