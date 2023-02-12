import React, { Fragment, useState, useEffect } from 'react';
import { Table } from 'antd';

const ListCourses = ({ allCourses }) => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        setCourses(allCourses);
    }, [allCourses]);

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
            title: 'Grade',
            dataIndex: 'grade',
            render: (grade) => grade,
            key: 'grade',
            width: 80,
            align: 'center'
        },
    ];

    return (
        <Fragment>
            <table className="table mt-5">
                <center>
                <h2>Past Semesters</h2>
                <div>
                    {
                        courses.length !== 0 &&
                        courses.map(courseList => (
                            <div>
                                <center>
                                {
                                    courseList.length !== 0 &&
                                    <h3>{courseList[0].semester} {courseList[0].year}</h3>
                                }
                                </center>
                                {
                                    courseList.length !== 0 &&
                                    <Table dataSource={courseList} columns={keys} pagination={false} />
                                }
                            </div>
                        ))
                    }
                </div>
                </center>
            </table>
        </Fragment>
    );
};

export default ListCourses;
