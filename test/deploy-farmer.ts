import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";

export type Role = {
  owner: SignerWithAddress;
  users: SignerWithAddress[];
};

export type Token = {
  autov2: Contract;
};

export type Core = {
  farmer: Contract;
};

export async function deployFarmer(): Promise<{role: Role, token: Token, core: Core}> {

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xF977814e90dA44bFA03b6295A0616a897441aceC"],
  });

  const owner = await ethers.getSigner("0xF977814e90dA44bFA03b6295A0616a897441aceC")
  const users = await ethers.getSigners();

  const autov2 = await ethers.getContractAt("AUTOv2", "0xa184088a740c695E156F91f5cC086a06bb78b827")

  // Deploy farmer
  const AutoFarmerV1 = await ethers.getContractFactory("AutoFarmerV1");
  const farmer = await AutoFarmerV1.connect(owner).deploy();

  // Add pool
  const _allocPoint = 0;
  const _farmingToken = "0xa184088a740c695E156F91f5cC086a06bb78b827";
  const _withUpdate = 0; // boolean
  const _stratAddress = "0xB27150dc6EE59ad4464cC7A89229b5870e568Be2";

  await farmer.connect(owner).add(_allocPoint, _farmingToken, _withUpdate, _stratAddress)

  return {
    role: { owner, users },
    token: { autov2 },
    core: { farmer }
  }

}