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

### Sequence of the `handlePinClick` function

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on pinButton
    Document->>ContentScript: Triggers handlePinClick function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/pin/add
    IPFS-->>ContentScript: Returns response
    ContentScript->>IPFS: Sends POST request to /api/v0/files/cp
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

### Sequence of the `handleDownloadClick` function

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on downloadButton
    Document->>ContentScript: Triggers handleDownloadClick function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/get
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

### Sequence of the `getIPFSMetadata` function

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant ContentScript as contentScript.js
    participant BackgroundScript as background.js
    participant IPFS as IPFS Node
    User->>Document: Clicks on mapboxgl-canvas
    Document->>ContentScript: Triggers getIPFSMetadata function
    ContentScript->>BackgroundScript: Sends message to get IPFS node details
    BackgroundScript-->>ContentScript: Returns IPFS node details
    ContentScript->>IPFS: Sends POST request to /api/v0/dht/findprovs
    IPFS-->>ContentScript: Returns response
    ContentScript->>User: Updates UI
```

### Sequence of the `handleMultiPinClick` function

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

### Sequence of the "save-settings" click event

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant Script as script.js
    participant BackgroundScript as background.js
    User->>Document: Clicks on save-settings
    Document->>Script: Triggers click event
    Script->>BackgroundScript: Sends message to call saveSettings()
    BackgroundScript-->>Script: Returns success message
    Script-->>Document: Updates UI with success message
```

### Sequence of the "add-remove-button" click event

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant Script as script.js
    participant BackgroundScript as background.js
    User->>Document: Clicks on add-remove-button
    Document->>Script: Triggers click event
    Script->>BackgroundScript: Sends message to call addRemoveButtonToRow()
    BackgroundScript-->>Script: Returns success message
    Script-->>Document: Updates UI with success message
```

### Sequence of the "filter-type" change event

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant Script as script.js
    participant BackgroundScript as background.js
    User->>Document: Changes filter-type
    Document->>Script: Triggers change event
    Script->>BackgroundScript: Sends message to call saveSettings()
    BackgroundScript-->>Script: Returns success message
    Script-->>Document: Updates UI with success message
```

### Sequence of the "create-mfs-dir" click event

```mermaid
sequenceDiagram
    participant User
    participant Document as document
    participant Script as script.js
    participant BackgroundScript as background.js
    User->>Document: Clicks on create-mfs-dir
    Document->>Script: Triggers click event
    Script->>BackgroundScript: Sends message to call createMFSDir()
    BackgroundScript-->>Script: Returns success message
    Script-->>Document: Updates UI with success message
```

### Sequence of the "fetch-data" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant IPFS as IPFS Node
    participant DOM
    participant FetchMFSData as fetchMFSData()
    Script->>FetchMFSData: Calls function
    FetchMFSData->>IPFS: Sends request for MFS data
    IPFS->>FetchMFSData: Returns MFS data
    FetchMFSData->>DOM: Updates table with MFS data
```

### Sequence of the "fetchMFSData" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant IPFS as IPFS Node
    participant DOM
    participant FetchMFSData as fetchMFSData()
    Script->>FetchMFSData: Calls function
    FetchMFSData->>IPFS: Sends request for MFS data
    IPFS->>FetchMFSData: Returns MFS data
    FetchMFSData->>DOM: Updates table with MFS data
```

### Sequence of the "removePin" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant IPFS as IPFS Node
    participant RemovePin as removePin()
    Script->>RemovePin: Calls function
    RemovePin->>IPFS: Sends request to remove pin
    IPFS->>RemovePin: Returns success message
```

### Sequence of the "saveSettings" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant BackgroundScript as background.js
    participant SaveSettings as saveSettings()
    Script->>SaveSettings: Calls function
    SaveSettings->>BackgroundScript: Sends message to save settings
    BackgroundScript-->>SaveSettings: Returns success message
```

### Sequence of the "createMFSDir" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant IPFS as IPFS Node
    participant CreateMFSDir as createMFSDir()
    Script->>CreateMFSDir: Calls function
    CreateMFSDir->>IPFS: Sends request to create MFS directory
    IPFS->>CreateMFSDir: Returns success message
```

### Sequence of the "addRemoveButton" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant DOM
    participant AddRemoveButton as addRemoveButtonToRow()
    Script->>AddRemoveButton: Calls function for each row
    AddRemoveButton->>DOM: Adds remove button to row
```

### Sequence of the "getUniqueTypes" function

```mermaid
sequenceDiagram
    participant Script as script.js
    participant DOM
    participant GetUniqueTypes as getUniqueTypes()
    Script->>GetUniqueTypes: Calls function
    GetUniqueTypes->>DOM: Gets rows from table
    GetUniqueTypes->>DOM: Updates filter dropdown with unique types
```
