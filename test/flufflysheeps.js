const Fluffysheeps = artifacts.require("Fluffysheeps");
const utils = require("./helpers/utils");
const web3 = require("web3");
contract("Fluffysheeps", (accounts) => {
  let [alice, bob] = accounts;
  console.log("alice address:", alice);
  console.log("bob address:", bob);
  let contractInstance;
  beforeEach(async () => {
    contractInstance = await Fluffysheeps.new(
      process.env.TOKEN_BASE_URI,
      process.env.CONTRACT_URI
    );
  });
  context("test calculate discount function", () => {
    it("calculate discount total sheep = 10 should equal to 0.04 eth", async () => {
      const result = await contractInstance._calculateDiscountTest(10);
      assert.equal(result, web3.utils.toWei("0.04", "ether"));
    });
    it("calculate discount total sheep = 9 should equal to 0 eth", async () => {
      const result = await contractInstance._calculateDiscountTest(9);
      assert.equal(result, web3.utils.toWei("0", "ether"));
    });
    it("calculate discount total sheep = 2 should equal to 0.008 eth", async () => {
      const result = await contractInstance._calculatePreSaleDiscountTest(2);
      assert.equal(result, web3.utils.toWei("0.008", "ether"));
    });
  });
  context("test mint fluffy sheep", () => {
    it("should be unable to mint fluffy sheep cause sale_not_active", async () => {
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(1, {
          from: alice,
        })
      );
    });
    it("should be unable to mint fluffy sheep cause payment_value_not_enough not set value case", async () => {
      await contractInstance.setActiveSale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(1, {
          from: alice,
        })
      );
    });
    it("should be unable to mint fluffy sheep cause payment_value_not_enough set value less than price case", async () => {
      await contractInstance.setActiveSale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(1, {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        })
      );
    });
    it("should be able to mint fluffy sheep", async () => {
      await contractInstance.setActiveSale(true);
      const result = await contractInstance.mintFluffySheeps(1, {
        from: alice,
        value: web3.utils.toWei("0.04", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("should be unable to mint fluffy sheep cause invalid_total_sheeps totalSheeps = 0 case", async () => {
      await contractInstance.setActiveSale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(0, {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        })
      );
    });
    it("should be unable to mint fluffy sheep cause invalid_total_sheeps totalSheeps = 20 case", async () => {
      await contractInstance.setActiveSale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(20, {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        })
      );
    });
    it("should be unable to mint fluffy sheep cause payment_value_not_enough totalSheeps = 10 case value = 0.35(discount10%)", async () => {
      await contractInstance.setActiveSale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(10, {
          from: alice,
          value: web3.utils.toWei("0.35", "ether"),
        })
      );
    });
    it("should be able to mint fluffy sheep cause payment_value_not_enough totalSheeps = 10 case value = 0.36(discount10%)", async () => {
      await contractInstance.setActiveSale(true);
      const result = await contractInstance.mintFluffySheeps(10, {
        from: alice,
        value: web3.utils.toWei("0.36", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("should be unable to mint cause not_enough_sheeps totalSheeps = 11 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(11, {
          from: alice,
          value: web3.utils.toWei("4.4", "ether"),
        })
      );
    });
    it("should be able to mint cause not not_enough_sheeps totalSheeps = 10 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      const result = await contractInstance.mintFluffySheeps(10, {
        from: alice,
        value: web3.utils.toWei("4", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("should be unable to mint cause not not_enough_sheeps totalSheeps = 10 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      const result = await contractInstance.mintFluffySheeps(10, {
        from: alice,
        value: web3.utils.toWei("4", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
  });
});
