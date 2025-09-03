/* eslint-disable react-hooks/exhaustive-deps */
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Form,
    Label,
    Row,
} from "reactstrap";
import { useForm, SubmitHandler } from 'react-hook-form';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserQuery, useUpdateUserMutation } from "../redux/api/userAPI";
import { IUserRequest, UserType } from "../redux/api/types";

const AdminUserEdit = () => {
    const { id } = useParams<{ id: string }>();
    const { data: user, refetch: refetchUser } = useGetUserQuery(id ?? '', {
        skip: !id,
    });
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<IUserRequest>();

    const [updateUser, { isLoading, isSuccess, error, isError, data }] = useUpdateUserMutation();

    useEffect(() => {
        refetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            const fields: Array<keyof UserType> = ['fullname', 'email', 'role', 'status'];
            fields.forEach((field) => setValue(field, user[field]));
        }
    }, [user]);

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
            navigate('/admin/users');
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
                    (error as any)?.data?.message || (error as any)?.data || "Login failed";
                toast.error(errorMsg, {
                    position: "top-right",
                });
            };
        }
    }, [isLoading]);

    const onSubmit: SubmitHandler<IUserRequest> = (data) => {
        updateUser({ id, user: data });
    };

    const roleOptions = [
        { value: 'Admin', label: 'Admin' },
        { value: 'Authority', label: 'Authority' },
        { value: 'Citizen', label: 'Citizen' },
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Suspended', label: 'Suspended' },
    ];

    return (
        <div className="main-board">
            <Container>
                <h3 className="my-3">Edit User</h3>
                <Card>
                    <CardBody>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col md="6">
                                    <div className="mb-2">
                                        <Label>Full Name</Label>
                                        <input
                                            className={`form-control ${classnames({ 'is-invalid': errors.fullname })}`}
                                            type="text"
                                            {...register('fullname', { required: true })}
                                        />
                                        {errors.fullname && (
                                            <small className="text-danger">Full Name is required.</small>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <Label>Email Address</Label>
                                        <input
                                            className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                                            type="email"
                                            {...register('email', {
                                                required: 'Email is required.',
                                                pattern: {
                                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                                    message: 'Please enter a valid email address.',
                                                },
                                            })}
                                        />
                                        {errors.email && (
                                            <small className="text-danger">{errors.email.message}</small>
                                        )}
                                    </div>

                                </Col>
                                <Col md="6">
                                    <div className="mb-2">
                                        <Label>Role</Label>
                                        <select
                                            className={`form-control ${classnames({ 'is-invalid': errors.role })}`}
                                            {...register('role', { required: true })}
                                        >
                                            {roleOptions.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && (
                                            <small className="text-danger">Role selection is required.</small>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <Label>Status</Label>
                                        <select
                                            className={`form-control ${classnames({ 'is-invalid': errors.status })}`}
                                            {...register('status', { required: true })}
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.status && (
                                            <small className="text-danger">Status selection is required.</small>
                                        )}
                                    </div>
                                </Col>
                                <div className="mt-4">
                                    <Button
                                        color="primary"
                                        className="btn-block"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Saving..." : "Update"}
                                    </Button>
                                </div>
                            </Row>
                        </Form>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default AdminUserEdit;
