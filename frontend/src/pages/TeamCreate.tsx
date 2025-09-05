/* eslint-disable react-hooks/exhaustive-deps */
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Card, CardBody, Col, Form, FormGroup, Label, Row } from "reactstrap";
import classnames from "classnames";
import { TeamCreateRequest } from "../redux/api/types";
import { useEffect, useState } from "react";
import { useCreateTeamMutation, useGetTeamMembersQuery } from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TeamCreate: React.FC = () => {
    const navigate = useNavigate();

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TeamCreateRequest>();

    // Local State
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Redux Toolkit Queries
    const [createTeam, { isLoading, isError, error, isSuccess, data }] = useCreateTeamMutation();
    const { data: teamMembers, refetch: refetchTeamMember } = useGetTeamMembersQuery();

    // Refetch team members on load
    useEffect(() => {
        refetchTeamMember();
    }, []);

    // Handle API success and error feedback
    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Team created successfully!");
            navigate("/authority/teams");
        }
        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: { message: string }) =>
                    toast.error(el.message, { position: "top-right" })
                );
            } else {
                const errorMsg = (error as any)?.data?.message || "An unexpected error occurred!";
                toast.error(errorMsg, { position: "top-right" });
            }
        }
    }, [isSuccess, isError]);

    // Form submission handler
    const onSubmit: SubmitHandler<TeamCreateRequest> = async (formData) => {
        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append("name", formData.name);
            if (formData.image && formData.image[0]) {
                form.append("image", formData.image[0]);
            }
            formData.members.forEach((member) => form.append("members", member));
            await createTeam(form);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container main-board">
            <Row className="my-3">
                <Col>
                    <h3 className="mb-3">Create Team</h3>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            {/* Team Name */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="name">Name</Label>
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

                            {/* Team Icon */}
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
                                        {...register("image", {
                                            required: "Team Icon is required.",
                                        })}
                                    />
                                    {errors.image && (
                                        <small className="text-danger">{errors.image.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Members Selection */}
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="members">Members</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.members,
                                        })}`}
                                        id="members"
                                        multiple
                                        {...register("members", {
                                            required: "Please select at least one member.",
                                        })}
                                    >
                                        <option value="" disabled>Select members</option>
                                        {teamMembers &&
                                            teamMembers.map(
                                                (
                                                    teamMember: { _id: string; fullname: string },
                                                    index: number
                                                ) => (
                                                    <option key={teamMember._id} value={teamMember._id}>
                                                        {teamMember.fullname}
                                                    </option>
                                                )
                                            )}
                                    </select>
                                    {errors.members && (
                                        <small className="text-danger">{errors.members.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Submit Button */}
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting ? "Submitting..." : "Create Team"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default TeamCreate;
