import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from 'antd';
import '../index.css';
// import { toast } from 'react-toastify';

const Login = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        id: '',
        password: '',
    });
    const { id, password } = inputs;

    const onChange = e =>
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    const onSubmitForm = async (e) => {
        e.preventDefault();
        try {
            const body = { id, password };
            const response = await fetch(
            'http://localhost:5000/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            },
        );
            const parseRes = response;
            console.log(parseRes.status);
            if (parseRes.status === 200) {
                localStorage.setItem('id', id);
                setAuth(true);
                // toast.success('Login Successful');
            } else {
                setAuth(false);
                // toast.error(parseRes);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <Fragment>
            <div className="jumbotron mt-5 center">
            <center>
            <h1 className="mt-5">Login</h1>
            <form onSubmit={onSubmitForm}>
                <Input
                    type="text"
                    name="id"
                    value={id}
                    placeholder="id"
                    onChange={e => onChange(e)}
                    className="form-control my-3 mymargin" />
                <br />
                <Input
                    type="password"
                    name="password"
                    value={password}
                    placeholder="password"
                    onChange={e => onChange(e)}
                    className="form-control my-3 mymargin" />
                <br />
                <button type="submit" className='mybutton'>
                    <Button type="primary" className="btn btn-success btn-block">
                        Submit
                    </Button>
                </button>
            </form>
            <hr />
            <Link to="/signup">
                <Button>
                    Signup
                </Button>
            </Link>
            </center>
            </div>
        </Fragment>
    );
};

export default Login;
