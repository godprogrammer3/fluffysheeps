var Fluffysheeps = artifacts.require('Fluffysheeps');
module.exports = function(deployer) {
    deployer.deploy(Fluffysheeps,process.env.TOKEN_BASE_URI,process.env.CONTRACT_URI);
    // Additional contracts can be deployed here
};