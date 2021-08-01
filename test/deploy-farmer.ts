import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { constants, Contract } from "ethers";
import { ethers } from "hardhat";

export async function deployFarmer(): Promise<void> {
  const [owner, user] = await ethers.getSigners();
}