import { Form, Label, Button, Container } from 'reactstrap';
import { RegisterUserRequest } from '../../redux/api/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import { useRegisterUserMutation } from '../../redux/api/authAPI';
import { useEffect } from 'react';

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterUserRequest>();
    const [registerUser, { isLoading, isSuccess, error, isError, data }] = useRegisterUserMutation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
            navigate('/login');
        }

        if (isError) {
            if (Array.isArray((error as any).data.error)) {
                (error as any).data.error.forEach((el: any) =>
                    toast.error(el.message, {
                        position: 'top-right',
                    })
                );
            } else {
                const errorMsg = (error as any).data && (error as any).data.message ? (error as any).data.message : (error as any).data;
                toast.error(errorMsg, {
                    position: 'top-right',
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    const onSubmit: SubmitHandler<RegisterUserRequest> = (data) => {
        console.log(data)
        registerUser(data);
    };

    return (
        <div className="main-view city-sense-background">
            <Container>
                <div className="auth-panel">
                    <Form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className='mb-3 text-center'>
                            <h5>Create your account</h5>
                        </div>
                        <div className='mb-2'>
                            <Label>Username</Label>
                            <input
                                className={`form-control ${classnames({ 'is-invalid': errors.username })}`}
                                type="text"
                                id="username"
                                {...register('username', { required: true })}
                            />
                            {errors.username && <small className="text-danger">Username is required.</small>}
                        </div>
                        <div className='mb-2'>
                            <Label>First Name</Label>
                            <input
                                className={`form-control ${classnames({ 'is-invalid': errors.firstname })}`}
                                type="text"
                                id="firstname"
                                {...register('firstname', { required: true })}
                            />
                            {errors.firstname && <small className="text-danger">First Name is required.</small>}
                        </div>
                        <div className='mb-2'>
                            <Label>Last Name</Label>
                            <input
                                className={`form-control ${classnames({ 'is-invalid': errors.lastname })}`}
                                type="text"
                                id="lastname"
                                {...register('lastname', { required: true })}
                            />
                            {errors.lastname && <small className="text-danger">Last Name is required.</small>}
                        </div>
                        <div className='mb-2'>
                            <Label>Email</Label>
                            <input
                                className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                                type="email"
                                id="email"
                                {...register('email', { required: true })}
                            />
                            {errors.email && <small className="text-danger">Email is required.</small>}
                        </div>
                        <div className='mb-2'>
                            <Label>Password</Label>
                            <input
                                className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                                type="password"
                                id="password"
                                {...register('password', { required: true })}
                            />
                            {errors.password && <small className="text-danger">Password is required.</small>}
                        </div>
                        <div className="mt-4">
                            <Button color="orange" className="btn-block" type="submit">
                                Submit
                            </Button>
                        </div>
                        <div className="mt-3 text-center">
                            <p>
                                Already have an account?
                                <Link to="/login" className="primary-link mx-2">
                                    <span>Sign In instead</span>
                                </Link>
                            </p>
                        </div>
                    </Form>
                </div>
            </Container>
        </div>
    )
}

export default Register;