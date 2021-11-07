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
        "internalType": "uint256",
        "name": "totalSheeps",
        "type": "uint256"
      }
    ],
    name: "mintFluffySheeps",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true
  }
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
      { gasLimit: "2222222"}
    );
    try{
      const result = await nftContract.methods
      .mintFluffySheeps(1)
      .send({ from:OWNER_ADDRESS , value: web3.utils.toWei(0.4+'', 'ether')});
      console.log("Minted fluffysheeps. Transaction: " + result.transactionHash);
    }catch(error){
      console.log('Error :',error);
    }
    
    
  } 
}

main();
