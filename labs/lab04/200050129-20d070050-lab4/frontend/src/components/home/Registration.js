import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import RegTable from './RegTable';
import { Button } from 'antd';
import '../../index.css';

const Registration = ({ setAuth }) => {
    const [items, setItems] = useState([]);
    const [courseInfo, setCourseInfo] = useState([]);

    const getCourses = async () => {
        try {
            fetch(
                'http://localhost:5000/course/running',
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            )
            .then((res) => res.json())
            .then((parseData) => {
                var temp = [];
                parseData.map((val, key) => {
                    temp[key] = { id: val.course_id, name: val.course_id};
                });
                setItems(temp);
            });
            
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getCourses();
    }, [courseInfo]);

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

    const handleOnSearch = async (string, results) => {
        console.log(string,results);
        var temp2 = [];
        for (let i = 0; i < results.length; i++) {
            const res = await fetch(
                `http://localhost:5000/forMittal/cinfo/${results[i].id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            const parseData = await res.json();
            temp2[i] = parseData;
        }
        setCourseInfo(temp2);
    };

    const handleOnHover = (result) => {
        // the item hovered
        console.log(result);
    };

    const handleOnSelect = async (item) => {
        // the item selected
        console.log(item);
        const res = await fetch(
            `http://localhost:5000/forMittal/cinfo/${item.id}`,
            {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include'
            }
        );
        const parseData = await res.json();
        setCourseInfo([parseData]);
    };

    const handleOnFocus = () => {
        console.log('Focused');
    };

    const formatResult = item => (
        <div>
            <span style={{ display: 'block', textAlign: 'left' }}>Course {item.name}</span>
            {/* <span style={{ display: 'block', textAlign: 'left' }}>name: {item.name}</span> */}
        </div>
    );

    return (
        <div>
            <center>
            <div>
                <ReactSearchAutocomplete className="center mysearch"
                    items={items}
                    onSearch={handleOnSearch}
                    onHover={handleOnHover}
                    onSelect={handleOnSelect}
                    onFocus={handleOnFocus}
                    autoFocus
                    formatResult={formatResult} />
                <RegTable allCourses={courseInfo} />
            </div>
            <br />
            <button onClick={e => logout(e)} className="btn btn-primary mybutton">
                <Button type="primary" className="btn btn-success btn-block">
                    Logout
                </Button>
            </button>
            </center>
        </div>
    );
};

export default Registration;
