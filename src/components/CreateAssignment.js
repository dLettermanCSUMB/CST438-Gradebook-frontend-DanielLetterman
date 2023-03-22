import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Cookies from 'js-cookie';
import {SERVER_URL} from '../constants.js';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import {Link} from "react-router-dom";


class CreateAssignment extends React.Component {
    constructor(props) {
        super(props);
        console.log("CreateAssignment.cnstr "+ JSON.stringify(props.location));
        this.state = { assignmentName: "", minDate: new Date().setHours(23,59,59,999), dueDate: new Date().setHours(0,0,0,0), selectedCourseId: new Number , courses: [] };
    };

    componentDidMount() {
        this.fetchInstructorCourses();
    }

    fetchInstructorCourses = () => {
        console.log("CreateAssignment.fetchInstructorCourses");
        const token = Cookies.get('XSRF-TOKEN');
        fetch(`${SERVER_URL}/createAssignment`,
            {
                method: 'GET',
                headers: { 'X-XSRF-TOKEN': token }
            } )
            .then((response) => response.json())
            .then((responseData) => {
                if (Array.isArray(responseData.courses)) {
                    this.setState({ courses: responseData.courses.map((course, index) => ( { id: index, ...course } )) });
                } else {
                    toast.error("Fetch failed.", {
                        position: toast.POSITION.BOTTOM_LEFT
                    });
                }
            })
            .catch(err => console.error(err));
    }

    handleSubmit = () => {
        console.log("CreateAssignment.handleSubmit");
        const token = Cookies.get('XSRF-TOKEN');

        if (this.state.assignmentName.length < 6) {
            toast.error("Assignment must have a name with minimum 6 characters", {
                position: toast.POSITION.BOTTOM_LEFT
            });
            console.error("CreateAssignment.handleSubmit: assignmentName too short");
            return
        } else if (this.state.dueDate <= this.state.minDate) {
            toast.error("Please select a later due date", {
                position: toast.POSITION.BOTTOM_LEFT
            });
            console.error("CreateAssignment.handleSubmit: dueDate is less then minDate");
            return
        } else if (this.state.selectedCourseId == 0) {
            toast.error("Please select a course", {
                position: toast.POSITION.BOTTOM_LEFT
            });
            console.error("CreateAssignment.handleSubmit: no course selected");
            return
        }

        fetch(`${SERVER_URL}/createAssignment` ,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': token },
                body: JSON.stringify({assignmentName: this.state.assignmentName, dueDate: this.state.dueDate, courseId: this.state.selectedCourseId})
            } )
            .then(res => {
                if (res.ok) {
                    toast.success("Assignment successfully created", {
                        position: toast.POSITION.BOTTOM_LEFT
                    });
                } else {
                    toast.error("Assignment creation failed", {
                        position: toast.POSITION.BOTTOM_LEFT
                    });
                    console.error('Put http status =' + res.status);
                }})
            .catch(err => {
                toast.error("Assignment creation failed", {
                    position: toast.POSITION.BOTTOM_LEFT
                });
                console.error(err);
            });
    };

    handleDateChange = (date) => {
        console.log("CreateAssignment.handleDateChange " + Date.parse(date));
        this.setState({
            dueDate: Date.parse(date)
        })
    }

    handleNameChange = (name) => {
        console.log("CreateAssignment.handleNameChange " + name.target.value);
        this.setState({
            assignmentName: name.target.value
        })
    }

    handleCourseSelect = (courseId) => {
        console.log("CreateAssignment.handleCourseSelect " + courseId.target.value);
        this.setState({selectedCourseId: courseId.target.value});
    }

    render() {

        const assignmentName = this.state.assignmentName;
        const dueDate = this.state.dueDate;
        const minDate = this.state.minDate;
        const courses = this.state.courses;

        return (
            <div align="left">

                <h2>Create Assignment:</h2>
               <Grid container paddingX={10}>
                   <Grid item align="right">
                       <h3 >Assignment Name: </h3>
                       <h3>Due Date: </h3>
                       <h3>Course: </h3>
                   </Grid>
                   <Grid item align="left" paddingX={2}>
                       <h3><input id="assignmentName" value={assignmentName} onChange={this.handleNameChange}></input></h3>
                       <h3><DatePicker id="dueDate" selected={dueDate} onChange={this.handleDateChange} dateFormat={"yyyy-MM-dd"} minDate={minDate}/></h3>
                       <h3> <select id="courseSelect " onChange={ this.handleCourseSelect }>
                               <option value={0}>Please select</option>
                               { courses.map( (course, index) => {return <option key={index} value={course.courseId}>{course.title}</option>} ) }
                           </select></h3>
                   </Grid>
               </Grid>
                <Button component={Link} to={{pathname:'/'}}
                        id="Submit" variant="outlined" color="primary" style={{margin: 10}} onClick={this.handleSubmit} >
                    Submit
                </Button>
                <ToastContainer autoClose={1500} />

                <div style={{ width: '100%', align:"left"   }}>
                    For DEBUG:  display state.
                    {JSON.stringify(this.state)}
                </div>
            </div>
        )
    }
}

export default CreateAssignment;