const fs = require('fs');
const Web3 = require('web3');
const { time } = require('console');
const provider = new Web3.providers.HttpProvider('https://rpc-testnet.whitebit.network');
const web3 = new Web3(provider);

//==============================================SETTINGS===================================================
const myWallets = readFile('to.txt'); //where to send
const myPrivateKey = ''; //your private here
const amountMin = 0.01; //min amount to send
const amountMax = 0.1; //max amount to send
let sleepTime = 2; //sec
//=========================================================================================================


function readFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const toWallets = data.trim().split('\n');
    const result = [];
    for (let i = 0; i < toWallets.length; i++) {
      result[i] = toWallets[i].trim();
    }
    return result;
}

async function sendWBT(from, to, amount, myPrivateKey){
  console.log('from: ' + from + ', to: ' + to + ', amount: ' + amount + ';');
  amount = web3.utils.toWei(amount, 'ether');
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await web3.eth.estimateGas({
    from: from,
    to: to,
    value: amount
  });
 const tx = await web3.eth.accounts.signTransaction(
    {
      from: from,
      to: to,
      value: amount,
      gas: gasLimit * 2,
      gasPrice: gasPrice
    },
    myPrivateKey
  );
  const signedTx = await web3.eth.sendSignedTransaction(tx.rawTransaction);
  console.log('Done! tx: ', signedTx.transactionHash);
}

function wait(timeout) {
  console.log('Waiting: ' + timeout + 'sec')
  return new Promise((resolve) => {
    setTimeout(resolve, timeout*1000);
  });
}

function currentTime(){
  let currentDate = new Date();
  let isoDate = currentDate.toISOString();
  return isoDate;
}

function getRandomNumber(min, max) {
  const randomNumber = Math.random() * (max - min) + min;
  return randomNumber;
}


async function main() {
    const myAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKey);
    let sourceAddress = myAccount.address;
    let destinationAddress = '';
    console.log('Starting @ ' + currentTime());
    for (let i = 0; i < myWallets.length; i++) {
        destinationAddress = myWallets[i];
        let amount = getRandomNumber(amountMin, amountMax);
        let result = await sendWBT(sourceAddress, destinationAddress, amount.toString(), myPrivateKey);
        wait(sleepTime);
      }
    console.log('Ended @ ' + currentTime());
}

main();