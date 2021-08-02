# AutoFarmer

AutoFarmer is a DeFi side project used for automation service to invest in autofarm.network protocol.

## Information
The main smart contract's name is AutoFarmerV1 located under /contracts folder

## Installation

Use the node package manager ([npm](https://www.npmjs.com/)) to install module.

```bash
npm install
```

### Get these API keys to be able to run the test script

1. [moralis](https://moralis.io/speedy-nodes/) for full archive nodes on BSC
2. [bscscan](https://bscscan.com/login) for verifying smart contract on BSC

### Create local.config.ts and add your API key as followed

```javascript
// visit https://bscscan.com/
export const BSCScanAPIKey = "{BSC_SCAN_API_KEY}";

// visit https://moralis.io/speedy-nodes/
export const SpeedyNodesKey = "{SPEEDY_NODES_KEY}";
```

## Usage
To compile smart contracts run the following command

```
npm run compile
```

To test smart contract run the following command
```
npm run test
```

## License
[MIT](https://choosealicense.com/licenses/mit/)