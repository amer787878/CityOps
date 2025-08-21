import { Form, Label, Button, FormGroup, Spinner, Row, Col, CardTitle } from 'reactstrap';
import { RegisterUserRequest } from '../../redux/api/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import { useRegisterUserMutation } from '../../redux/api/authAPI';
import { useEffect } from 'react';
import logoImg from "../../assets/images/logo.png";
import CustomerSVG from '../../assets/images/customerHero';

const CitizenRegister: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterUserRequest>();
    const [registerUser, { isLoading, isSuccess, error, isError, data }] = useRegisterUserMutation();
    const navigate = useNavigate();

    const password = watch('password'); // Watch the password field

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Registration successful!");
            navigate('/login');
        }

        if (isError && error) {
            const errorData = (error as any)?.data;
            const errorMessage = errorData?.message || "An error occurred. Please try again.";

            if (Array.isArray(errorData?.error)) {
                errorData.error.forEach((el: any) =>
                    toast.error(el.message, { position: 'top-right' })
                );
            } else {
                toast.error(errorMessage, { position: 'top-right' });
            }
        }
    }, [isSuccess, isError, error, navigate, data]);

    const onSubmit: SubmitHandler<RegisterUserRequest> = (formData) => {
        formData.role = "Citizen";
        registerUser(formData);
    };

    return (
        <div className="main-view auth-registration container-fluid">
            <Row className="h-100">
                <Col
                    className="flexbox-container flex-column justify-content-start align-items-start p-5 flexbox-page"
                    lg="5"
                    xl="4"
                >
                    <div className="brand-logo flex-column mb-5">
                        <img src={logoImg} alt="CityOps" className="mb-2" />
                        <small className="brand-text pr-2">
                            Modernizing urban issue reporting with AI. Empower citizens, engage communities, and improve your city effortlessly.
                        </small>
                    </div>
                    <div className="hero-image mt-2">
                        <CustomerSVG />
                    </div>
                </Col>

                <Col className="flexbox-container align-items-start flex-column bg-white p-5 flexbox-responsive">
                    <Col className="mx-auto" xl="8">
                        <small className="mb-1 text-uppercase text-gray-600">Let's Get Started</small>
                        <CardTitle tag="h2" className="font-weight-bold mb-1">
                            Register here For Citizen
                        </CardTitle>
                        <div className="row mb-3">
                            <div className="col-12">
                                <p className="body-meta">
                                    Looking for care?{' '}
                                    <Link to="/register-authority" className="primary-link">
                                        <span className="fw-bold">Sign up as a Authority →</span>
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <Form noValidate className="auth-register-form mt-4" onSubmit={handleSubmit(onSubmit)}>
                            <FormGroup>
                                <Label className="form-label" for="fullname">
                                    Full Name
                                </Label>
                                <input
                                    type="text"
                                    placeholder="Jane"
                                    id="fullname"
                                    className={`form-control ${classnames({ 'is-invalid': errors.fullname })}`}
                                    {...register('fullname', { required: true })}
                                />
                                {errors.fullname && <small className="text-danger">Full Name is required.</small>}
                            </FormGroup>

                            <FormGroup>
                                <Label className="form-label" for="email">
                                    Email
                                </Label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="example@example.com"
                                    className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                                    {...register('email', {
                                        required: 'Email is required.',
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                            message: 'Please enter a valid email address.',
                                        },
                                    })}
                                />
                                {errors.email && <small className="text-danger">{errors.email.message}</small>}
                            </FormGroup>


                            <FormGroup>
                                <Label className="form-label" for="password">
                                    Password
                                </Label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="********"
                                    className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                                    {...register('password', { required: true })}
                                />
                                {errors.password && <small className="text-danger">Password is required.</small>}
                            </FormGroup>

                            <FormGroup>
                                <Label className="form-label" for="passwordConfirm">
                                    Confirm Password
                                </Label>
                                <input
                                    type="password"
                                    id="passwordConfirm"
                                    placeholder="********"
                                    className={`form-control ${classnames({ 'is-invalid': errors.passwordConfirm })}`}
                                    {...register('passwordConfirm', {
                                        required: true,
                                        validate: (value) =>
                                            value === password || 'Passwords do not match',
                                    })}
                                />
                                {errors.passwordConfirm && (
                                    <small className="text-danger">{errors.passwordConfirm.message}</small>
                                )}
                            </FormGroup>

                            <Button type="submit" block color="primary" className="mt-4" disabled={isLoading}>
                                Register
                                {isLoading && (
                                    <Spinner
                                        style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }}
                                        color="light"
                                    />
                                )}
                            </Button>
                        </Form>
                        <p className="text-center mt-4">
                            <span className="mx-3">Already have an account?</span>
                            <Link to="/login">
                                <span>Log in instead</span>
                            </Link>
                        </p>
                    </Col>
                </Col>
            </Row>
        </div>
    );
};

export default CitizenRegister;
