let popup = false;

/* Send call to service worker */
async function handlePinClick() {
    const result = await chrome.runtime.sendMessage({ type: "get" });
    const cidLabel = document.getElementsByClassName("ipfs-cid-text")[0];
    const cid = cidLabel.innerText.split(" ")[2];

    const nameLabel = document.getElementsByClassName("name-text")[0];
    const fileName = nameLabel.innerText.split(" ")[1];

    const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/pin/add?arg=${cid}&recursive=true`, {
        method: 'POST',
    });

    let mfs_response;
    if (JSON.parse(result).node_dir != undefined && JSON.parse(result).node_dir.length > 1) {
        mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=${JSON.parse(result).node_dir}/${fileName}`, {
            method: 'POST',
        });
    } else {
        mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${fileName}`, {
            method: 'POST',
        });
    }
    
    if (response.status === 200 && mfs_response.status === 200) {
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
    let cid = undefined;

    // Wait for a CID to be present
    while (cid === undefined) {
        const label = document.getElementsByClassName("ipfs-cid-text")[0]
        if (label) {
            cid = label.innerText.split(" ")[2]
            console.log(cid)
            break;
        }
        await delay(500)
    }

    // Fetch details with node
    if (cid) {
        const pins = document.getElementsByClassName("pins")[0]
        pins.innerText = `Fetching ipfs node data...`
        
        const result = await chrome.runtime.sendMessage({ type: "get" });
        
        const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/routing/findprovs?arg=${cid}`, {
            method: 'POST',
        });

        const res = await response.text();
        const peers = res.split('"Type":4').length - 1

        if (response.status === 200) {
            const pins = document.getElementsByClassName("pins")[0]
            pins.innerText = `Pinned on ${peers} IPFS nodes`
            return;
        } else {
            alert("Failed to get IPFS metadata!")
        }
    }
}

async function handleMultiPinClick() {
    const result = await chrome.runtime.sendMessage({ type: "get" });
    const label = document.getElementById("cidArray");
    const cids = label.innerText;

    for (let x = 0; x < JSON.parse(cids).length; x++) {
        let cid = JSON.parse(cids)[x];
        const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/pin/add?arg=${cid}&recursive=true`, {
            method: 'POST',
        });

        let mfs_response;
        if (JSON.parse(result).node_dir != undefined && JSON.parse(result).node_dir.length > 1) {
            mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=${JSON.parse(result).node_dir}/${fileName}`, {
                method: 'POST',
            });
        } else {
            mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${fileName}`, {
                method: 'POST',
            });
        }
        
        if (response.status !== 200 && mfs_response.status !== 200) {
            alert("Failed to pin, continuing")
        } 
    }

    alert("Successfully pinned!")
}

async function handleMultiPinClick() {
    const result = await chrome.runtime.sendMessage({ type: "get" });
    const label = document.getElementById("cidArray");
    const cids = label.innerText;

    for (let x = 0; x < JSON.parse(cids).length; x++) {
        let cid = JSON.parse(cids)[x];
        const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/pin/add?arg=${cid}&recursive=true`, {
            method: 'POST',
        });

        let mfs_response;
        if (JSON.parse(result).node_dir != undefined && JSON.parse(result).node_dir.length > 1) {
            mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=${JSON.parse(result).node_dir}/${fileName}`, {
                method: 'POST',
            });
        } else {
            mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${fileName}`, {
                method: 'POST',
            });
        }
        
        if (response.status !== 200 && mfs_response.status !== 200) {
            alert("Failed to pin, continuing")
        } 
    }

    alert("Successfully pinned!")
}

async function handleExportClick() {
    const result = await chrome.runtime.sendMessage({ type: "get" });
    const label = document.getElementById("exportFeatures");
    let features = JSON.parse(label.innerText);

    const geojson = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:EPSG::4269"
            }
        },
        features: features
    }

    console.log(geojson)

    // Create form data and blob to post
    const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
    const formData = new FormData();
    const filename = `export_${Math.floor(Math.random() * 100)}.geojson`
    formData.append('file', blob, filename);

    try {
        const response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/add?to-files=${filename}`, {
            method: "POST",
            body: formData,
            redirect: "follow"
        });
    
        const response_text = await response.text();

        const cid = JSON.parse(response_text).Hash;

        if (JSON.parse(result).node_dir != undefined && JSON.parse(result).node_dir.length > 1) {
            mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=${JSON.parse(result).node_dir}/${filename}`, {
                method: 'POST',
            });
        } else {
            mfs_response = await fetch(`http://${JSON.parse(result).node_ip}:${JSON.parse(result).node_port}/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${filename}`, {
                method: 'POST',
            });
        }

        alert("Successfully exported!");
    } catch (error) {
        console.error(error);
        alert("Failed to export!")
    }
}


const delay = ms => new Promise(res => setTimeout(res, ms));

/* Handle clicks */
document.addEventListener('click', function (event) {
    /* Add event listener to pinButton ID */
    console.log(event.target);
    if (event.target.matches('#pinButton')) {
        handlePinClick();
    }
    else if (event.target.matches('#downloadButton')) {
        handleDownloadClick();
    } else if (event.target.matches('.mapboxgl-canvas')){
        getIPFSMetadata();
    } else if (event.target.matches('#multiPin')){
        handleMultiPinClick();
    } else if (event.target.matches('#export')){
        handleExportClick();
    }
});

