const allPresaleKeys = require('./allPresaleKeys.json');
const web3 = require('web3');
const fs = require('fs');
const hashs = [];
for(const key of allPresaleKeys){
    const hash = web3.utils.soliditySha3(key);
    hashs.push(hash.substring(2,5));
}
if(new Set(hashs).size === hashs.length){
    console.log('Not Duplicate hash');
    fs.writeFileSync('./scripts/allPresaleHashs.json', JSON.stringify(hashs),{flag:'w'});
    console.log('Write file completed');
}else{
    console.log('It has duplicate hash');
}