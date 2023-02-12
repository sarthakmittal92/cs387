import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Button, Table } from 'antd';
import '../../index.css';

// components
import ListCourses from '../course/ListCourses';
import RunningCourses from '../course/RunningCourses';

const Home = ({ setAuth }) => {
    const [ID, setID] = useState('');
    const [name, setName] = useState('');
    const [deptName, setDept] = useState('');
    const [credits, setCredits] = useState('');
    const [runningCourses, setRunningCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    const getProfile = async () => {
        try {
            console.log(localStorage.token);
            const res = await fetch(
                'http://localhost:5000/forMittal/home',
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            const parseData = await res.json();
            setID(parseData.id);
            setName(parseData.name);
            setDept(parseData.department);
            setCredits(parseData.total_credits);
            if (parseData.curr_sem) {
                setRunningCourses(parseData.curr_sem);
            }
            if (parseData.sems) {
                setAllCourses(parseData.sems);
            }
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
        getProfile();
    }, []);

    const studentData = [
        {
            id: ID,
            name: name,
            department: deptName,
            credits: credits
        }
    ];

    const keys = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center'
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            align: 'center'
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            width: 200,
            align: 'center'
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            width: 120,
            align: 'center'
        }
    ];

    return (
        <div className='jumbotron mt-5 center'>
            <center>
            <div className="jumbotron mt-5">
                <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                <br /><br /><br /><br /><br />
                <Table className='jumbotron mymargin' dataSource={studentData} columns={keys} pagination={false} />
                <br />
                <Link to="/home/registration" className="btn btn-primary">
                    <Button type="primary">
                        Registration
                    </Button>
                </Link>
                <p />
                <Link to="/course/running" className="btn btn-primary">
                    <Button>
                        Running Courses
                    </Button>
                </Link>
            </div>
            <br />
            <RunningCourses runningCourses={runningCourses} />
            <br />
            <ListCourses allCourses={allCourses} />
            <br />
            <button onClick={e => logout(e)} className="btn btn-primary mybutton">
                <Button type="primary" className="btn btn-success btn-block">
                    Logout
                </Button>
            </button>
            <br /><br /><br /><br /><br /><br /><br /><br /><br />
            </center>
        </div>
    );
};

export default Home;
