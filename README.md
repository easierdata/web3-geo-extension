# EASIER Chrome Extension

This project complements the [Web3-Geo-Dashboard](https://github.com/easierdata/web3-geo-dashboard) and is used to enable pinning and other features.

### Setup

In your IPFS Daemon WebUI configure the IPFS Config to allow API requests by adding your project domain to the `API.HTTPHeaders.Access-Control-Allow-Origin` array in addition to the chrome extension (chrome-extension://<id-goes-here>). Alternatively, you can use an asterisk (`*`) to allow everything (I do not recommend this).

![1695046837924](image/README/1695046837924.png)

In `manifest.json` add permissions to access your project domain.

In your chrome extension settings, select `Load Unpacked` and navigate to this folder.
