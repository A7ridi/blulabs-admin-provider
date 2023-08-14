import React, { Component } from 'react';
import * as firebase from 'firebase/app';
import LoadingIndicator from '../common/LoadingIndicator'
import Apimanager from '../Apimanager/index'
import 'firebase/auth';
import 'firebase/database';
import * as i18n from '../I18n/en.json'
import swal from 'sweetalert';

var isLoading = '';
if (localStorage.getItem("redirect") === 'yes') {
    isLoading = true;
}

class DemoLoginLog extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            redirectBy: false
        }
    }

    componentWillMount() {

        this.handleLoad()
    }

    handleLoad = () => {

        firebase.auth().getRedirectResult().then(result => {

            this.setState({
                redirectBy: true,
                loading: false
            })

            let params = {
                'data': result
            }
            Apimanager.postLoginLog(params, success => {

            }, error => {

                if (error && error.status === 500) {
                    this.notify((error.message) || (error.data && error.data.settings && error.data.settings.message))
                    return

                }
            })


            if (!result.credential) {

                isLoading = false;
                this.setState({
                    loading: false
                })
            }

        }).catch(error => {
            // Handle Errors here.
            var errorCode = error.code;
            isLoading = false;
            this.setState({
                loading: false
            })
            localStorage.removeItem("redirect");
            swal("Something went wrong!", error.message, "error");

            if (errorCode === 'auth/account-exists-with-different-credential') {
                swal("Something went wrong!", 'You have already signed up with a different auth provider for that email.', "error");

            } else {
                console.error(error);
            }
        });

        if (!this.state.redirectBy) {
            firebase.auth().onAuthStateChanged((result) => {

                this.setState({
                    loading: false
                })

            })
        }

    }



    getNorthwelluser = async () => {
        this.login();
    }
    login() {
        localStorage.setItem('redirect', 'yes');
        const provider = new firebase.auth.SAMLAuthProvider(process.env.REACT_APP_FIREBASEAUTHPROVIDER);

        firebase.auth().signInWithRedirect(provider)

    }
    render() {
        return (
            <div className="App" style={{ flex: 1 }}>
                <div className="login-btn-wrapper" >
                    {isLoading && this.state.loading ? <LoadingIndicator /> : <button className="login-btn" onClick={() => this.getNorthwelluser()} >{i18n && i18n.login && i18n.login.samltext}</button>}
                </div >
            </div>
        );
    }
}


export default DemoLoginLog;