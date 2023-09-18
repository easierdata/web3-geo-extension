/* Fetch list of CIDs being pinned */
async function fetchData() {
    chrome.storage.local.get(["node_ip", "node_port"]).then(async (keys) => {
        const response = await fetch(`http://${keys.node_ip}:${keys.node_port}/api/v0/pin/ls`, {
            method: 'POST',
            headers: {
                accept: '*/*',
            }
        });

        const result = await response.json();

        /* Append data to table in Pins tab */
        if (Object.keys(result.Keys).length > 0) {
            const tableBody = document.querySelector('#pins tbody');
            tableBody.innerHTML = '';

            for (let x = 0; x < Object.keys(result.Keys).length; x++) {
                const row = document.createElement('tr');
                
                const indexCell = document.createElement('td');
                indexCell.textContent = x + 1;

                const cidCell = document.createElement('td');
                cidCell.textContent = Object.keys(result.Keys)[x].slice(0, 24) + '...';

                const typeCell = document.createElement('td');
                typeCell.textContent = result.Keys[Object.keys(result.Keys)[x]].Type;
            
                row.appendChild(indexCell);
                row.appendChild(cidCell);
                row.appendChild(typeCell);

                tableBody.appendChild(row);
            }
        }
    })
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
document.getElementById("settings-tab").addEventListener("click", clickedSettings);

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

    fetchData()
}
document.getElementById("pin-tab").addEventListener("click", clickedPins);

/* Save node configuration */
async function saveSettings() {
    let ip = document.getElementById("ip").value;
    let port = document.getElementById("port").value;

    chrome.storage.local.set({ 
        node_ip: ip,
        node_port: port
    }).then(() => {
        alert("Saved configuration!");
    });
}
document.getElementById("save-settings").addEventListener("click", saveSettings);

fetchData();