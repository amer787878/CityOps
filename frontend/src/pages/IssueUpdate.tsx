/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Row,
    Col,
    Button,
    Input,
    Form,
    FormGroup,
    Label,
    Card,
    CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import GooglePlacesAutocomplete from 'react-google-autocomplete';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useUpdateIssueMutation, useGetIssueQuery } from '../redux/api/issueAPI';
import { IssueUpdateRequest } from '../redux/api/types';

const IssueUpdate: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
        setError
    } = useForm<IssueUpdateRequest>();

    const [photo, setPhoto] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [address, setAddress] = useState<string>('');

    const [updateIssue, { isLoading, isError, isSuccess, error }] = useUpdateIssueMutation();
    const { data: issueData, isFetching } = useGetIssueQuery(id);

    const handleCancel = useCallback(() => {
        navigate('/');
    }, [navigate]);

    useEffect(() => {
        if (issueData) {
            setValue('description', issueData.description);
            setValue('category', issueData.category);
            setValue('priority', issueData.priority);
            setAddress(issueData.address);
        }
    }, [issueData]);

    const onSubmit: SubmitHandler<IssueUpdateRequest> = async (data) => {
        if (!address) {
            setError('address', {
                type: 'manual',
                message: 'Please select an address using the suggested option.',
            });
            return;
        }

        try {
            data.address = address;
            console.log(data)
            const submissionData = new FormData();
            submissionData.append('description', data.description);
            if (photo) submissionData.append('photo', photo);
            if (audio) submissionData.append('audio', audio);
            submissionData.append('address', address);
            submissionData.append('category', data.category);
            submissionData.append('priority', data.priority);

            await updateIssue({ id, issue: submissionData });
        } catch (error) {
            console.error(error);
            toast.error('Failed to update the issue. Please try again.');
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success('Issue updated successfully!');
            navigate('/authority/dashboard');
        }
        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: { message: string }) =>
                    toast.error(el.message, { position: 'top-right' })
                );
            } else {
                const errorMsg = (error as any)?.data?.message || 'An unexpected error occurred!';
                toast.error(errorMsg, { position: 'top-right' });
            }
        }
    }, [isSuccess, isError]);

    return (
        <div className="main-board container">
            <Row className="my-3">
                <Col>
                    <h3 className="mb-3">Update Issue</h3>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            {/* Description */}
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className={`form-control ${classnames({ 'is-invalid': errors.description })}`}
                                        {...register('description', {
                                            required: 'Description is required.',
                                            minLength: {
                                                value: 10,
                                                message: 'Description must be at least 10 characters long.'
                                            },
                                            maxLength: {
                                                value: 5000,
                                                message: 'Description must be less than 5000 characters long.'
                                            }
                                        })}
                                    ></textarea>
                                    {errors.description && (
                                        <small className="text-danger">{errors.description.message}</small>
                                    )}
                                </FormGroup>
                            </Col>

                            {/* Photo Upload */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="photo">Update Photo (optional)</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                    />
                                </FormGroup>
                            </Col>

                            {/* Audio Upload */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="audio">Update Audio Message (optional)</Label>
                                    <Input
                                        id="audio"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setAudio(e.target.files?.[0] || null)}
                                    />
                                </FormGroup>
                            </Col>

                            {/* Address */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="address">Address</Label>
                                    <GooglePlacesAutocomplete
                                        apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                                        className={`form-control ${classnames({ 'is-invalid': errors.address })}`}
                                        onPlaceSelected={(place) => {
                                            clearErrors('address');
                                            setAddress(place.formatted_address || '');
                                        }}
                                        options={{
                                            types: ['address'],
                                            componentRestrictions: { country: 'IL' },
                                        }}
                                        defaultValue={address}
                                    />
                                    {errors.address && (
                                        <small className="text-danger mt-1">{errors.address.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="category">Category</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.category,
                                        })}`}
                                        {...register("category", { required: "Category Type is required." })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Road Maintenance">Road Maintenance</option>
                                        <option value="Waste Disposal">Waste Disposal</option>
                                        <option value="Streetlight Maintenance">Streetlight Maintenance</option>

                                    </select>

                                    {errors.category && (
                                        <small className="text-danger">{errors.category.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="priority">Priority</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            'is-invalid': errors.priority,
                                        })}`}
                                        {...register('priority', { required: 'Priority is required.' })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Critical">Critical</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Low">Low</option>
                                    </select>

                                    {errors.priority && (
                                        <small className="text-danger">{errors.priority.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>
                        {/* Buttons */}
                        <Row className="mt-4">
                            <Col>
                                <Button type="submit" color="primary" disabled={isLoading || isFetching}>
                                    {isLoading ? 'Updating...' : 'Update'}
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

export default IssueUpdate;
