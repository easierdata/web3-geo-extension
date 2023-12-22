let popup = false;

/* Send call to service worker */
async function handleButtonClick() {
    const result = await chrome.runtime.sendMessage({ type: "get" });
    const label = document.getElementsByClassName("ipfs-cid-text")[0]
    const cid = label.innerText.split(" ")[2]
    
    const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/pin/add?arg=${cid}&recursive=true`, {
        method: 'POST',
    });

    if (response.status === 200) {
        alert("Successfully pinned!")
    } else {
        alert("Failed to pin")
    }
}

async function handleDownloadClick() {
    const result = await chrome.runtime.sendMessage({ type: "get" });
    const label = document.getElementsByClassName("ipfs-cid-text")[0]
    const cid = label.innerText.split(" ")[2]
    
    const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/get?arg=${cid}`, {
        method: 'POST',
    });

    if (response.status === 200) {
        alert("Successfully downloaded!")
    } else {
        alert("Failed to download")
    }
}

/*
    Get ipfs metadata if popup is displayed
*/
async function getIPFSMetadata() {
    await delay(500)
    if (!popup) {
        popup = true;
        const label = document.getElementsByClassName("ipfs-cid-text")[0]
        const cid = label.innerText.split(" ")[2]
        console.log(cid)

        if (cid) {
            const result = await chrome.runtime.sendMessage({ type: "get" });
            
            const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/dht/findprovs?arg=${cid}`, {
                method: 'POST',
            });
    
            const res = await response.text();
            const peers = res.split('"Type":4').length - 1

            if (response.status === 200) {
                const pins = document.getElementsByClassName("pins")[0]
                pins.innerText = `Pinned on ${peers} IPFS nodes`
            }
        }
    } else {
        const label = document.getElementsByClassName("ipfs-cid-text")[0]
        if (!label) popup = false;
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

/* Handle clicks */
document.addEventListener('click', function (event) {
    /* Add event listener to pinButton ID */
    if (event.target.matches('#pinButton')) {
        handleButtonClick();
    }
    else if (event.target.matches('#downloadButton')) {
        handleDownloadClick();
    } else {
        getIPFSMetadata();
    }
});

