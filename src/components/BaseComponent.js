import React, { Component } from 'react';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import 'react-toastify/dist/ReactToastify.css';

toast.configure()
export default class extends Component {

    handleTextChange = (event) => {
        // const numerivVal = /^[0-9\b]+$/;
        // if (event.target.value === '' || numerivVal.test(event.target.value)) {
        this.setState({
            [event.target.name]: event.target.value,
            [event.target.name.validation]: false,
        })
        // }
    }
    // debounce(func, wait, immediate) {
    //     var timeout;
    //     return () => {
    //         var context = this,
    //             args = arguments;
    //         var callNow = immediate && !timeout;
    //         clearTimeout(timeout);
    //         timeout = setTimeout(() => {
    //             timeout = null;
    //             if (!immediate) {
    //                 func.apply(context, args);
    //             }
    //         }, wait);
    //         if (callNow) func.apply(context, args);
    //     }
    // }

    successnotify(message) {
        toast.success(<MyComponent message={message} />, {
            className: 'black-background',
            bodyClassName: "black-background",
            progressClassName: 'black-background',
            position: toast.POSITION.TOP_RIGHT,
            autoClose: true,
            closeButton: false
        });
    }
    errornotification(message) {
        toast.error(<MyComponent message={message} />, {
            className: 'black-background',
            bodyClassName: "black-background",
            progressClassName: 'black-background',
            position: toast.POSITION.TOP_RIGHT,
            autoClose: true,
            closeButton: false
        });
    }
    notify(message) {
        toast.error(<MyComponent message={message} />, {
            className: 'black-background',
            bodyClassName: "black-background",
            progressClassName: 'black-background',
            position: toast.POSITION.TOP_RIGHT,
            autoClose: true,
            closeButton: false
        });
    }
    sweetAlertbar(message, callback = null) {
        swal({
            title: "Successful",
            text: message,
            icon: "success",
            dangerMode: false,
        })
            .then(willDelete => {
                if (willDelete) {
                    if (callback) callback()
                    return
                }
            });
    }
    ErrorAlertbar(message, callback = null) {
        swal({
            title: "There is an Error!",
            text: message,
            icon: "error",
            dangerMode: true,
        })
            .then(willDelete => {
                if (willDelete) {
                    callback && callback()

                    return
                }
            });
    }
}
const MyComponent = (props) => {
    return (
        <div style={{ justifyContent: "center", alignItems: "center" }}>
            <h4 >{props.message}</h4>
        </div>
    )
}