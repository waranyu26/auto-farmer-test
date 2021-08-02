import { ethers, network } from "hardhat";
import {
  CONFIRMATION,
  CONTRACTS,
  Contracts,
  GAS_PRICE as gasPrice,
} from "./contracts";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { isLocalNetwork, deployExternalContracts, verify } from "./utils";

const { provider } = ethers;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("DEPLOYMENT START...");

  let contracts: Contracts;
  let isLocal = isLocalNetwork();
  if (!isLocal) {
    contracts = CONTRACTS[network.name];
  } else {
    contracts =
      network.name === "mainnet_fork"
        ? CONTRACTS["mainnet"]
        : await deployExternalContracts(owner);
  }

  const farmer = await deployAutoFarmer(owner);
  if (!isLocal)
    await verify(farmer.address);
    
}

async function deployAutoFarmer(owner: SignerWithAddress): Promise<Contract> {
  let tx;
  const AutoFarmerV1 = await ethers.getContractFactory("AutoFarmerV1");
  const farmer = await AutoFarmerV1.connect(owner).deploy({ gasPrice });

  ({ deployTransaction: tx } = farmer);
  console.log(`farmer.deploy ${farmer.address} ${tx.hash}`);
  await provider.waitForTransaction(tx.hash, CONFIRMATION);

  return farmer;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
