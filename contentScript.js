/* Send call to service worker */
async function handleButtonClick() {
    const cid = document.getElementsByClassName("cid-text")[0].innerText.split(" ")[1]
    //const cid = "QmTp2hEo8eXRp6wg7jXv1BLCMh5a4F3B7buAUZNZUu772j"
    const result = await chrome.runtime.sendMessage({ cid });

    console.log(result)
    
    if (result == true) {
        alert("Successfully pinned!")
    } else {
        alert("Failed to pin...")
    }
}

/* Add event listener to pinButton ID */
document.addEventListener('click', function (event) {
    if (event.target.matches('#pinButton')) {
        handleButtonClick();
    }
});