/* eslint-disable react-hooks/exhaustive-deps */
import { SubmitHandler, useForm, Controller } from "react-hook-form";
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
    useGetTeamMembersQuery,
} from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import Select from "react-select";
import classnames from "classnames";
import { TeamMember, TeamUpdateRequest } from "../redux/api/types";

// Type for the Select options
type SelectOptionType = { value: string; label: string };

// Main component
const TeamUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
    } = useForm<TeamUpdateRequest>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: teamData, isLoading: isFetchingTeam } = useGetTeamQuery(id || "");
    const { data: teamMembers, isLoading: isFetchingMembers } = useGetTeamMembersQuery();
    const [updateTeam, { isLoading, isError, error, isSuccess, data }] =
        useUpdateTeamMutation();

    const [memberOptions, setMemberOptions] = useState<SelectOptionType[]>([]);

    // Map teamMembers to react-select options
    useEffect(() => {
        if (teamMembers) {
            const options = teamMembers.map((member: TeamMember) => ({
                value: member._id,
                label: member.fullname,
            }));
            setMemberOptions(options);
        }
    }, [teamMembers]);

    // Pre-populate fields from server's response
    useEffect(() => {
        if (teamData) {
            setValue("name", teamData.name);
            setValue("category", teamData.category);
            setValue("availability", teamData.availability);

            const mappedMembers =
                teamData.members?.map((member: TeamMember) => ({
                    value: member._id,
                    label: member.fullname,
                })) || [];
            setValue(
                "members",
                mappedMembers.map((m: any) => m.value)
            );
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

            const members = formData.members || [];
            members.forEach((memberId: string) => form.append("members", memberId));

            await updateTeam({ id, team: form });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetchingTeam || isFetchingMembers) {
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

                        {/* Members MultiSelect */}
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="members">Team Members</Label>
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
                                                isMulti
                                                options={memberOptions}
                                                placeholder="Select members..."
                                                className={`react-select ${classnames({
                                                    "is-invalid": errors.members,
                                                })}`}
                                                onChange={(selected) => {
                                                    field.onChange(
                                                        selected?.map((member: SelectOptionType) => member.value) || []
                                                    );
                                                }}
                                                value={memberOptions.filter((option) =>
                                                    field.value?.includes(option.value)
                                                )}
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
