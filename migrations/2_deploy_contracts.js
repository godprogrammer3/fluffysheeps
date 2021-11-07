var Fluffysheeps = artifacts.require('Fluffysheeps');
module.exports = function(deployer, network, addresses) {
    deployer.deploy(Fluffysheeps,process.env.TOKEN_BASE_URI,process.env.CONTRACT_URI);
};