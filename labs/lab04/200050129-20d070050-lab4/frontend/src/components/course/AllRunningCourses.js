import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

const AllRunningCourses = ({ setAuth }) => {
    const [info, setInfo] = useState([]);

    const getCourse = async () => {
        try {
            console.log(localStorage.token);
            const res = await fetch(
                'http://localhost:5000/course/running/depts',
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            const parseData = await res.json();
            setInfo(parseData);
        } catch (err) {
            console.error(err.message);
        }
    };

    const logout = async (e) => {
        e.preventDefault();
        try {
            await fetch(
                'http://localhost:5000/auth/logout',
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            setAuth(false);
            // toast.success('Successfully logged out');
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getCourse();
    }, []);

    return (
        <div>
            <div className="d-flex mt-5 justify-content-around">
                <center>
                <h1>Departments</h1>
                {
                    info.map(dept => (
                        <div>
                        <Link to={`/course/running/${dept.dept_name}`} className="btn btn-primary">
                            <Button>{dept.dept_name}</Button>
                        </Link>
                        <br /><br />
                        </div>
                    ))
                }
                <button onClick={e => logout(e)} className="btn btn-primary mybutton">
                    <Button type="primary" className="btn btn-success btn-block">
                        Logout
                    </Button>
                </button>
                </center>
            </div>
        </div>
    );
};

export default AllRunningCourses;
