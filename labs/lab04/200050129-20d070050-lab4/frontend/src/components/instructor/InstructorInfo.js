import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

const InstructorInfo = ({ setAuth }) => {
    const { instructor_id } = useParams();
    const [info, setInfo] = useState([]);

    const getInstructor = async () => {
        try {
            console.log('yay');
            const res = await fetch(
                `http://localhost:5000/forMittal/iinfo/${instructor_id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            const parseData = await res.json();
            console.log(parseData);
            setInfo([parseData]);
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
        getInstructor();
    }, [info]);

    return (
        <div>
            <div className="d-flex mt-5 justify-content-around">
                <center>
                {
                    info.map(instr => (
                        <div>
                            <h1>Instructor: Prof. {instr.instructor_name}</h1>
                            <h2>Department: {instr.department}</h2>
                        </div>
                    ))
                }
                <div>
                    <h3>Current courses:</h3>
                </div>
                {
                    info.map(courses => (
                        courses.curr_sem.length === 0 ? <h3>No courses being taken currently</h3> :
                        courses.curr_sem.map(course => (
                            <div>
                            <Link to={`/course/${course.course_id}`} className="btn btn-primary">
                                <Button>{course.course_id} - {course.title}</Button>
                            </Link>
                            <br /><br />
                            </div>
                        ))
                    ))
                }
                <div>
                    <h3>Past courses:</h3>
                </div>
                {
                    info.map(courses => (
                        courses.sems.length === 0 ? <h3>No courses taken in the past</h3> :
                        courses.sems.map(sem => (
                            sem.map(course => (
                                <div>
                                <Link to={`/course/${course.course_id}`} className="btn btn-primary">
                                    <Button>{course.course_id} - {course.title}</Button>
                                </Link>
                                <br /><br />
                                </div>
                            ))
                        ))
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

export default InstructorInfo;