const Fluffysheeps = artifacts.require("Fluffysheeps");
const utils = require("./helpers/utils");
const web3 = require("web3");
contract("Fluffysheeps", (accounts) => {
  let [alice, bob, alex] = accounts;
  console.log("alice address:", alice);
  console.log("bob address:", bob);
  console.log("alex address:", alex);
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
    it("should be able to mint cause not not_enough_sheeps totalSheeps = 20 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(20);
      const result = await contractInstance.mintFluffySheeps(20, {
        from: alice,
        value: web3.utils.toWei("0.8", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("should be unable to mint cause not not_enough_sheeps  = 20 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(20);
      await contractInstance.mintFluffySheeps(20, {
        from: alice,
        value: web3.utils.toWei("0.8", "ether"),
      });
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(1, {
          from: alice,
          value: web3.utils.toWei("0.04", "ether"),
        })
      );
    });
    it("should be able to mint 1x10 fluffy sheeps totalSheeps = 10 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      for (var i = 0; i < 10; i++) {
        const result = await contractInstance.mintFluffySheeps(1, {
          from: alice,
          value: web3.utils.toWei("0.4", "ether"),
        });
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.to, alice);
      }
    });
    it("should be unable to mint 1x11 fluffy sheeps totalSheeps = 10 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      for (var i = 0; i < 10; i++) {
        const result = await contractInstance.mintFluffySheeps(1, {
          from: alice,
          value: web3.utils.toWei("0.4", "ether"),
        });
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.to, alice);
      }
      await utils.shouldThrow(
        contractInstance.mintFluffySheeps(1, {
          from: alice,
          value: web3.utils.toWei("0.04", "ether"),
        })
      );
    });
    it("should be alice is owner of all sheeps totalSheeps = 10 case", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      for (var i = 0; i < 10; i++) {
        const result = await contractInstance.mintFluffySheeps(1, {
          from: alice,
          value: web3.utils.toWei("0.04", "ether"),
        });
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.to, alice);
        const owner = await contractInstance.ownerOf(
          result.logs[0].args.tokenId
        );
        assert.equal(owner, alice);
      }
    });
  });
  context("test mint fluffy sheep pre sale", () => {
    it("should be unable to mint fluffy sheep pre sale cause pre_sale_not_active", async () => {
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(1, {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        })
      );
    });
    it("should be unable to mint fluffy sheep pre sale cause payment_value_not_enough not set value case", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(1, {
          from: alice,
        })
      );
    });
    it("should be unable to mint fluffy sheep pre sale cause payment_value_not_enough set value less than price case", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(1, {
          from: alice,
          value: web3.utils.toWei("0.029", "ether"),
        })
      );
    });
    it("should be unable to mint fluffy sheep pre sale cause invalid_total_sheeps totalSheeps = 0 case", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(0, {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        })
      );
    });
    it("should be unable to mint fluffy sheep pre sale cause invalid_total_sheeps totalSheeps = 11 case", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(11, {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        })
      );
    });
    it("should be unable to mint fluffy sheep pre sale cause payment_value_not_enough totalSheeps = 10 case value = 0.29", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(10, {
          from: alice,
          value: web3.utils.toWei("0.29", "ether"),
        })
      );
    });
    it("should be unable to mint cause not_enough_sheeps totalSheeps = 9 case", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(9);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(10, {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        })
      );
    });
    it("should be unable to mint cause invalid_presale_key not set presaleKey case", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(10, {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        })
      );
    });
    it("should be unable to mint cause invalid_presale_key set invalid presaleKey case", async () => {
      await contractInstance.setActivePresale(true);
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(10, "invalid-pre-sale-key", {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        })
      );
    });
    it("should be able to mint cause not invalid_presale_key presaleKey = '14c1807a-ed1d-4192-b195-fedd9ea28be3' case", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
      ]);

      const result = await contractInstance.mintFluffySheepsPresale(
        1,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        }
      );
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("should be able to mint cause not not_enough_sheeps totalSheeps = 10 case", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
      ]);

      const result = await contractInstance.mintFluffySheepsPresale(
        10,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        }
      );
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("should be unable to mint cause not not_enough_sheeps  = 10 case", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance._setMaxTotalFluffySheepsTest(10);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        "f401376f-3c7c-4a39-8f82-095bd890ca8b",
      ]);
      await contractInstance.mintFluffySheepsPresale(
        10,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        }
      );
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(
          1,
          "f401376f-3c7c-4a39-8f82-095bd890ca8b",
          {
            from: bob,
            value: web3.utils.toWei("0.03", "ether"),
          }
        )
      );
    });
    it("should be unable to mint use same pre sale key case", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
      ]);
      await contractInstance.mintFluffySheepsPresale(
        10,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.3", "ether"),
        }
      );
      await utils.shouldThrow(
        contractInstance.mintFluffySheepsPresale(
          1,
          "14c1807a-ed1d-4192-b195-fedd9ea28be3",
          {
            from: alice,
            value: web3.utils.toWei("0.03", "ether"),
          }
        )
      );
    });
    it("should be able to mint bob mint after alice", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        "f401376f-3c7c-4a39-8f82-095bd890ca8b",
      ]);
      const aliceResult = await contractInstance.mintFluffySheepsPresale(
        1,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.03", "ether"),
        }
      );
      assert.equal(aliceResult.receipt.status, true);
      assert.equal(aliceResult.logs[0].args.to, alice);
      const bobResult = await contractInstance.mintFluffySheepsPresale(
        1,
        "f401376f-3c7c-4a39-8f82-095bd890ca8b",
        {
          from: bob,
          value: web3.utils.toWei("0.03", "ether"),
        }
      );
      assert.equal(bobResult.receipt.status, true);
      assert.equal(bobResult.logs[0].args.to, bob);
    });
  });
  context("test utils method", () => {
    it("should be able with draw all to owner account(alice)", async () => {
      await contractInstance.setActiveSale(true);

      let result = await contractInstance.mintFluffySheeps(20, {
        from: bob,
        value: web3.utils.toWei("0.8", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, bob);

      var localWeb3 = new web3("http://127.0.0.1:7545");
      const aliceOldBalance = await localWeb3.eth.getBalance(alice);
      result = await contractInstance.withdrawAll();
      assert.equal(result.receipt.status, true);

      const aliceNewBalance = await localWeb3.eth.getBalance(alice);
      assert.equal(+aliceNewBalance > +aliceOldBalance, true);
    });
    it("test setFluffysheepPrice", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance.setFluffysheepPrice(
        web3.utils.toWei("0.2", "ether")
      );
      let result = await contractInstance.mintFluffySheeps(1, {
        from: alice,
        value: web3.utils.toWei("0.2", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("test setSaleDiscount", async () => {
      await contractInstance.setActiveSale(true);
      await contractInstance.setSaleDiscount(50);
      let result = await contractInstance.mintFluffySheeps(10, {
        from: alice,
        value: web3.utils.toWei("0.2", "ether"),
      });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("test setMaxPresaleFluffySheepsPerHash", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
      ]);

      await contractInstance.setMaxPresaleFluffySheepsPerHash(20);

      const result = await contractInstance.mintFluffySheepsPresale(
        20,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.6", "ether"),
        }
      );
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
    it("test setFluffysheepPresalePrice", async () => {
      await contractInstance.setActivePresale(true);
      await contractInstance.setPresaleKeys([
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
      ]);

      await contractInstance.setFluffysheepPresalePrice(
        web3.utils.toWei("0.01", "ether")
      );

      const result = await contractInstance.mintFluffySheepsPresale(
        1,
        "14c1807a-ed1d-4192-b195-fedd9ea28be3",
        {
          from: alice,
          value: web3.utils.toWei("0.01", "ether"),
        }
      );
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.to, alice);
    });
  });
});
