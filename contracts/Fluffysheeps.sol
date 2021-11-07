// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
contract Fluffysheeps is ERC721,Ownable{
  using SafeMath for uint256;
  string private _baseTokenURI;
  string private _contractURI;
  uint256 private _maxTotalFluffySheeps = 96;
  uint256 private _currentTotalFluffySheeps = 0;
  uint256 private _fluffysheepPrice = 0.04 ether;
  bool private _isActiveSale = false;
  bool private _isActivePreSale = false;
  mapping(string => bool) private _isPresaleHashs;
  bytes32[] _hashBytes;

  constructor(string memory tokenBaseURI,string memory contractURIParam) ERC721("Fluffysheeps", "FFSS"){
        _baseTokenURI = tokenBaseURI;
        _contractURI = contractURIParam;
    }

  function _baseURI() internal view override returns (string memory) {
      return _baseTokenURI;
  }

  function contractURI() public view returns (string memory) {
      return _contractURI;
  }

  function mintFluffySheeps(uint256 totalSheeps) public payable{
    
    require(_isActiveSale,"sale_not_active");
    require(totalSheeps > 0, "invalid_total_sheeps");
    require(totalSheeps <= 20, "invalid_total_sheeps");
    require(_currentTotalFluffySheeps + totalSheeps <= _maxTotalFluffySheeps, "not_enought_sheeps");
    uint256 discount = _calculateDiscount(totalSheeps);
    require(msg.value >= _fluffysheepPrice * totalSheeps - discount, "payment_value_not_enought");
    require(_currentTotalFluffySheeps < _maxTotalFluffySheeps, "out_of_sheeps");
    for(uint i = 0 ; i < totalSheeps ; i++){
      uint256 randomId = random(0, _maxTotalFluffySheeps - 1 , i);
      while(_exists(randomId)){
        randomId = (randomId+1).mod(_maxTotalFluffySheeps);
      } 
      _safeMint(_msgSender() , randomId);
      _currentTotalFluffySheeps++;
    }
  }

  function mintFluffySheepsPresale(uint256 totalSheeps,string memory presaleKey) public payable{
    require(_isActivePreSale,"presale_sale_not_active");
    
    require( totalSheeps > 0, "invalid_total_sheeps");
    require(totalSheeps <= 20, "invalid_total_sheeps");
    require( _currentTotalFluffySheeps + totalSheeps <= _maxTotalFluffySheeps, "not_enought_sheeps");
    require(msg.value >= _fluffysheepPrice * totalSheeps, "payment_value_not_enought");
    require(_currentTotalFluffySheeps < _maxTotalFluffySheeps, "out_of_sheeps");
    string memory checkPrealeHash = subBytesToString(abi.encodePacked(keccak256(abi.encode(presaleKey))),0,6);
    require(_isPresaleHashs[checkPrealeHash], "invalid_presale_key");
    for(uint i = 0 ; i < totalSheeps ; i++){
      uint256 randomId = random(0, _maxTotalFluffySheeps - 1 , i);
      while(_exists(randomId)){
        randomId = (randomId+1).mod(_maxTotalFluffySheeps);
      } 
      _safeMint(_msgSender() , randomId);
      _currentTotalFluffySheeps++;
    }
    _isPresaleHashs[checkPrealeHash] = false;
  }

  function withdrawAll() public payable onlyOwner {
      require(payable(owner()).send(address(this).balance));
  }

  function setPresaleHashs(bytes32[] memory _hashs) public onlyOwner{
    for(uint i = 0 ; i < _hashs.length ; i++){
      // _isPresaleHashs[_hashs[i]] = true;
      _hashBytes.push(_hashs[i]);
    }
  }

  function setActiveSale(bool status) public onlyOwner{
    _isActiveSale = status;
  }

  function setActivePresale(bool status) public onlyOwner{
    _isActivePreSale = status;
  }

  //random number
  function random(
		uint256 from,
		uint256 to,
		uint256 salty
	) private view returns (uint256) {
		uint256 seed =
			uint256(
				keccak256(
					abi.encodePacked(
						block.timestamp +
							block.difficulty +
							((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
							block.gaslimit +
							((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
							block.number +
							salty
					)
				)
			);
		return seed.mod(to - from) + from;
	}

  function _calculateDiscount(uint totalSheeps) private view returns (uint256){
    if(totalSheeps >= 10){
      return totalSheeps * _fluffysheepPrice * 10 / 100;
    }else{
      return 0;
    }
  } 

  function subBytesToString(bytes memory strBytes, uint startIndex, uint endIndex) private pure returns (string memory) {
    bytes memory result = new bytes(endIndex-startIndex);
    for(uint i = startIndex; i < endIndex; i++) {
        result[i-startIndex] = strBytes[i];
    }
    return string(result);
  }
}
