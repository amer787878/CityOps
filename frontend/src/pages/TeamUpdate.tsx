/* eslint-disable react-hooks/exhaustive-deps */
import { SubmitHandler, useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    FormGroup,
    Label,
    Row,
} from "reactstrap";
import { useEffect, useState } from "react";
import {
    useUpdateTeamMutation,
    useGetTeamQuery,
} from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import classnames from "classnames";
import { TeamUpdateRequest } from "../redux/api/types";

// Main component
const TeamUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TeamUpdateRequest>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: teamData, isLoading: isFetchingTeam } = useGetTeamQuery(id || "");
    const [updateTeam, { isLoading, isError, error, isSuccess, data }] =
        useUpdateTeamMutation();

    // Pre-populate fields from server's response
    useEffect(() => {
        if (teamData) {
            setValue("name", teamData.name);
            setValue("category", teamData.category);
            setValue("availability", teamData.availability);
        }
    }, [teamData, setValue]);

    // Handle success and error notifications
    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Team updated successfully!");
            navigate("/authority/teams");
        }

        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: any) =>
                    toast.error(el.message, { position: "top-right" })
                );
            } else {
                toast.error(
                    (error as any)?.data?.message || "An unexpected error occurred!",
                    { position: "top-right" }
                );
            }
        }
    }, [isSuccess, isError]);

    const onSubmit: SubmitHandler<TeamUpdateRequest> = async (formData) => {
        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append("name", formData.name);

            if (formData.image && formData.image[0]) {
                form.append("image", formData.image[0]);
            }

            form.append("category", formData.category);
            form.append("availability", formData.availability);

            await updateTeam({ id, team: form });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetchingTeam) {
        return <FullScreenLoader />;
    }

    return (
        <div className="container main-board">
            <Row className="my-3">
                <Col>
                    <h3 className="mb-3">Update Team # {teamData?.teamNumber}</h3>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            {/* Team Name Input */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="name">Team Name</Label>
                                    <input
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.name,
                                        })}`}
                                        id="name"
                                        {...register("name", { required: "Team Name is required." })}
                                    />
                                    {errors.name && (
                                        <small className="text-danger">{errors.name.message}</small>
                                    )}
                                </FormGroup>
                            </Col>

                            {/* Icon Upload */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="image">Team Icon</Label>
                                    <input
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.image,
                                        })}`}
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        {...register("image")}
                                    />
                                    {errors.image && (
                                        <small className="text-danger">{errors.image.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            {/* Category Dropdown */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="category">Category</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.category,
                                        })}`}
                                        {...register("category", {
                                            required: "Category is required.",
                                        })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Road Repair">Road Repair</option>
                                        <option value="Streetlight Maintenance">
                                            Streetlight Maintenance
                                        </option>
                                    </select>
                                </FormGroup>
                            </Col>

                            {/* Availability Dropdown */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="availability">Availability</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.availability,
                                        })}`}
                                        {...register("availability", {
                                            required: "Availability is required.",
                                        })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Available">Available</option>
                                        <option value="Busy">Busy</option>
                                    </select>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting ? "Submitting..." : "Update Team"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default TeamUpdate;
