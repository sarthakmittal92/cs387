import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import { Button } from 'antd';

const DeptRunningCourses = ({ setAuth }) => {
    const [info, setInfo] = useState([]);
    var {dept_name} = useParams();
    dept_name = dept_name.replace('%20',' ');

    const getCourse = async () => {
        try {
            console.log(localStorage.token);
            const res = await fetch(
                `http://localhost:5000/course/runningin/${dept_name}`,
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
            // localStorage.removeItem('token');
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
                <h1>Running Courses</h1>
                {
                    info.map(course => (
                        <div>
                        <Link to={`/course/${course.course_id}`} className="btn btn-primary">
                            <Button>{course.course_id}</Button>
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

export default DeptRunningCourses;