import React, { Fragment, useState, useEffect } from 'react';
import { Button, Table } from 'antd';

const RunningCourses = ({ runningCourses }) => {
    console.log(runningCourses);
    const [courses, setCourses] = useState([]);

    async function dropCourse(courseID) {
        try {
            await fetch(
                `http://localhost:5000/forMittal/drop/${courseID}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            setCourses(courses.filter(course => course.course_id !== courseID));
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        setCourses(runningCourses);
    }, [runningCourses]);

    const keys = [
        {
            title: 'ID',
            dataIndex: 'course_id',
            render: (course_id) => course_id,
            key: 'course_id',
            width: 100,
            align: 'center'
        },
        {
            title: 'Section',
            dataIndex: 'sec_id',
            render: (sec_id) => sec_id,
            key: 'section',
            width: 100,
            align: 'center'
        },
        {
            title: 'Title',
            dataIndex: 'title',
            render: (title) => title,
            key: 'title',
            width: 400,
            align: 'center'
        },
        {
            title: 'Drop',
            dataIndex: 'course_id',
            render: (course_id) =>
                <button
                    className="btn btn-danger mybutton"
                    onClick={() => dropCourse(course_id)}>
                    <Button type="primary">Drop</Button>
                </button>,
            key: 'drop',
            width: 80,
            align: 'center'
        }
    ];

    return (
        <Fragment>
            <table className="table mt-5">
                <center>
                <h2>Current Semester</h2>
                <div>
                    <center>
                    {
                        courses.length !== 0 &&
                        <h3>{courses[0].semester} {courses[0].year}</h3>
                    }
                    </center>
                    {
                        // courses.length !== 0 &&
                        <Table dataSource={courses} columns={keys} pagination={false} />
                    }
                </div>
                </center>
            </table>
        </Fragment>
    );
};

export default RunningCourses;
