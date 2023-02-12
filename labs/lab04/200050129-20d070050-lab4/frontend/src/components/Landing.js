import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import '../index.css';

const Landing = () => (
    <div className="jumbotron mt-5 center">
        <center>
            <h1> Welcome to MyASC@IITB</h1>
            <Link to="/login" className="btn btn-primary">
                <Button type="primary">
                    Login
                </Button>
            </Link>
            <hr />
            <Link to="/signup" className="btn btn-primary ml-3">
                <Button>
                    Signup
                </Button>
            </Link>
        </center>
    </div>
  );

export default Landing;
