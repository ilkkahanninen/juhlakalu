import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { getCurrentUser } from "./api/api";
import { AppStateProvider, useAppState, userL } from "./state/AppState";
import { useBool } from "./state/useBool";
import { useOnMount } from "./state/useOnMount";
import { ignoreDispatch } from "./state/useStore";
import { CompoMgmtView } from "./views/compoMgmt/CompoMgmtView";
import { MainView } from "./views/main/MainView";

const App = () => (
  <AppStateProvider>
    <CssBaseline />
    <AuthCheck />
  </AppStateProvider>
);

const initialAuthCheck = getCurrentUser();

const AuthCheck = () => {
  const { state, dispatchTaskEither } = useAppState();
  const isReady = useBool(false);

  useOnMount(() => {
    dispatchTaskEither(initialAuthCheck, ignoreDispatch, userL.set).then(
      isReady.set
    );
  });

  return isReady ? <Routing /> : null;
};

const Routing = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <MainView />
      </Route>
      <Route exact path="/admin/compos">
        <CompoMgmtView />
      </Route>
      <Route>404 Not found</Route>
    </Switch>
  </Router>
);

ReactDOM.render(<App />, document.getElementById("app"));
