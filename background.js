/* Receive message and pin */
let config = {}

chrome.storage.local.get(["node_ip", "node_port", "node_dir"]).then((keys) => {
    config = keys
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    sendResponse(JSON.stringify(config))
});
