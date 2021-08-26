require("dotenv").config();
const ethers = require("ethers");
const privateKey = process.env.PRIVATE_KEY;
const etherprovider = new ethers.providers.InfuraProvider(
  process.env.NETWORK,
  process.env.INFURA
);

const wallet = new ethers.Wallet(privateKey, etherprovider);

const stakingThales = require("./ABI/staking_thales.js");

async function closeFeePeriod() {
  console.log("Trying to close the period");
  try {
    const stakingContract = new ethers.Contract(
      process.env.STAKING_ADDRESS,
      stakingThales.stakingthales.abi,
      wallet
    );

    let lastPeriodTimeStamp = (
      await stakingContract.lastPeriodTimeStamp()
    ).toString();
    let durationPeriod = (await stakingContract.durationPeriod()).toString();
    let closingDate = new Date(
      lastPeriodTimeStamp * 1000.0 + durationPeriod * 1000.0
    );
    let now = new Date();

    if (now.getTime() > closingDate.getTime()) {
      let tx = await stakingContract.closePeriod();
      await tx.wait().then((e) => {
        console.log("done");
      });
    } else {
      console.log("Its not time yet");
    }
  } catch (e) {
    console.log("failed to close the period", e);
  }
}

setTimeout(closeFeePeriod, 1000);
setInterval(closeFeePeriod, 1000 * 60);
