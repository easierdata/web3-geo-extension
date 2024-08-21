## Execution order of Chrome Extension scripts

In a typical Chrome extension, the execution order of scripts is as follows:

* **background.js**: This script is loaded when the extension is installed or the browser is started. It runs in the background and listens for events, such as clicks on the extension's icon, inter-page communication, or external requests. It can interact with web pages by exchanging messages with content scripts.
* **contentScript.js**: This script is injected into the web pages that match the patterns specified in the matches field of the content_scripts section in the manifest.json file of the extension. It runs in the context of the web pages and can read or modify the DOM of the web pages. However, it cannot use most Chrome APIs directly. It needs to communicate with the background script to perform tasks that require Chrome APIs.
* **script.js**: This script is typically a part of the extension's popup or options page. It runs when the popup or options page is opened. It can use Chrome APIs and communicate with the background script.

Below is a sequence diagram that illustrates the communication between these scripts:

```mermaid
sequenceDiagram
    participant B as background.js
    participant C as contentScript.js
    participant S as script.js
    B->>C: Injects contentScript.js into web page
    C-->>B: Sends message to background.js
    B->>C: Responds to message
    S-->>B: Sends message to background.js
    B->>S: Responds to message
```

> Please note that the actual execution order and interaction between these scripts can vary depending on the specific implementation of the extension. The above sequence diagram provides a general overview of the communication flow between the background script, content script, and the script running in the extension's popup or options page.

