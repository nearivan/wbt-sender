const fs = require('fs');
const Web3 = require('web3');
const { time } = require('console');
const provider = new Web3.providers.HttpProvider('https://rpc-testnet.whitebit.network');
const web3 = new Web3(provider);

//==============================================SETTINGS===================================================
const myWallets = readFile('destination.txt'); //where to send
const myPrivateKeys = readFile('source.txt');
const amountMin = 0.01; //min amount to send
const amountMax = 0.1; //max amount to send
const sleepTimeMin = 2; //sec
const sleepTimeMax = 3; //sec
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

async function getBalanceWBT (myAddress){
  let walletBalanceWBT = await web3.eth.getBalance(myAddress);
  walletBalanceWBT = web3.utils.fromWei(walletBalanceWBT, 'ether');
  return walletBalanceWBT;
}

function line(){
  console.log('==============================================================================================================================');
}

async function sendWBT(source, destination, amount, myPrivateKey){
  let balance = await getBalanceWBT(source);
  line();
  console.log('FROM: ' + source + '\nTO: ' + destination + '\nBALANCE: ' + balance + ' WBT' + '\nAMOUNT: ' + amount + ' WBT');
  amount = web3.utils.toWei(amount, 'ether');
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await web3.eth.estimateGas({
    from: source,
    to: destination,
    value: amount
  });
 const tx = await web3.eth.accounts.signTransaction(
    {
      from: source,
      to: destination,
      value: amount,
      gas: gasLimit * 2,
      gasPrice: gasPrice
    },
    myPrivateKey
  );
  const signedTx = await web3.eth.sendSignedTransaction(tx.rawTransaction);
  console.log('https://explorer.whitebit.network/testnet/tx/%s\nDONE!', signedTx.transactionHash);
  line();
}

function wait(timeout) {
  console.log('Waiting: ' + timeout.toFixed(2) + ' sec')
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
  let destinationAddress = '';
  for (let c = 0; c < myPrivateKeys.length; c++) {
    let myAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKeys[c]);
    let sourceAddress = myAccount.address;
    console.log('Starting @ ' + currentTime());
      for (let i = 0; i < myWallets.length; i++) {
        destinationAddress = myWallets[i];
        let amount = getRandomNumber(amountMin, amountMax);
        await sendWBT(sourceAddress, destinationAddress, amount.toString(), myPrivateKeys[c]);
        wait(getRandomNumber(sleepTimeMin, sleepTimeMax));
      }
    console.log('Ended @ ' + currentTime());
    
  }
}

main();