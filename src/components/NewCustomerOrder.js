import React from "react";
import { FormControl } from "react-bootstrap";

const NewCustomerOrder = () => {
	return (
		<FormControl
			required={true}
			placeholder="10 lbs - May '68"
			bsSize="large"
		/>
	);
};

export default NewCustomerOrder;
