/* eslint-disable react-hooks/exhaustive-deps */
import {
    Collapse,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import { RootState, useAppSelector } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import userImg from '../assets/images/user.png';
import logoImg from '../assets/images/logo.png';
import { toast } from 'react-toastify';
import { useLogoutUserMutation } from "../redux/api/authAPI";
import { IUser } from "../redux/api/types";

const Header: React.FC = () => {
    const user: IUser | null = useAppSelector((state: RootState) => state.userState.user);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [logoutUser, { isLoading, isSuccess, error, isError }] = useLogoutUserMutation();
    const navigate = useNavigate();
    const toggle = () => setIsOpen(!isOpen);

    const mobileToggle = () => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            setIsOpen(!isOpen);
        }
    };

    useEffect(() => {
        if (isSuccess) {
            window.location.href = '/login';
        }

        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: { message: string }) =>
                    toast.error(el.message, {
                        position: 'top-right',
                    })
                );
            } else {
                toast.error((error as any)?.data?.message, {
                    position: 'top-right',
                });
            }
        }
    }, [isLoading]);

    const onLogoutHandler = () => {
        logoutUser();
    };

    return (
        <header>
            <div className="container">
                <Navbar expand="md" className="navbar-light">
                    <NavbarBrand
                        href={
                            user
                                ? user.role === 'Admin'
                                    ? '/admin/moderation'
                                    : user.role === 'Citizen'
                                        ? '/citizen/issues'
                                        : user.role === 'Authority'
                                            ? '/authority/dashboard'
                                            : '/'
                                : '/'
                        }
                    >
                        <img
                            src={logoImg}
                            alt="CityOps"
                            className="logo-image"
                        />
                        <span className="mx-3 text-white fw-bold">CityOps</span>
                    </NavbarBrand>

                    <NavbarToggler onClick={toggle} className="ms-auto" style={{ backgroundColor: 'white', borderColor: 'white' }} />
                    <Collapse isOpen={isOpen} navbar>
                        {!user && (
                            <>
                                <Nav className="ms-auto" navbar>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/explore-issues'); mobileToggle(); }}>
                                            Explore Issues
                                        </NavLink>
                                    </NavItem>
                                    <UncontrolledDropdown nav inNavbar>
                                        <DropdownToggle nav caret>
                                            <img src={userImg} alt="user" className="user-img" />
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                            <DropdownItem onClick={() => navigate('/login')}>Log In</DropdownItem>
                                            <DropdownItem onClick={() => navigate('/register')}>Register</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                            </>
                        )}
                        {user && user.role === 'Citizen' && (
                            <>
                                <Nav className="ms-auto" navbar>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/citizen/issues'); mobileToggle(); }}>
                                            Community Issues
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/citizen/my-issues'); mobileToggle(); }}>
                                            My Issues
                                        </NavLink>
                                    </NavItem>
                                    <UncontrolledDropdown nav inNavbar>
                                        <DropdownToggle nav caret>
                                            <img src={userImg} alt="user" className="user-img" />
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                            <DropdownItem onClick={onLogoutHandler}>Log out</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                            </>
                        )}
                        {user && user.role === 'Authority' && (
                            <>
                                <Nav className="ms-auto" navbar>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/authority/dashboard'); mobileToggle(); }}>
                                            Dashboard
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/authority/teams'); mobileToggle(); }}>
                                            Teams
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/authority/team-assigns'); mobileToggle(); }}>
                                            Team Assign
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/authority/notifications'); mobileToggle(); }}>
                                            Notifications
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/authority/analytics'); mobileToggle(); }}>
                                            Analytics
                                        </NavLink>
                                    </NavItem>
                                    <UncontrolledDropdown nav inNavbar>
                                        <DropdownToggle nav caret>
                                            <img src={userImg} alt="user" className="user-img" />
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                            <DropdownItem onClick={onLogoutHandler}>Log out</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                            </>
                        )}
                        {user && user.role === 'Admin' && (
                            <>
                                <Nav className="ms-auto" navbar>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/admin/moderation'); mobileToggle(); }}>
                                            Morderation
                                        </NavLink>
                                    </NavItem>
                                    
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/admin/users'); mobileToggle(); }}>
                                            Users
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink onClick={() => { navigate('/admin/report'); mobileToggle(); }}>
                                            Report
                                        </NavLink>
                                    </NavItem>
                                    <UncontrolledDropdown nav inNavbar>
                                        <DropdownToggle nav caret>
                                            <img src={userImg} alt="user" className="user-img" />
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                            <DropdownItem onClick={onLogoutHandler}>Log out</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                            </>
                        )}
                    </Collapse>
                </Navbar>
            </div>
        </header>
    );
};

export default Header;
