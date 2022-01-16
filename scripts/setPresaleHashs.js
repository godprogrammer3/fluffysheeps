const HDWalletProvider = require("truffle-hdwallet-provider");
const web3 = require("web3");
const MNEMONIC = process.env.MNEMONIC;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;

if (!MNEMONIC || !NODE_API_KEY || !OWNER_ADDRESS || !NETWORK) {
  console.error(
    "Please set a mnemonic, Alchemy/Infura key, owner, network, and contract address."
  );
  return;
}

const NFT_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "_hashs",
        type: "bytes32[]",
      },
    ],
    name: "setPresaleHashs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  const network =
    NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
  const provider = new HDWalletProvider(
    MNEMONIC,
    isInfura
      ? "https://" + network + ".infura.io/v3/" + NODE_API_KEY
      : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY
  );
  const web3Instance = new web3(provider);
  if (NFT_CONTRACT_ADDRESS) {
    const nftContract = new web3Instance.eth.Contract(
      NFT_ABI,
      NFT_CONTRACT_ADDRESS,
      { gasLimit: "2222222" }
    );
    try {
      let inputs = await require("./allPresaleKeys.json");
      inputs = inputs.map((input) => web3.utils.soliditySha3(input));
      const result = await nftContract.methods
        .setPresaleHashs(inputs)
        .estimateGas(
          { gas: 90000000, from: OWNER_ADDRESS },
          function (error, gasAmount) {
            if (error) {
              console.log("Error:", error);
            } else {
              console.log("Estimate gas:", gasAmount);
            }
          }
        );
      console.log("Set Presale Hashs. Transaction: " + result.transactionHash);
    } catch (error) {
      console.log("Error :", error);
    }
  }
}

main();
