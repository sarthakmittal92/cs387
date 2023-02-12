import React, { Fragment, useState, useEffect } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from 'react-router-dom';

// import { toast } from 'react-toastify';

// components
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/home/Home';
import Registration from './components/home/Registration';
import Landing from './components/Landing';
import AllRunningCourses from './components/course/AllRunningCourses';
import CourseInfo from './components/course/CourseInfo';
import DeptRunningCourses from './components/course/DeptRunningCourses';
import InstructorInfo from './components/instructor/InstructorInfo';

// toast.configure();

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuthenticated = async () => {
        try {
            const res = await fetch('http://localhost:5000/auth/verify',
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
            const parseRes = await res.json();
            return parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
        } catch (err) {
            console.error('checkAuthenticated error: ', err.message);
            return err;
        }
    };

    useEffect(() => {
        checkAuthenticated();
    }, []);

    const setAuth = (boolean) => {
        setIsAuthenticated(boolean);
    };

    return (
        <Fragment>
            <Router>
                <div className="container">
                    <Routes>
                        <Route
                            exact
                            path="/"
                            element={<Landing />} />
                        <Route
                            exact
                            path="/login"
                            element={(!isAuthenticated ? (
                                <Login setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/home" />
                                ))
                            } />
                        <Route
                            exact
                            path="/signup"
                            element={(!isAuthenticated ? (
                                <Signup setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/home" />
                                ))
                            } />
                        <Route
                            exact
                            path="/home"
                            element={(isAuthenticated ? (
                                <Home setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/login" />
                                ))
                            } />
                        <Route
                            exact
                            path="/home/registration"
                            element={(isAuthenticated ? (
                                <Registration setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/login" />
                                ))
                            } />
                        <Route
                            exact
                            path="/course/running"
                            element={(isAuthenticated ? (
                                <AllRunningCourses setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/login" />
                                ))
                            } />
                        <Route
                            exact
                            path="/course/running/:dept_name"
                            element={(isAuthenticated ? (
                                <DeptRunningCourses setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/login" />
                                ))
                            } />
                        <Route
                            exact
                            path="/course/:course_id"
                            element={(isAuthenticated ? (
                                <CourseInfo setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/login" />
                                ))
                            } />
                        <Route
                            exact
                            path="/instructor/:instructor_id"
                            element={(isAuthenticated ? (
                                <InstructorInfo setAuth={setAuth} />
                                ) : (
                                    <Navigate to="/login" />
                                ))
                            } />
                    </Routes>
                </div>
            </Router>
        </Fragment>
    );
}

export default App;
