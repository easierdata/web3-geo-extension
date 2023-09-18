/* Receive message and pin */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    try {
        chrome.storage.local.get(["node_ip", "node_port"]).then(async (keys) => {
            const response = await fetch(`http://${keys.node_ip}:${keys.node_port}/api/v0/pin/add?arg=${message.cid}&recursive=true&progress=true`, {
                method: 'POST',
            });
    
            const result = await response.json();

            if (result.status === 200) {
                sendResponse(true)
            } else {
                sendResponse(false)
            }
        })

        sendResponse(true)
    } catch {
        sendResponse(false)
    }
});
