import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";
import { API } from "aws-amplify";

import { s3Upload } from "../libs/awsLib";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./NewOrder.css";

export default class NewOrder extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      customerOrder: [{ name: "" }],
      content: "",
      dateReceived: "",
      dateCompleted: "",
      delivery: "",
      initials: "",
      invoiceNumber: "",
      notes: ""
    };
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  handleChange = event => {
    if (["name form-control input-lg"].includes(event.target.className)) {
      let customerOrder = [...this.state.customerOrder];
      customerOrder[event.target.dataset.id] = event.target.value;
      this.setState({ customerOrder }, () =>
        console.log(this.state.customerOrder)
      );
    } else {
      this.setState({
        [event.target.id]: event.target.value
      });
    }
  };

  handleFileChange = event => {
    this.file = event.target.files[0];
  };

  handleSubmit = async event => {
    event.preventDefault();

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }

    this.setState({ isLoading: true });

    try {
      const attachment = this.file ? await s3Upload(this.file) : null;

      await this.createOrder({
        attachment,
        customerOrder: this.state.customerOrder,
        content: this.state.content,
        dateReceived: this.state.dateReceived,
        dateCompleted: this.state.dateCompleted || null,
        delivery: this.state.delivery || null,
        initials: this.state.initials,
        invoiceNumber: this.state.invoiceNumber || null,
        notes: this.state.notes || null
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  };

  addCustomerOrder = e => {
    this.setState(prevState => ({
      customerOrder: [...prevState.customerOrder, { name: "" }]
    }));
  };

  createOrder(order) {
    console.log(order);
    return API.post("orders", "/orders", {
      body: order
    });
  }

  render() {
    let { customerOrder } = this.state;
    return (
      <div className="NewOrder">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="content">
            <ControlLabel>Customer</ControlLabel>
            <FormControl
              required={true}
              onChange={this.handleChange}
              value={this.state.content}
              placeholder="Thread Coffee"
              bsSize="large"
            />
          </FormGroup>
          <div className="date-container">
            <FormGroup controlId="dateReceived">
              <ControlLabel>Date Received</ControlLabel>
              <FormControl
                required={true}
                onChange={this.handleChange}
                value={this.state.dateReceived}
                type="date"
                className="date-area"
              />
            </FormGroup>
            <FormGroup controlId="dateCompleted">
              <ControlLabel>Date Completed</ControlLabel>
              <FormControl
                onChange={this.handleChange}
                value={this.state.dateCompleted}
                type="date"
                className="date-area"
              />
            </FormGroup>
          </div>
          <ControlLabel>Order</ControlLabel>
          {customerOrder.map((val, i) => {
            let orderId = `customerOrder[${i}]`;
            return (
              <div key={i}>
                <FormGroup controlId={orderId}>
                  <FormControl
                    required={true}
                    onChange={this.handleChange}
                    name={orderId}
                    data-id={i}
                    id={orderId}
                    value={this.val}
                    placeholder="10 lbs - May '68"
                    bsSize="large"
                    className="name"
                  />
                </FormGroup>
              </div>
            );
          })}
          <Button bsStyle="primary" onClick={this.addCustomerOrder}>
            Add
          </Button>
          <FormGroup controlId="delivery">
            <ControlLabel>Delivery Type</ControlLabel>
            <FormControl
              onChange={this.handleChange}
              value={this.state.delivery}
              placeholder="Pick Up"
              bsSize="large"
            />
          </FormGroup>
          <div className="date-container">
            <FormGroup controlId="invoiceNumber">
              <ControlLabel>Invoice Number</ControlLabel>
              <FormControl
                onChange={this.handleChange}
                value={this.state.invoiceNumber}
                placeholder="1156"
                bsSize="large"
              />
            </FormGroup>
            <FormGroup controlId="initials">
              <ControlLabel>Employee Initials</ControlLabel>
              <FormControl
                required={true}
                onChange={this.handleChange}
                value={this.state.initials}
                placeholder="JRL"
                bsSize="large"
              />
            </FormGroup>
          </div>

          <FormGroup controlId="notes">
            <ControlLabel>Notes</ControlLabel>
            <FormControl
              onChange={this.handleChange}
              value={this.state.notes}
              placeholder="Ground course..."
              componentClass="textarea"
            />
          </FormGroup>
          <FormGroup controlId="file">
            <ControlLabel>Attachment</ControlLabel>
            <FormControl onChange={this.handleFileChange} type="file" />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create"
            loadingText="Creating…"
          />
        </form>
      </div>
    );
  }
}
