/* eslint-disable react-hooks/exhaustive-deps */
import Select from "react-select";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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
import { useCreateTeamMutation, useGetTeamMembersQuery } from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { TeamCreateFormFields, TeamMember } from "../redux/api/types";

// Define React Select option type
type SelectOptionType = { value: string; label: string };

// Main TeamCreate component
const TeamCreate: React.FC = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<TeamCreateFormFields>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createTeam, { isLoading, isError, error, isSuccess, data }] = useCreateTeamMutation();
    const { data: teamMembers, isFetching, refetch } = useGetTeamMembersQuery();

    const [memberOptions, setMemberOptions] = useState<SelectOptionType[]>([]);

    // Fetch members data from the server
    useEffect(() => {
        refetch();
    }, []);

    // Map team members to React Select's expected format
    useEffect(() => {
        if (teamMembers) {
            const options = teamMembers.map((member: TeamMember) => ({
                value: member._id,
                label: member.fullname,
            }));
            setMemberOptions(options);
        }
    }, [teamMembers]);

    // Handle success/error
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
                toast.error((error as any)?.data?.message || "An unexpected error occurred!", {
                    position: "top-right",
                });
            }
        }
    }, [isSuccess, isError]);

    const onSubmit: SubmitHandler<TeamCreateFormFields> = async (formData) => {
        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append("name", formData.name);
            form.append("availability", formData.availability);
            form.append("category", formData.category);

            if (formData.image && formData.image[0]) {
                form.append("image", formData.image[0]);
            }

            const memberIds = formData.members.map((member) => member.value);
            memberIds.forEach((id) => form.append("members", id));

            await createTeam(form);
        } catch (error) {
            toast.error("Error submitting the team data.");
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
                                        {...register("image", { required: "Team Icon is required." })}
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
                                    <Label for="category">Expertise/Category</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.category,
                                        })}`}
                                        {...register("category", { required: "Expertise/Category is required." })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Road Repair">Road Repair</option>
                                        <option value="Streetlight Maintenance">Streetlight Maintenance</option>
                                    </select>
                                    {errors.category && (
                                        <small className="text-danger">{errors.category.message}</small>
                                    )}
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup>
                                    <Label for="availability">Availability</Label>
                                    <select
                                        className={`form-control ${classnames({
                                            "is-invalid": errors.availability,
                                        })}`}
                                        {...register("availability", { required: "Availability is required." })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Available">Available</option>
                                        <option value="Busy">Busy</option>
                                    </select>
                                    {errors.availability && (
                                        <small className="text-danger">{errors.availability.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="members">Members</Label>
                                    <Controller
                                        name="members"
                                        control={control}
                                        rules={{
                                            validate: (value) =>
                                                (value && value.length > 0) || "At least one member is required.",
                                        }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={memberOptions}
                                                isMulti
                                                isLoading={isFetching}
                                                placeholder="Select members..."
                                                className={classnames({
                                                    "react-select is-invalid": errors.members,
                                                })}
                                                onChange={(selected) => field.onChange(selected)}
                                            />
                                        )}
                                    />
                                    {errors.members && (
                                        <small className="text-danger">
                                            {errors.members.message}
                                        </small>
                                    )}

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
