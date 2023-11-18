let bearerToken;
let customerID;

function authenticate() {
  const loginForm = document.getElementById("loginForm");
  const login_id = loginForm.elements.login_id.value;
  const password = loginForm.elements.password.value;

  fetch("https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login_id: login_id,
      password: password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      return response.json();
    })
    .then((data) => {
      bearerToken = data.access_token;

      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("customerListScreen").style.display = "block";

      getCustomerList();
    })
    .catch((error) => {
      console.error("Authentication failed:", error.message);
    });
}

function getCustomerList() {

  fetch(
    "https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to get customer list");
      }
      return response.json();
    })
    .then((data) => {
      const customerListTable = document.getElementById("customerList");
      customerListTable.innerHTML = "";

      data.forEach((customer) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${customer.first_name}</td>
                <td>${customer.last_name}</td>
                <td>${customer.street}</td>
                <td>${customer.address}</td>
                <td>${customer.city}</td>
                <td>${customer.state}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>
                    <button onclick="updateCustomer('${customer.uuid}')">Update</button>
                    <button onclick="deleteCustomer('${customer.uuid}')">Delete</button>
                </td>
            `;
        customerListTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Failed to get customer list:", error.message);
    });
}

function createCustomer() {
  const customerForm = document.getElementById("customerForm");
  const firstName = customerForm.elements.first_name.value;
  const lastName = customerForm.elements.last_name.value;
  const street = customerForm.elements.street.value;
  const address = customerForm.elements.address.value;
  const city = customerForm.elements.city.value;
  const state = customerForm.elements.state.value;
  const email = customerForm.elements.email.value;
  const phone = customerForm.elements.phone.value;

  fetch(
    "https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        street: street,
        address: address,
        city: city,
        state: state,
        email: email,
        phone: phone,
      }),
    }
  )
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      if (data.includes("Successfully Created")) {
        showCustomerListScreen();
      } else {
        throw new Error(`Failed to create customer. Message: ${data}`);
      }
    })
    .catch((error) => {
      console.error("Failed to create customer:", error.message);
    });
}

function updateCustomer(uuid) {
  customerID = uuid;
  showUpdateCustomerScreen();
}

function submitUpdateCustomer() {
  const updateForm = document.getElementById("updateCustomerForm");
  const updatedFirstName = updateForm.elements.update_first_name.value;
  const updatedLastName = updateForm.elements.update_last_name.value;
  const updatedStreet = updateForm.elements.update_street.value;
  const updatedAddress = updateForm.elements.update_address.value;
  const updatedCity = updateForm.elements.update_city.value;
  const updatedState = updateForm.elements.update_state.value;
  const updatedEmail = updateForm.elements.update_email.value;
  const updatedPhone = updateForm.elements.update_phone.value;

  fetch(
    `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=update&uuid=${customerID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        first_name: updatedFirstName,
        last_name: updatedLastName,
        street: updatedStreet,
        address: updatedAddress,
        city: updatedCity,
        state: updatedState,
        email: updatedEmail,
        phone: updatedPhone,
      }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    })
    .then((data) => {
      if (typeof data === "object") {
        document.getElementById("updateCustomerScreen").style.display = "none";
        document.getElementById("customerListScreen").style.display = "block";
        getCustomerList();
      } else {
        document.getElementById("updateCustomerScreen").style.display = "none";
        document.getElementById("customerListScreen").style.display = "block";

        getCustomerList();
      }
    })
    .catch((error) => {
      console.error("Failed to update customer:", error.message);
    });
}

function deleteCustomer(uuid) {

  fetch(
    `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=delete&uuid=${uuid}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  )
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      if (data.includes("Successfully deleted")) {
        showCustomerListScreen();
      } else if (data.includes("UUID not found")) {
        throw new Error(`UUID not found. Message: ${data}`);
      } else {
        throw new Error(`Failed to delete customer. Message: ${data}`);
      }
    })
    .catch((error) => {
      console.error("Failed to delete customer:", error.message);
    });
}

function showAddCustomerScreen() {
  document.getElementById("customerListScreen").style.display = "none";
  document.getElementById("addCustomerScreen").style.display = "block";
}

function showCustomerListScreen() {
  document.getElementById("addCustomerScreen").style.display = "none";
  document.getElementById("customerListScreen").style.display = "block";

  getCustomerList();
}

function showUpdateCustomerScreen() {
  document.getElementById("customerListScreen").style.display = "none";
  document.getElementById("updateCustomerScreen").style.display = "block";
}
