/* eslint-disable react-hooks/exhaustive-deps */
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Card, CardBody, Col, Form, FormGroup, Label, Row } from "reactstrap";
import classnames from "classnames";
import { TeamUpdateRequest } from "../redux/api/types";
import { useEffect, useState } from "react";
import { useUpdateTeamMutation, useGetTeamQuery, useGetTeamMembersQuery } from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const TeamUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TeamUpdateRequest>();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { data: teamData, isLoading: isFetchingTeam } = useGetTeamQuery(id || "");
    const { data: teamMembers, isLoading: isFetchingMembers } = useGetTeamMembersQuery();
    const [updateTeam, { isLoading, isError, error, isSuccess, data }] = useUpdateTeamMutation();

    useEffect(() => {
        if (teamData) {
            setValue("name", teamData.name);
            setValue("members", teamData.members || []);
        }
    }, [teamData]);

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Team updated successfully!");
            navigate("/authority/teams");
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
                    (error as any)?.data?.message || "An unexpected error occurred!";
                toast.error(errorMsg, {
                    position: "top-right",
                });
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
            form.append("members", JSON.stringify(formData.members));
            await updateTeam({ id, team: form });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetchingTeam || isFetchingMembers) {
        return <p>Loading team details...</p>;
    }

    return (
        <div className="container main-board">
            <Row className="my-3">
                <Col>
                    <h3 className="mb-3">Update Team</h3>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
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
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="members">Members</Label>
                                    <select
                                        multiple
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.members,
                                        })}`}
                                        id="members"
                                        {...register("members", {
                                            required: "Please select at least one member.",
                                        })}
                                    >
                                        {teamMembers && teamMembers.map(
                                            (member: { _id: string; fullname: string }) => (
                                                <option key={member._id} value={member._id}>
                                                    {member.fullname}
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

                        {/* Buttons */}
                        <Row className="mt-4">
                            <Col>
                                <Button type="submit" color="primary" disabled={isSubmitting || isLoading}>
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
