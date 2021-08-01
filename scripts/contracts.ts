import { utils } from "ethers";
import { network } from "hardhat";
import { isLocalNetwork } from "./utils";

export const GAS_PRICE = utils.parseUnits("5", "gwei");

let confirmation = 0;
if (!isLocalNetwork()) {
  confirmation = 2;
}

export const CONFIRMATION = confirmation;

export type Contracts = { [name: string]: string };
export const CONTRACTS = {
  bsc_mainnet: {
    // pancakeswap
    UniRouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UniFactory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",

    // AUTO Protocol
    AutoFarmV2_CrossChain: "0x763a05bdb9f8946d8C3FA72d1e0d3f5E68647e5C",
    StratX2_AUTO: "0xB27150dc6EE59ad4464cC7A89229b5870e568Be2",
    AutoFarmV2: "0x0895196562C7868C5Be92459FaE7f877ED450452",
    AUTO: "0x4508ABB72232271e452258530D4Ed799C685eccb",
    AUTOv2: "0xa184088a740c695e156f91f5cc086a06bb78b827",
    AutoSwap: "0x92A695ab9Da3987664845E1A923FFf39b5Cf23eA",

    // stable coin
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    USDT: "0x55d398326f99059ff775485246999027b3197955",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    UST: "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
  },
  bsc_testnet: {
    // pancakeswap
    UniRouter: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    UniFactory: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",

    // stable coin
    DAI: "0x0c085b4b68261da18d860f647a33216503b3b26c",
    USDT: "0x4dbf253521e8e8080282c964975f3afb7f87cece",
    USDC: "0x9780881bf45b83ee028c4c1de7e0c168df8e9eef",
    BUSD: "0x91f44af93f784ae7ce939913f45636ce3d864207",
    UST: "0x66bdf3bd407a63eab5eaf5ece69f2d7bb403efc9",
  },
} as { [network: string]: Contracts };
