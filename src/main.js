import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import kamilTouchAbi from "../contract/kamilTouch.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const kamilTouchContractAddress = "0xe10731551bBdD08E0FEE87340f03f60e86F84cbf";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit;
let contract;
let paintings = [];
let cUSDBalance;

const connectCeloWallet = async function () {
    if (window.celo) {
        notification("⚠️ Please approve this DApp to use it.");
      try {
        await window.celo.enable();
        notificationOff();
  
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0]
        console.log(kit.defaultAccount)

        contract = new kit.web3.eth.Contract(kamilTouchAbi, kamilTouchContractAddress);
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
    } else {
      notification("⚠️ Please install the CeloExtensionWallet...")
    }
}

  async function approve(_price) {
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)
  
    const result = await cUSDContract.methods
      .approve(kamilTouchContractAddress, _price)
      .send({ from: kit.defaultAccount })
    return result
  }
//To show and hide form
const btns = document.getElementsByClassName("add-painting");
const form = document.getElementById("painting-form");
const cancelBtn = document.getElementsByClassName("cancel")

btns[0].addEventListener("click" , () => {  
    form.classList.replace("hide", "show")
});

cancelBtn[0].addEventListener("click", function (e) {
    e.preventDefault();
    form.classList.replace("show", "hide");
  });
  //Ends here

const getBalance = async function () {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
    cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    document.querySelector("#balance").textContent = cUSDBalance;
    console.log(cUSDBalance)
  }

  const getPaintings = async function() {
    const _paintingsLength = await contract.methods.getPaintingsLength().call();
    const _paintings = [];
    for (let i = 0; i < _paintingsLength; i++) {
        let _painting = new Promise(async (resolve, reject) => {
          let p = await contract.methods.readPainting(i).call()
          resolve({
            index: i,
            owner: p[0],
            name: p[1],
            image: p[2],
            description: p[3],
            price: new BigNumber(p[4]),
            sold: p[5],
            likes: p[6]
          });
        });
        _paintings.push(_painting)
      }
      paintings = await Promise.all(_paintings)
      
      console.log(paintings)
      renderPaintings();
    }

function renderPaintings() {
    const paintingscontainer = document.querySelector("#marketplace");
    paintingscontainer.innerHTML = "";
    paintings.forEach((_painting) => {
        const newDiv = document.createElement("div")
        newDiv.className = "newPainting-div"
        newDiv.innerHTML = paintingTemplate(_painting)
        paintingscontainer.appendChild(newDiv)

    })
}

function paintingTemplate(_painting) {
    return `<div>
              <div class="painting-image">
               <img src="${_painting.image}" alt="...">
              </div>
               <div class="sold"> ${_painting.sold} sold </div>
               <div>
                 <div class="painting-identicon"> ${identiconTemplate(_painting.owner)}</div>
                 <h2 class="painting-name">
                   ${_painting.name}
                   <span class="painting-likes"><img class="like-image" id="${_painting.index}" src="https://img.icons8.com/emoji/48/000000/heart-suit.png"/><span class="num-of-likes">: ${_painting.likes}</span></span>
                 </h2>
                 <p class="painting-description">${_painting.description}</p>
                 <div class="buy-div">
                     <a class="buy-painting" id="${_painting.index}">
                       Buy for ${_painting.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD 
                     </a>
                 </div>
               </div>
            </div>`
}

document.querySelector("#marketplace").addEventListener("click", async function(e) {
  if(e.target.className.includes("like-image")) {
    let index = e.target.id;
    index = parseInt(index)
    if(paintings[index].owner != kit.defaultAccount) {
      try {
        notification("Like in progress")
        let res = await contract.methods.likePainting(index).send({ from: kit.defaultAccount });
        notification("Like successful")
        await getPaintings();
        notificationOff();
      }
      catch(e) {
        console.log(e)
        notificationOff();
      }
    }
    else {
      notification("Action not allowed");
      notificationOff();
    }
  }
})


function identiconTemplate(address) {
    const icon = blockies
        .create({
            seed: address,
            size: 8,
            scale: 16,
        })
        .toDataURL()
    return `<div class="identicon">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${address}/transactions"
    target="_blank">
    <img src="${icon}" width="48" alt="${address}">
    </a>
  </div>`
}

function notification(_text) {
    document.querySelector(".alert").style.display = "block"
    document.querySelector("#notification").textContent = _text
  }
  
  function notificationOff() {
    document.querySelector(".alert").style.display = "none"
  }

window.addEventListener("load", async () => {
    notification ("⌛ Page Loading...")
    await connectCeloWallet()
    getBalance()
    await getPaintings()
    notificationOff()
})

  document
  .querySelector("#newPaintingBtn")
  .addEventListener("click", async (e) => {
    e.preventDefault()

    const params = [
      document.getElementById("newPaintingName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newPaintingDescription").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      
        form.classList.replace("show", "hide");
        const result = await contract.methods
          .writePainting(...params)
          .send({ from: kit.defaultAccount })
        
        notification(`🎉 You successfully added "${params[0]}".`)
        notificationOff();
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
     
      getPaintings()
      e.preventDefault();
    })

document.querySelector("#marketplace").addEventListener("click", async (e) => {
    if(e.target.className.includes("buy-painting")) {
      const index = e.target.id
      if(paintings[index].owner != kit.defaultAccount && cUSDBalance > paintings[index].price) {
        notification("⌛ Waiting for payment approval...")
        try {
          await approve(paintings[index].price)
        } catch (error) {
          notification(`⚠️ ${error}.`)
        }
        notification(`⌛ Awaiting payment for "${paintings[index].name}"...`)
        try {
          const result = await contract.methods
            .buyPainting(index)
            .send({ from: kit.defaultAccount })
          notification(`🎉 You successfully bought "${paintings[index].name}".`)
          await getPaintings();
          await getBalance();
          notificationOff();
        } catch (error) {
          notification(`⚠️ ${error}.`)
        }
      }
      else {
        notification(`⚠️ transaction not allowed`)
      }
  }
})
