import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
// import logo from './logo.svg';
import './App.css';

import VictimScreen from './components/VictimScreen';
import HospitalScreen from './components/HospitalScreen';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/hospital" component={HospitalScreen} />
        <Route path="/*" component={VictimScreen} />
      </Switch>
    </Router>
  );
}

export default App;
