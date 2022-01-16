// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Fluffysheeps is ERC721, Ownable, ERC721Enumerable {
    using SafeMath for uint256;
    string private _baseTokenURI;
    string private _contractURI;
    uint256 private _maxTotalFluffySheeps = 9999;
    uint256 private _maxTotalGiffFluffySheeps = 100;
    uint256 private _currentTotalFluffySheeps = 0;
    uint256 private _fluffysheepPrice = 0.04 ether;
    uint256 private _fluffysheepPresalePrice = 0.03 ether;
    uint256 private _maxPresaleFluffySheepsPerHash = 10;
    bool private _isActiveSale = false;
    bool private _isActivePreSale = false;
    mapping(bytes32 => bool) private _isValidPresaleHashs;
    uint256 private _saleDiscount = 10;

    constructor(string memory tokenBaseURI, string memory contractURIParam)
        ERC721("Fluffysheeps", "FFSS")
    {
        _baseTokenURI = tokenBaseURI;
        _contractURI = contractURIParam;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mintFluffySheeps(uint256 totalSheeps) public payable {
        require(_isActiveSale, "sale_not_active");
        require(totalSheeps > 0, "invalid_total_sheeps");
        require(totalSheeps <= 20, "invalid_total_sheeps");
        require(
            _currentTotalFluffySheeps + totalSheeps <= _maxTotalFluffySheeps,
            "not_enough_sheeps"
        );
        uint256 discount = _calculateDiscount(totalSheeps);
        require(
            msg.value >= _fluffysheepPrice * totalSheeps - discount,
            "payment_value_not_enough"
        );
        require(
            _currentTotalFluffySheeps < _maxTotalFluffySheeps,
            "out_of_sheeps"
        );
        for (uint256 i = 0; i < totalSheeps; i++) {
            uint256 randomId = random(0, _maxTotalFluffySheeps - 1, i);
            while (_exists(randomId)) {
                randomId = (randomId + 1).mod(_maxTotalFluffySheeps);
            }
            _safeMint(_msgSender(), randomId);
            _currentTotalFluffySheeps++;
        }
    }

    function mintFluffySheepsPresale(
        uint256 totalSheeps,
        string memory presaleKey
    ) public payable {
        require(_isActivePreSale, "presale_sale_not_active");
        require(totalSheeps > 0, "invalid_total_sheeps");
        require(
            totalSheeps <= _maxPresaleFluffySheepsPerHash,
            "invalid_total_sheeps"
        );
        require(
            _currentTotalFluffySheeps + totalSheeps <= _maxTotalFluffySheeps,
            "not_enough_sheeps"
        );
        require(
            msg.value >= _fluffysheepPresalePrice * totalSheeps,
            "payment_value_not_enough"
        );
        require(
            _currentTotalFluffySheeps < _maxTotalFluffySheeps,
            "out_of_sheeps"
        );
        bytes32 checkPresaleHash = keccak256(abi.encode(presaleKey));
        require(_isValidPresaleHashs[checkPresaleHash], "invalid_presale_key");
        for (uint256 i = 0; i < totalSheeps; i++) {
            uint256 randomId = random(0, _maxTotalFluffySheeps - 1, i);
            while (_exists(randomId)) {
                randomId = (randomId + 1).mod(_maxTotalFluffySheeps);
            }
            _safeMint(_msgSender(), randomId);
            _currentTotalFluffySheeps++;
        }
        _isValidPresaleHashs[checkPresaleHash] = false;
    }

    function withdrawAll() public payable onlyOwner {
        require(payable(owner()).send(address(this).balance));
    }

    function setPresaleKeys(string[] memory _keys) public onlyOwner {
        for (uint256 i = 0; i < _keys.length; i++) {
            _isValidPresaleHashs[keccak256(abi.encode(_keys[i]))] = true;
        }
    }

    function setActiveSale(bool status) public onlyOwner {
        _isActiveSale = status;
    }

    function setActivePresale(bool status) public onlyOwner {
        _isActivePreSale = status;
    }

    function setFluffysheepPrice(uint256 fluffysheepPrice) public onlyOwner {
        _fluffysheepPrice = fluffysheepPrice;
    }

    function setSaleDiscount(uint256 discount) public onlyOwner {
        _saleDiscount = discount;
    }

    function setMaxPresaleFluffySheepsPerHash(
        uint256 maxPresaleFluffySheepsPerHash
    ) public onlyOwner {
        _maxPresaleFluffySheepsPerHash = maxPresaleFluffySheepsPerHash;
    }

    function setFluffysheepPresalePrice(uint256 fluffysheepPresalePrice)
        public
        onlyOwner
    {
        _fluffysheepPresalePrice = fluffysheepPresalePrice;
    }

    //random number
    function random(
        uint256 from,
        uint256 to,
        uint256 salty
    ) private view returns (uint256) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                        block.difficulty +
                        ((
                            uint256(keccak256(abi.encodePacked(block.coinbase)))
                        ) / (block.timestamp)) +
                        block.gaslimit +
                        ((uint256(keccak256(abi.encodePacked(msg.sender)))) /
                            (block.timestamp)) +
                        block.number +
                        salty
                )
            )
        );
        return seed.mod(to - from) + from;
    }

    function _calculateDiscount(uint256 totalSheeps)
        private
        view
        returns (uint256)
    {
        if (totalSheeps >= 10) {
            return (totalSheeps * _fluffysheepPrice * _saleDiscount) / 100;
        } else {
            return 0;
        }
    }

    //FOR TEST
    function _calculateDiscountTest(uint256 totalSheeps)
        public
        view
        returns (uint256)
    {
        if (totalSheeps >= 10) {
            return (totalSheeps * _fluffysheepPrice * _saleDiscount) / 100;
        } else {
            return 0;
        }
    }

    function _setMaxTotalFluffySheepsTest(uint256 max) public onlyOwner {
        _maxTotalFluffySheeps = max;
    }
}
