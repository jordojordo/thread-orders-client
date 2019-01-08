import React from "react";
import { Route, Switch } from "react-router-dom";

import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import AppliedRoute from "./components/AppliedRoute";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NewOrder from "./containers/NewOrder";
import Orders from "./containers/Orders";
import NotFound from "./containers/NotFound";

export default ({ childProps }) => (
	<Switch>
		<AppliedRoute path="/" exact component={Home} props={childProps} />
		<UnauthenticatedRoute
			path="/login"
			exact
			component={Login}
			props={childProps}
		/>
		<UnauthenticatedRoute
			path="/signup"
			exact
			component={Signup}
			props={childProps}
		/>
		<AuthenticatedRoute
			path="/orders/new"
			exact
			component={NewOrder}
			props={childProps}
		/>
		<AuthenticatedRoute
			path="/orders/:id"
			exact
			component={Orders}
			props={childProps}
		/>

		{/* Finally, catch all unmatched routes */}
		<Route component={NotFound} />
	</Switch>
);