In a Chrome extension, `script.js` (which is typically part of the extension's popup or options page) cannot directly call functions in `contentScript.js` (which is injected into web pages). They operate in different contexts: `script.js` runs in the extension context, while `contentScript.js` runs in the context of the web page.

However, they can communicate with each other using Chrome's message passing APIs. Here's a basic example:

In `contentScript.js`, you can listen for messages from `script.js`:

```javascript
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "callFunction") {
      myFunction();
      sendResponse({result: "Function called"});
    }
  }
);
```

In `script.js`, you can send a message to `contentScript.js`:

```javascript
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "callFunction"}, function(response) {
    console.log(response.result);
  });
});
```

In this example, when `script.js` sends a message with `{message: "callFunction"}`, `contentScript.js` receives this message, calls `myFunction()`, and sends a response back to `script.js`.

## Order of execution of functions in script.js on first load

```mermaid
sequenceDiagram
    participant User
    participant LocalStorage as localStorage
    participant Script as script.js
    participant FetchMFSData as fetchMFSData()
    participant IPFS as IPFS Node
    participant DOM
    participant AddRemoveButton as addRemoveButtonToRow()
    participant GetUniqueTypes as getUniqueTypes()
    User->>Script: Opens webpage
    Script-->>LocalStorage: Sets "filterType" to "All"
    Script->>FetchMFSData: Calls function
    FetchMFSData->>IPFS: Sends request for MFS data
    IPFS->>FetchMFSData: Returns MFS data
    FetchMFSData->>DOM: Updates table with MFS data
    FetchMFSData->>AddRemoveButton: Calls function for each row
    AddRemoveButton->>DOM: Adds remove button to row
    Script->>GetUniqueTypes: Calls function
    GetUniqueTypes->>DOM: Gets rows from table
    GetUniqueTypes->>DOM: Updates filter dropdown with unique types
```

## Flowchart for REQUESTS

### Flowchart of REQUESTS made in each function of script.js

```mermaid
graph LR
    A[Start] --> B[fetchData]
    B -->|GET node_ip, node_port| C["Fetch http://{node_ip}:{node_port}/api/v0/pin/ls"]
    C --> D[Process response]
    D --> E[End fetchData]
    A --> F[fetchMFSData]
    F -->|GET node_ip, node_port| G["Fetch http://{node_ip}:{node_port}/api/v0/files/ls?arg={dir}&long=true&U=true"]
    G --> H[Process response]
    H --> I[End fetchMFSData]
    A --> J[removePin]
    J -->|GET node_ip, node_port| K["Fetch http://{node_ip}:{node_port}/api/v0/pin/rm?arg={cid}"]
    K --> L[Process response]
    L --> M[End removePin]
    A --> N[saveSettings]
    N --> O[createMFSDir]
    O -->|GET node_ip, node_port| P["Fetch http://{node_ip}:{node_port}/api/v0/files/mkdir?arg={directory}&cid-version=1&parents=true"]
    P --> Q[Process response]
    Q --> R[End createMFSDir]
    N --> S[End saveSettings]
    A --> T[End]
```

### Flowchart of REQUESTS made in each function of contentScript.js

```mermaid
graph LR
    A[Start] --> B[handlePinClick]
    B -->|POST| C[Fetch /api/v0/pin/add]
    C --> D[Process response]
    D -->|POST| E[Fetch /api/v0/files/cp]
    E --> F[Process response]
    F --> G[End handlePinClick]
    A --> H[handleDownloadClick]
    H -->|POST| I[Fetch /api/v0/get]
    I --> J[Process response]
    J --> K[End handleDownloadClick]
    A --> L[getIPFSMetadata]
    L -->|POST| M[Fetch /api/v0/dht/findprovs]
    M --> N[Process response]
    N --> O[End getIPFSMetadata]
    A --> P[handleMultiPinClick]
    P -->|POST| Q[Fetch /api/v0/pin/add]
    Q --> R[Process response]
    R -->|POST| S[Fetch /api/v0/files/cp]
    S --> T[Process response]
    T --> U[End handleMultiPinClick]
    A --> V[End]
```

## Sequence Diagrams for functions in contentScript.js

### Sequence of the `handlePinClick` function that sends call to service worker to pin feature

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on pinButton from pop-up
    Document->>ContentScript: Triggers handlePinClick function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/pin/add
    IPFS-->>ContentScript: Returns response
    ContentScript->>IPFS: Sends POST request to /api/v0/files/cp
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

### Sequence of the `handleDownloadClick` function that sends call to service worker to download feature

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on downloadButton from pop-up
    Document->>ContentScript: Triggers handleDownloadClick function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/get
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

### Sequence of the `getIPFSMetadata` function that gets ipfs metadata if popup is displayed

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on feature in map
    Document->>ContentScript: Triggers getIPFSMetadata function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/dht/findprovs
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

### Sequence of the `handleMultiPinClick` function when multiple features are selected

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on multiPin
    Document->>ContentScript: Triggers handleMultiPinClick function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/pin/add
    IPFS-->>ContentScript: Returns response
    ContentScript->>IPFS: Sends POST request to /api/v0/files/cp
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

## Sequence Diagrams for functions in script.js

### Sequence of how the settings form is saved

```mermaid
sequenceDiagram
    participant User
    participant Extension as Extension UI
    participant Script as script.js
    participant API as IPFS API
    User->>Extension: Opens extension
    User->>Extension: Clicks on settings tab
    Extension->>Script: Triggers clickedSettings function
    Script-->>User: Displays settings form
    User->>Extension: Enters IP, port, and directory in form
    User->>Extension: Clicks on save button
    Extension->>Script: Triggers saveSettings function
    Script->>Script: Validates directory input
    Script->>Script: Calls createMFSDir function (if directory is valid)
    Script->>API: Sends POST request to create MFS directory
    API-->>Script: Returns response
    Script->>Script: Checks response status
    Script-->>User: Alerts user if creation failed
    Script->>Script: Saves settings to local storage
    Script-->>User: Updates UI with success message
```

### Sequence of how the table is populated when a user clicks on the Pin tab or opens the extension

```mermaid
sequenceDiagram
    participant User
    participant Extension as Extension UI
    participant Script as script.js
    User->>Extension: Clicks on pinned tab
    Extension->>Script: Triggers clickedPins function
    Script->>Script: Gets pin-tab and settings-tab elements
    Script->>Script: Adds "active" class to pin-tab and removes it from settings-tab
    Script->>Script: Calls fetchMFSData function
    Script->>Script: Calls getUniqueTypes function
    Script-->>Extension: Updates pinned tab with table of pinned data
```

### Sequence of how a filter is applied to the table by the user

```mermaid
sequenceDiagram
    participant User
    participant Extension as Extension UI
    participant Script as script.js
    User->>Extension: Opens extension
    Extension->>Script: Triggers getUniqueTypes function
    Script->>Script: Gets type-filter element
    Script->>Script: Creates set of unique types
    Script->>Script: Clears existing options in type-filter
    Script->>Script: Adds unique types to type-filter element
    Script-->>Extension: Updates type column with filtered data
    User->>Extension: Table is updated with filter options
    Extension->>Script: Triggers filterTable function
    Script->>Script: Gets selected type and converts it to uppercase
    Script->>Script: Gets table and rows
    Script->>Script: Loops through rows
    Script->>Script: Gets type value of each row
    Script->>Script: Compares type value with selected type
    Script->>Script: Sets display style to "none" for rows that don't match
    Script-->>Extension: Updates table with filtered data
```

### Sequence of how the remove pin button is added to the table

```mermaid
sequenceDiagram
    participant Extension as Extension UI
    participant Script as script.js
    participant Dom as DOM
    note left of Extension: User opens extension
    Extension->>Script: Triggers click event
    note left of Script: Call to fetchMFSData() to acquire pinned data from IPFS
    Script->>Dom: Sends message to call addRemoveButtonToRow()
    Note over Dom,Script: Loop through each CID
    Dom-->>Script: creates remove button element for row
    Script-->>Extension: Updates table div with remove button
```

### Sequence of how a pin is removed from the table by the user

```mermaid
sequenceDiagram
    participant User
    participant Extension as Extension UI
    participant Script as script.js
    participant API as IPFS API
    User->>Extension: Clicks on remove pin button
    Extension->>Script: Triggers removePin function with CID and row index
    Script->>Script: Gets node IP and port from local storage
    Script->>API: Sends POST request to remove pin
    API-->>Script: Returns response
    Script->>Script: Checks response status
    Script->>Script: If status is 200, deletes row from table
    Script-->>User: Alerts user if removal failed
```
