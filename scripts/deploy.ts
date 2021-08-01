// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
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
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);
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

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
