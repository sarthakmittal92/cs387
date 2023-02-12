import React, { Fragment, useState, useEffect } from 'react';
import { Button } from 'antd';
import '../../index.css';

const RegTable = ({ allCourses }) => {
    const [courses, setCourses] = useState([]);
    const [section, setSection] = useState('');
    const [courseid, setCourse] = useState('');

    const onChange = (event) => {
        const sid = event.target.value.split('#')[1];
        setSection(sid);
        const cid = event.target.value.split('#')[0];
        setCourse(cid);
    };

    const doReg = (event) => {
        console.log(event);
        const body = { cid: courseid, sid: section };
        try {
            fetch('http://localhost:5000/forMittal/canreg', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            })
                .then((res) => res.json())
                .then((parseData) => {
                    if (parseData.Yes && courseid !== "none") {
                        try {
                            fetch(
                                `http://localhost:5000/forMittal/doreg`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify(body)
                                }
                            )
                            .then((res) => res.json())
                            .then((parseData) => {
                                setCourses(courses.filter(course => course.course_id !== courseid));
                                window.location.reload();
                            });
                        } catch (err) {
                            console.error(err.message);
                        }
                    }
                    else {
                        // toast.error('Cannot register for this course');
                    }
                });
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        setCourses(allCourses);
    }, [allCourses, courses]);

    return (
        <Fragment>
            <center>
            <h2>Courses</h2>
            <table className="table mt-5 mytable">
                <tr>
                    <th className='idwidth'>Course ID</th>
                    <th className='titlewidth'>Title</th>
                    <th className='idwidth'>Sections</th>
                    <th className='idwidth'>Register</th>
                </tr>
                    {
                        courses.length !== 0 &&
                        courses.map(course => (
                            <tr>
                                <td>{course.course_id}</td>
                                <td>{course.title}</td>
                                <td>
                                <select onChange={onChange}>
                                    <option value="none" defaultValue selected>Select a section</option>
                                    {
                                        course.length !== 0 &&
                                        course.sections.length !== 0 &&
                                        course.sections.map(obj => (
                                            <option value={course.course_id + '#' + obj.section}>{obj.section}</option>
                                        ))
                                    }
                                </select>
                                </td>
                                <td>
                                    {
                                        <button
                                            className="btn btn-primary mybutton"
                                            onClick={doReg}>
                                            <Button type="primary">Register</Button>
                                        </button>
                                    }
                                </td>
                            </tr>
                        ))
                    }
            </table>
            </center>
        </Fragment>
    );
};

export default RegTable;
