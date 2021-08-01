import { ethers, network, run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { constants, Contract, ContractFactory } from "ethers";
import { Contracts } from "./contracts";

export function isLocalNetwork(): boolean {
  return ["local", "hardhat", "localhost", "mainnet_fork"].includes(
    network.name
  );
}

export async function verify(
  addr: string,
  args: string[] = [],
  contract?: string
): Promise<void> {
  let taskArgs: any = {
    address: addr,
    constructorArguments: args,
  };
  if (contract) {
    taskArgs.contract = contract;
  }
  await run("verify:verify", taskArgs);
}

export async function deployExternalContracts(
  deployer: SignerWithAddress
): Promise<Contracts> {
  // TODO : Generate mock contract for local network
  // Example
  return {
    AUTOv2: "0xa184088a740c695E156F91f5cC086a06bb78b827",
    AUTO: "0x4508ABB72232271e452258530D4Ed799C685eccb"
  }
}
