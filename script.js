/* Fetch list of CIDs being pinned */
async function fetchData() {
  chrome.storage.local.get(["node_ip", "node_port"]).then(async (keys) => {
    const response = await fetch(
      `http://${keys.node_ip}:${keys.node_port}/api/v0/pin/ls`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
        },
      }
    );

    const result = await response.json();

    /* Append data to table in Pins tab */
    if (Object.keys(result.Keys).length > 0) {
      const tableBody = document.querySelector("#pins tbody");
      tableBody.innerHTML = "";

      for (let x = 0; x < Object.keys(result.Keys).length; x++) {
        const row = document.createElement("tr");

        const indexCell = document.createElement("td");
        indexCell.textContent = x + 1;

        const cidCell = document.createElement("td");
        // apply CID value to id attribute
        const cid_value = Object.keys(result.Keys)[x];
        cidCell.textContent = Object.keys(result.Keys)[x].slice(0, 24) + "...";

        const typeCell = document.createElement("td");
        typeCell.textContent = result.Keys[Object.keys(result.Keys)[x]].Type;

        row.appendChild(indexCell);
        row.appendChild(cidCell);
        row.appendChild(typeCell);
        // Add remove button to row
        row.appendChild(addRemoveButtonToRow(cid_value));

        tableBody.appendChild(row);
      }
    }
  });
}

/* Add remove button to row */
function addRemoveButtonToRow(cid) {
  // Create a div and a button to display remove pin option
  const container = document.createElement("div");
  const hiddenInput = document.createElement("input");
  const button = document.createElement("button");

  // Setting style and attributes for button
  button.innerText = "X";
  button.id = "remove-pin";
  button.classList.add("btn", "btn-danger");

  // Setting style and attributes for hidden value
  hiddenInput.type = "hidden";
  hiddenInput.id = "pin-id";
  hiddenInput.value = cid;

  // Add elements to container
  container.appendChild(hiddenInput);
  container.appendChild(button);
  return container;
}

/*Event action that removes the Pinned id from local IPFS node */
async function removePin(cid, rowid) {
  chrome.storage.local.get(["node_ip", "node_port"]).then(async (keys) => {
    const response = await fetch(
      `http://${keys.node_ip}:${keys.node_port}/api/v0/pin/rm?arg=${cid}`,
      {
        method: "POST",
      }
    );
    if (response.status === 200) {
      // refresh the table by removing the row with the corresponding cid that was just removed
      const table = document.getElementById("pins");
      table.deleteRow(rowid);
    } else {
      alert("Failed to remove pin!");
    }
  });
}

/* Return an array rows in the table that are not hidden based on filters */
function getVisibleRows(table) {
  const rows = table.getElementsByTagName("tr");
  const visibleRows = Array.from(rows).filter((row) => {
    return (
      !row.hasAttribute("style") ||
      row.getAttribute("style") !== "display: none;"
    );
  });
  return visibleRows;
}

/* Switch to settings tab */
function clickedSettings() {
  let tab = document.getElementById("pin-tab");
  let other = document.getElementById("settings-tab");

  tab.classList.remove("active");
  other.classList.add("active");

  let settings = document.getElementById("settings");
  settings.style.display = "block";

  let pins = document.getElementById("pins");
  pins.style.display = "none";

  chrome.storage.local.get(["node_ip", "node_port"]).then((result) => {
    document.getElementById("ip").value = result.node_ip;
    document.getElementById("port").value = result.node_port;
  });
}
document
  .getElementById("settings-tab")
  .addEventListener("click", clickedSettings);

/* Switch to pins tab */
function clickedPins() {
  let tab = document.getElementById("pin-tab");
  let other = document.getElementById("settings-tab");

  tab.classList.add("active");
  other.classList.remove("active");

  let settings = document.getElementById("settings");
  settings.style.display = "none";

  let pins = document.getElementById("pins");
  pins.style.display = "block";

  fetchData();

  // After fetching data, get the unique types and add them to the filter options
  getUniqueTypes();
}
document.getElementById("pin-tab").addEventListener("click", clickedPins);

function getUniqueTypes() {
  // Get the value of the input field with id="filterInput"
  const typeFilter = document.getElementById("type-filter");

  // Get the table
  const table = document.getElementById("pins");

  // Get the table body
  let tableBody = table.getElementsByTagName("tbody")[0];

  // Get all rows in the table body
  const rows = table.getElementsByTagName("tr");

  // create a set to store unique values
  const types = new Set();
  // Add an "All" option to the filter
  types.add("All");

  // loop through all table rows, and add the unique values to the set
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const cell = cells[2]; // assuming "Type" column is the third column
    if (cell) {
      const cellValue = cell.textContent || cell.innerText;
      types.add(cellValue.trim());
    }
  }

  // If the drop down already has options, remove them
  if (typeFilter.options.length > 0) {
    typeFilter.innerHTML = "";
  }

  // Add the unique values to the drop down
  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.text = type;
    typeFilter.add(option);
  });
}

// Filter the table based on the selected type in the drop down menu
function filterTable() {
  // Declare variables
  let input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("type-filter");
  filter = input.value.toUpperCase();
  table = document.getElementById("pins");
  rows = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the filter
  for (i = 1; i < rows.length; i++) {
    td = rows[i].getElementsByTagName("td")[2]; // assuming "Type" column is the third column
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (filter === "ALL" || txtValue.toUpperCase().indexOf(filter) > -1) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  }
}

// Add event listener to the filter table based on the selected type in the drop down menu
document.getElementById("type-filter").addEventListener("change", filterTable);

/* Save node configuration */
async function saveSettings() {
  let ip = document.getElementById("ip").value;
  let port = document.getElementById("port").value;

  chrome.storage.local
    .set({
      node_ip: ip,
      node_port: port,
    })
    .then(() => {
      alert("Saved configuration!");
    });
}
document
  .getElementById("save-settings")
  .addEventListener("click", saveSettings);

fetchData();
