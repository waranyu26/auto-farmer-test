import chai, { expect, util } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Contract, utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { deployFarmer } from "./deploy-farmer";

chai.use(solidity);

// ! THIS TEST ONLY RUN ON BSC MAINNET FORK

describe("Farmer", () => {
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];

  let farmer: Contract;
  let autov2: Contract;

  beforeEach("Deploy contracts", async () => {
    ({
      role: { owner, users },
      token: { autov2 },
      core: { farmer},
    } = await deployFarmer());
    await autov2.connect(owner).transfer(users[0].address, utils.parseEther("10"))
    await autov2.connect(owner).transfer(users[1].address, utils.parseEther("10"))
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await farmer.owner()).to.equal(owner.address);
    });
    it("Should be able to add pool", async () => {
      const _allocPoint = 0;
      const _farmingToken = "0xa184088a740c695E156F91f5cC086a06bb78b827";
      const _withUpdate = false; // boolean
      const _stratAddress = "0xB27150dc6EE59ad4464cC7A89229b5870e568Be2";

      expect(
        await farmer.connect(owner).functions["add(uint256,address,bool,address)"](_allocPoint, _farmingToken, _withUpdate, _stratAddress)
      ).to.emit(farmer, "Add").withArgs(_allocPoint, _farmingToken, _withUpdate, _stratAddress)
    });
    it("Should already have 1 pool added", async () => {
      expect(await farmer.poolLength()).to.equal(1);
    });
  });
  describe("Transactions", () => {
    beforeEach("Approve AUTOv2 spend on farmer contract", async () => {
      for await (const user of [owner, users[0], users[1]]) {
        await autov2.connect(user).increaseAllowance(farmer.address, utils.parseEther("100"));
      }
    });
    describe("Deposit", () => {
      it("Should be able to deposit money", async () => {
        const _pid = 0;
        const _wantAmt = utils.parseEther("5");
  
        expect(
          await farmer.connect(users[0]).functions["deposit(uint256,uint256)"](_pid, _wantAmt)
        ).to.emit(farmer, "Deposit")
      });
      it("User's share should be increased", async () => {
        expect(
          (await farmer.userInfo(0, users[0].address)).shares
        ).to.eq(0);

        const _pid = 0;
        const _wantAmt = utils.parseEther("5");
        await farmer.connect(users[0]).functions["deposit(uint256,uint256)"](_pid, _wantAmt)

        expect(
          (await farmer.userInfo(0, users[0].address)).shares
        ).to.not.eq(0);
      });
    });
    describe("Withdraw", () => {
      it("Should not withdraw with balance of 0 (transaction revert)", async () => {
        const _pid = 0;
        const _wantAmt = utils.parseEther("5");
  
        await expect(
          farmer.connect(users[0]).functions["withdraw(uint256,uint256)"](_pid, _wantAmt)
        ).to.be.revertedWith("user shares is not enough");
      });
      it("Should be able to withdraw money", async () => {
        let _pid = 0;
        let _wantAmt = utils.parseEther("5");
        await farmer.connect(users[0]).functions["deposit(uint256,uint256)"](_pid, _wantAmt)
  
        _wantAmt = utils.parseEther("3");
        expect(
          await farmer.connect(users[0]).functions["withdraw(uint256,uint256)"](_pid, _wantAmt)
        ).to.emit(farmer, "Withdraw")
      });
      it("Should be able to withdraw more than your amount (but got only your current amount)", async () => {
        let _pid = 0;
        let _wantAmt = utils.parseEther("5");
        await farmer.connect(users[0]).functions["deposit(uint256,uint256)"](_pid, _wantAmt)
  
        _wantAmt = utils.parseEther("10");
        expect(
          await farmer.connect(users[0]).functions["withdraw(uint256,uint256)"](_pid, _wantAmt)
        ).to.emit(farmer, "Withdraw")
      });
    })
  })
  

});
