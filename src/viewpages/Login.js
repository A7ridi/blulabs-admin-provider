import React from 'react';
import * as i18n from '../I18n/en.json'
// import BaseComponent from '../components/BaseComponent';

const Login = (props) => {
    return (
        <div className="App" style={{ flex: 1 }}>
            <div className="login-btn-wrapper" >
                <button className="login-btn" onClick={() => props.history.push('/samllogin')} >{i18n && i18n.login && i18n.login.samltext}</button>
            </div>
        </div>
    )
}
export default Login;