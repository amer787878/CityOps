import { Button, Card, CardBody, CardDeck, CardFooter, CardTitle } from 'reactstrap';
import { Link } from 'react-router-dom';
import userImg from '../../assets/images/user.png';
import citizenImg from '../../assets/images/citizen.png';
import authorityImg from '../../assets/images/authority.png';

const Register = () => {
  return (
    <div className="container main-board register-container">
      <div className="auth-inner">
        <div className="text-center mb-4 register-title">
          <h2>CityOps - Smart Urban Issue Reporting Platform</h2>
          <img src={userImg} alt="Subs For You" height={50} className="my-3" />
          <h4>I am a...</h4>
        </div>
        <CardDeck className="register-cards">
          <Card className="register-card">
            <div className="d-flex justify-content-center mt-3">
              <img className="img-responsive" src={citizenImg} alt="Citizen" />
            </div>
            <CardBody>
              <CardTitle tag="h4" className="text-center">Citizen</CardTitle>
            </CardBody>
            <CardFooter className="text-center">
              <Button tag={Link} to="/register-citizen" color="primary" block>
                Sign up
              </Button>
            </CardFooter>
          </Card>
          <Card className="register-card">
            <div className="d-flex justify-content-center mt-3">
              <img className="img-responsive" src={authorityImg} alt="Authority" />
            </div>
            <CardBody>
              <CardTitle tag="h4" className="text-center">Authority</CardTitle>
            </CardBody>
            <CardFooter className="text-center">
              <Button tag={Link} to="/register-authority" color="primary" block>
                Sign up
              </Button>
            </CardFooter>
          </Card>
        </CardDeck>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login">
            <span className="register-link">Log in instead</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
