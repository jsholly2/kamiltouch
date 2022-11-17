// SPDX-License-Identifier: MIT  
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/Counters.sol";



interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract kamiltouch {
    address internal constant cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    using Counters for Counters.Counter;
    Counters.Counter paintingsLength;

    struct Painting {
        address payable owner;
        string name;
        string image;
        string description;
        uint price;
        uint sold;
        uint likes;
    }

    mapping (uint => Painting) internal paintings;
    mapping (uint => mapping(address => bool)) hasLiked;
    
    
// Function to create a painting providing the
// name
// image url
// description
// price
    function writePainting(
		string memory _name,
		string memory _image,
		string memory _description, 
		uint _price
    ) public {
		paintings[paintingsLength.current()] = Painting(
			payable(msg.sender),
			_name,
			_image,
			_description,
			_price,
			0,
            0
		);
        paintingsLength.increment();
    }

// Function to read an uploaded painting using the index of the painting
    function readPainting(uint _index) public view returns (
        address payable,
		string memory, 
		string memory, 
		string memory,
		uint, 
		uint,
        uint
    ) {
        return (
            paintings[_index].owner, 
			paintings[_index].name, 
			paintings[_index].image, 
			paintings[_index].description,
			paintings[_index].price,
			paintings[_index].sold,
            paintings[_index].likes
        );
    }
    
// Function to buy an uploaded painting using the painting's index
// it sends the money to be paid from the buyer to the owner of the painting
    function buyPainting(uint _index) public payable  {
        require(msg.sender != paintings[_index].owner, "owner can't buy");
		require(
		  IERC20Token(cUsdTokenAddress).transferFrom(
			msg.sender,
			paintings[_index].owner,
			paintings[_index].price
		  ),
		  "Transfer failed."
		);
		paintings[_index].sold++;
	}
    
   // Function to like a painting using the painting's index
    function likePainting(uint _index) public {
        require(!hasLiked[_index][msg.sender], "already liked");
        if(!hasLiked[_index][msg.sender]) {
            paintings[_index].likes++;
            hasLiked[_index][msg.sender] = true;
        }
    }
    
    // Function tp get the total length of all the uploaded painting
    function getPaintingsLength() public view returns (uint) {
        return (paintingsLength.current());
    }

}