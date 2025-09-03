/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
    Form,
    Label,
    Button,
    FormGroup,
    Spinner,
} from "reactstrap";
import { LoginUserRequest } from "../../redux/api/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useAdminLoginUserMutation } from "../../redux/api/authAPI";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getHomeRouteForLoggedInUser, getUserData } from "../../utils/Utils";
import logoImg from "../../assets/images/logo.png";
import adminLoginImg from "../../assets/images/admin-login.png";

const AdminLogin: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginUserRequest>();

    const navigate = useNavigate();
    const [isProcessing, setProcessing] = useState(false);

    const [adminLogin, { isLoading, isError, error, isSuccess }] =
        useAdminLoginUserMutation();

    useEffect(() => {
        if (isSuccess) {
            const user = getUserData();
            toast.success("You successfully logged in");
            navigate(getHomeRouteForLoggedInUser(user.role));
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
            }
        }
    }, [isLoading]);

    const onSubmit: SubmitHandler<LoginUserRequest> = (data) => {
        setProcessing(true);
        adminLogin(data);
    };

    return (
        <div className="auth-wrapper auth-cover">
            <div className="auth-login row m-0">
                <div className="d-none d-lg-flex col-lg-8 align-items-center p-5">
                    <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
                        <div className="hero-image mt-2">
                            <img src={adminLoginImg} alt="CityOps" />
                        </div>
                    </div>
                </div>
                <div className="d-flex col-lg-4 align-items-center auth-bg px-2 bg-white p-lg-5">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-12 px-xl-2 mx-auto">
                        <div className="mb-4 d-flex justify-content-center">
                            <img className="auth-img" src={logoImg} alt="Materials" />
                        </div>

                        <div className="row mb-3">
                            <div className="col-12">
                                <h4 className="text-center">Admin Login</h4>
                            </div>
                        </div>


                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <FormGroup>
                                <Label>Email</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                                    type="email"
                                    id="email"
                                    {...register('email', { required: true })}
                                />
                                {errors.email && <small className="text-danger">Email is required.</small>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Password</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                                    type="password"
                                    id="password"
                                    {...register('password', { required: true })}
                                />
                                {errors.password && <small className="text-danger">Password is required.</small>}
                            </FormGroup>

                            <div className="mt-4">
                                <Button color="primary" className="btn btn-block w-100" type="submit">
                                    LOGIN
                                    {isProcessing ?? (
                                        <Spinner
                                            style={{ width: '1rem', height: '1rem' }}
                                            type="grow"
                                            color="light"
                                        />
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
