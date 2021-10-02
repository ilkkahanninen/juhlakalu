import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { getCurrentUser } from "./api/api";
import { AppStateProvider, errorL, useAppState, userL } from "./state/AppState";
import { LoginView } from "./views/login/LoginView";
import { MainView } from "./views/main/MainView";

import "./style/normalize.css";
import "./style/typography.less";
import { useOnMount } from "./state/useOnMount";
import { LogoutHandler } from "./views/login/LogoutHandler";

const App = () => (
  <AppStateProvider>
    <AuthCheck />
  </AppStateProvider>
);

const initialAuthCheck = getCurrentUser();

const AuthCheck = () => {
  const { state, dispatchTaskEither } = useAppState();
  const [isReady, setReady] = useState(false);

  useOnMount(() => {
    dispatchTaskEither(initialAuthCheck, errorL.set, userL.set).then(() =>
      setReady(true)
    );
  });

  return isReady ? state.user ? <Routing /> : <LoginView /> : null;
};

const Routing = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <MainView />
      </Route>
      <Route path="/logout">
        <LogoutHandler />
      </Route>
      <Route>404 Not found</Route>
    </Switch>
  </Router>
);

ReactDOM.render(<App />, document.getElementById("app"));
