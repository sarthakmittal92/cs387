import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

const CourseInfo = ({ setAuth }) => {
    const { course_id } = useParams();
    const [info, setInfo] = useState([]);

    const getCourse = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/forMittal/cinfo/${course_id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            const parseData = await res.json();
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
            setAuth(false);
            // toast.success('Successfully logged out');
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getCourse();
    }, [info]);

    return (
        <div>
            <div className="d-flex mt-5 justify-content-around">
                <center>
                {
                    info.map(course => (
                        <div>
                            <h1>Course ID: {course.course_id}</h1>
                            <h1>Name: {course.title}</h1>
                            <h1>Credits: {course.credits}</h1>
                        </div>
                    ))
                }
                <div>
                    <h3>Prerequisites:</h3>
                </div>
                {
                    info.map(course => (
                        course.prerequisites.length === 0 ? <h3>NIL</h3> :
                        course.prerequisites.map(course => (
                            <div>
                            <Link to={`/course/${course.prereq_id}`} className="btn btn-primary">
                                <Button>{course.prereq_id} - {course.title}</Button>
                            </Link>
                            <br /><br />
                            </div>
                        ))
                    ))
                }
                <div>
                    <h3>Current instructors:</h3>
                </div>
                {
                    info.map(course => (
                        course.sections.length === 0 ? <h3>Course not offered this semester</h3> :
                        course.sections.map(section => (
                            <div>
                            <Link to={`/instructor/${section.instructor_id}`} className="btn btn-primary">
                                <Button>S{section.section} - Prof. {section.instructor_name}</Button>
                            </Link>
                            <br /><br />
                            </div>
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

export default CourseInfo;
