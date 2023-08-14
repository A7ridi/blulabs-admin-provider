import React from 'react';
// import logo from '';
import Test from './components/test';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src='/assets/images/logo192.png' className="App-logo" alt="logo" />
                <p>Edit <code>src/App.js</code> and save to reload.</p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                > Learn React </a>
                <h1 className="color">TEST</h1>
            </header>
            <Test />
        </div>
    );
}

export default App;
