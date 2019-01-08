import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import { s3Upload } from "../libs/awsLib";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Orders.css";

export default class Orders extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isDeleting: null,
      order: null,
      customerOrder: "",
      content: "",
      dateReceived: "",
      dateCompleted: "",
      delivery: "",
      initials: "",
      invoiceNumber: "",
      notes: "",
      attachmentURL: null
    };
  }

  async componentDidMount() {
    try {
      let attachmentURL;
      const order = await this.getOrder();
      console.log(order);
      const {
        content,
        dateReceived,
        dateCompleted,
        customerOrder,
        delivery,
        initials,
        invoiceNumber,
        notes,
        attachment
      } = order;

      if (attachment) {
        attachmentURL = await Storage.vault.get(attachment);
      }

      this.setState({
        order,
        content,
        dateReceived,
        dateCompleted,
        customerOrder,
        delivery,
        initials,
        invoiceNumber,
        notes,
        attachmentURL
      });
    } catch (e) {
      alert(e);
    }
  }

  getOrder() {
    return API.get("orders", `/orders/${this.props.match.params.id}`);
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleFileChange = event => {
    this.file = event.target.files[0];
  };

  saveOrder(order) {
    return API.put("orders", `/orders/${this.props.match.params.id}`, {
      body: order
    });
  }

  handleSubmit = async event => {
    let attachment;

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
      if (this.file) {
        attachment = await s3Upload(this.file);
      }

      await this.saveOrder({
        content: this.state.content,
        dateReceived: this.state.dateReceived,
        dateCompleted: this.state.dateCompleted,
        customerOrder: this.state.customerOrder,
        delivery: this.state.delivery,
        initials: this.state.initials,
        invoiceNumber: this.state.invoiceNumber,
        notes: this.state.notes,
        attachment: attachment || this.state.order.attachment
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  };

  deleteOrder() {
    return API.del("orders", `/orders/${this.props.match.params.id}`);
  }

  handleDelete = async event => {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) {
      return;
    }

    this.setState({ isDeleting: true });

    try {
      await this.deleteOrder();
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  };

  render() {
    return (
      <div className="Orders">
        {this.state.order && (
          <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="content">
              <ControlLabel>Customer</ControlLabel>
              <FormControl
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
            <FormGroup controlId="customerOrder">
              <ControlLabel>Order</ControlLabel>
              <FormControl
                onChange={this.handleChange}
                value={this.state.customerOrder}
                placeholder="10 lbs - May '68"
                bsSize="large"
              />
            </FormGroup>
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
              {!this.state.order.attachment && (
                <ControlLabel>Attachment</ControlLabel>
              )}
              <FormControl onChange={this.handleFileChange} type="file" />
            </FormGroup>
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Save"
              loadingText="Saving…"
            />
            <LoaderButton
              block
              bsStyle="danger"
              bsSize="large"
              isLoading={this.state.isDeleting}
              onClick={this.handleDelete}
              text="Delete"
              loadingText="Deleting…"
            />
          </form>
        )}
      </div>
    );
  }
}
