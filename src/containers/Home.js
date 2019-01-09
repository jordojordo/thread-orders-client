import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";

import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      orders: []
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const orders = await this.orders();
      this.setState({ orders });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  orders() {
    return API.get("orders", "/orders");
  }

  renderOrdersList(orders) {
    return [{}].concat(orders).map((order, i) =>
      i !== 0 ? (
        <LinkContainer
          key={order.userOrders}
          to={`/orders/${order.userOrders}`}
        >
          <ListGroupItem header={order.content.trim().split("\n")[0]}>
            <ListGroup>{"\n"}</ListGroup>
            {"Order: " + order.customerOrder}
            {" | Date Received: " + order.dateReceived}
            <ListGroup>{"\n"}</ListGroup>
            {order.dateCompleted ? (
              <ListGroupItem bsStyle="success">
                {"Date Completed: " + order.dateCompleted}
              </ListGroupItem>
            ) : null}
          </ListGroupItem>
        </LinkContainer>
      ) : (
        <LinkContainer key="new" to="/orders/new">
          <ListGroupItem>
            <h4>
              <b>{"\uFF0B"}</b> Create a new order
            </h4>
          </ListGroupItem>
        </LinkContainer>
      )
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Thread</h1>
        <p>A simple order logging app</p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  renderOrders() {
    return (
      <div className="orders">
        <PageHeader>Your Orders</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderOrdersList(this.state.orders)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderOrders() : this.renderLander()}
      </div>
    );
  }
}
