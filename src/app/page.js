"use client"

import 'flowbite'
import { ethers } from "ethers";
import jazzicon from "@metamask/jazzicon"

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import insuranceData from './insurance.data';

const contractAddress = "0xB4Ea46f13a74998C6d52efB215D3F380a099Ae3f";
const insuranceAbi = require("../../abi.json");

const getFormatedBalance = (balance, precision = 2) => {
  return (+ethers.utils.formatEther(balance)).toFixed(precision);
}
const getFormatedDate = (unix_timestamp) => {
  const date = new Date(unix_timestamp * 1000);

  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedDate = dd + '/' + mm + '/' + yyyy;

  return formattedDate;
}

let nextStepHandler = null;
const insuranceTimeOptions = {
  0: '1 month',
  1: '3 months',
  2: '6 months',
  3: '12 months',
}
const timeToTimestamp = {
  0: 30 * 24 * 60 * 60,
  1: 90 * 24 * 60 * 60,
  2: 180 * 24 * 60 * 60,
  3: 360 * 24 * 60 * 60,
}

const insuranceStatus = {
  0: 'Pending',
  1: 'Active',
  2: 'All amount was claimed',
  3: 'Expired',
  4: 'Rejected by risk'
}


export default function Home() {

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [signerAddress, setSignerAddress] = useState(null);

  const [balances, setBalances] = useState({insuranceCompanyBalance: 0, insuranceLockedBalance: 0});
  const [insuranceTypes, setInsuranceTypes] = useState({});
  const [insurances, setInsurances] = useState([]);
  const [userInsurances, setUserInsurances] = useState([]);
  const [applicationTitle, setApplicationTitle] = useState("Insurance application");

  const [timeFactor, setTimeFactor] = useState(0);

  const [application, setApplication] = useState({});

  const logoRef = useRef(null);
  const userMenuRef = useRef(null);
  const nextStepRef = useRef(null);
  const connectWalletRef = useRef(null);
  const applicationFormRef = useRef(null);
  const insuranceTypeRef = useRef(null);
  const insuranceDataRef = useRef(null);
  const insurableAmountRef = useRef(null);
  const insuranceDurationRef = useRef(null);
  const claimerRef = useRef(null);
  const finalFormRef = useRef(null);
  const submissionsRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const dropdownInformationRef = useRef(null);

  const initApp = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);

    setProvider(provider);

    const insuranceContract = new ethers.Contract(contractAddress, insuranceAbi, provider);
    setContract(insuranceContract);

    // get balances
    const insuranceCompanyBalance = getFormatedBalance(await insuranceContract.getBalance());
    const insuranceLockedBalance = (+ethers.utils.formatEther(await insuranceContract.getLockedBalance()) * 1_000_000_000).toFixed(2);
    setBalances({ insuranceCompanyBalance, insuranceLockedBalance });

    // assemble insurance types
    const typesCount = await insuranceContract.getTypesCount();
    const updatedInsuranceTypes = {};
    for (let i = 0; i < typesCount; i++) {
      const insuranceType = await insuranceContract.getType(i);
      updatedInsuranceTypes[i] = insuranceType;
    }
    setInsuranceTypes({ ...insuranceTypes, ...updatedInsuranceTypes });


    // assemble users insurances
    const insurancesCount = await insuranceContract.getInsurancesCount();
    const updatedInsurances = [];
    for (let i = 0; i < insurancesCount; i++) {
      const insuranceType = await insuranceContract.getInsurance(i);
      updatedInsurances.push(insuranceType);
    }
    setInsurances(updatedInsurances);
  }

  const connectWallet = async () => {

    const signer = provider.getSigner()
    setSigner(signer);

    if (signer) {
      connectWalletRef.current.classList.add("hidden");
      applicationFormRef.current.classList.remove("hidden");

      const address = await signer.getAddress();
      setSignerAddress(address);

      const seed = parseInt(address, 16);
      const icon = jazzicon(20, seed);
      icon.style.width = "30px";
      icon.style.height = "30px";
      userMenuRef.current.appendChild(icon);
      userMenuRef.current.classList.remove("hidden");
      userMenuRef.current.classList.add("flex");

      setApplicationTitle("Insurance Type");

      // By default claimer is the signer
      setApplication({ ...application, claimer: address });
    }
  }

  const nextStep = () => {
    nextStepHandler()
  }

  const handleUserMenuClick = () => {

  }
  const handleInsuranceTypeChange = (e) => {
    const value = e.target.value;

    setApplication({ ...application, type: value });

    if (value) {
      nextStepHandler = () => {
        insuranceTypeRef.current.classList.add("hidden");
        setApplicationTitle("Insurance Information");
        insuranceDataRef.current.classList.remove("hidden");
        nextStepRef.current.classList.add("hidden");
      }
      nextStepRef.current.classList.remove("hidden");
    } else {
      nextStepHandler = null;
      nextStepRef.current.classList.add("hidden");
    }
  }
  const handleInsuranceDataChange = (e) => {
    const value = e.target.value;

    setApplication({ ...application, data: value });

    if (value) {
      nextStepHandler = () => {
        insuranceDataRef.current.classList.add("hidden");
        setApplicationTitle("Insurable Amount");
        insurableAmountRef.current.classList.remove("hidden");
        nextStepRef.current.classList.add("hidden");
      }
      nextStepRef.current.classList.remove("hidden");
    } else {
      nextStepHandler = null;
      nextStepRef.current.classList.add("hidden");
    }
  }
  const handleInsurableAmountChange = (e) => {
    const value = e.target.value;

    setApplication({ ...application, amount: value });

    if (value) {
      nextStepHandler = () => {
        insurableAmountRef.current.classList.add("hidden");
        setApplicationTitle("Insurance Duration");
        insuranceDurationRef.current.classList.remove("hidden");
        nextStepRef.current.classList.add("hidden");
      }
      nextStepRef.current.classList.remove("hidden");
    } else {
      nextStepHandler = null;
      nextStepRef.current.classList.add("hidden");
    }
  }
  const handleInsuranceDurationChange = (e) => {
    const value = e.target.value;

    setApplication({ ...application, duration: value });

    if (value) {

      setTimeFactor(value);

      let expirityDate = new Date();
      // add seconds to date
      expirityDate.setSeconds(expirityDate.getSeconds() + timeToTimestamp[value]);

      setApplication({ ...application, duration: expirityDate });

      nextStepHandler = () => {
        insuranceDurationRef.current.classList.add("hidden");

        if (application.type == 1) {
          setApplicationTitle("Claimer Address");
          claimerRef.current.classList.remove("hidden");
          nextStepRef.current.classList.add("hidden");
        } else {
          applicationFormRef.current.classList.add("hidden");
          finalFormRef.current.classList.remove("hidden");
        }
      }
      nextStepRef.current.classList.remove("hidden");
    } else {
      nextStepHandler = null;
      nextStepRef.current.classList.add("hidden");
      setApplication({ ...application, expirityDate: null });
    }
  }
  const handleClaimerChange = (e) => {
    const value = e.target.value;

    setApplication({ ...application, claimer: value });

    if (value) {
      nextStepHandler = () => {
        applicationFormRef.current.classList.add("hidden");
        finalFormRef.current.classList.remove("hidden");
      }
      nextStepRef.current.classList.remove("hidden");
    } else {
      nextStepHandler = null;
      nextStepRef.current.classList.add("hidden");
    }
  }
  const handleSubmit = async () => {
    const { type, data, amount, duration, claimer } = application;

    if (!type || !data || !amount || !duration || !claimer) {
      alert("Some fields are missing, please reload the page and try again.");
      return;
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, insuranceAbi, signer);

    const dateInSecs = Math.floor(duration.getTime() / 1000);

    finalFormRef.current.classList.add("hidden");
    loadingScreenRef.current.classList.remove("hidden");
    const tx = await contract.createInsurance(type, data, dateInSecs, claimer, ethers.utils.formatUnits(amount, 'wei') * 1_000_000_000, { value: ethers.utils.parseUnits(`${getPrice(amount)}`, "ether") });
    await tx.wait();

    const insuranceCompanyBalance = getFormatedBalance(await contract.getBalance());
    const insuranceLockedBalance = getFormatedBalance(await contract.getLockedBalance());
    setBalances({ ...balances, insuranceCompanyBalance, insuranceLockedBalance });

    setApplication({});
    alert("Insurance application was submited successfully!");
    loadingScreenRef.current.classList.add("hidden");
    applicationFormRef.current.classList.add("hidden");

    handleSubmissionsButtonClick();
  }
  const handleSubmissionsButtonClick = async () => {

    dropdownInformationRef.current.classList.add("hidden");

    finalFormRef.current.classList.add("hidden");
    applicationFormRef.current.classList.add("hidden");

    let _userInsurances = [];
    insurances.forEach((insurance) => {
      if (insurance.creator == signerAddress) {
        _userInsurances.push(insurance);
      }
    });
    setUserInsurances(_userInsurances);

    submissionsRef.current.classList.remove("hidden");
  }

  const getPrice = (amount) => {
    return Math.abs(amount * ((timeFactor + 1) / -(20 * (timeFactor + 1))));
  }

  useEffect(() => {
    connectWalletRef.current.classList.remove("hidden");
    if (window.ethereum?._state?.account?.length) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [ethers])

  useEffect(() => {
    if (signer) {
      logoRef.current.classList.add("hidden");
    }
  }, [signer])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-20 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">

        <div className="inline-flex flex-col rounded-md shadow-sm w-full mb-4 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <a href="#" className="flex justify-between px-4 py-2 text-sm font-medium rounded-t border-gray-300 bg-gradient-to-b from-zinc-200 dark:text-white dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:dark:bg-zinc-800/30 cursor-default">
            <span className="w-full">
              Insurance company balance: &nbsp;
            </span>
            <code className="font-mono font-bold">{balances.insuranceCompanyBalance}</code>
          </a>
          <a href="#" className="flex justify-between px-4 py-2 rounded-b text-sm font-medium border-gray-300 bg-gradient-to-b from-zinc-200 dark:text-white dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:bg-gray-200 lg:dark:bg-zinc-800/30 cursor-default">
            <span className="w-full">
              Insurance reserved balance: &nbsp;
            </span>
            <code className="font-mono font-bold">{balances.insuranceLockedBalance}</code>
          </a>
        </div>

        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://xrpl.org/index.html"
            target="_blank"
            rel="noopener noreferrer"
            ref={logoRef}
          >
            <Image
              src="/xrpl.png"
              alt="XRPL Logo"
              className="dark:invert"
              width={150}
              height={48}
              priority
            />
          </a>
          <button
            className="pointer-events-none place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 hidden"
            ref={userMenuRef}
            onClick={handleUserMenuClick}
            data-dropdown-toggle="dropdownInformation"
            type="button"
          ></button>
          <div id="dropdownInformation" ref={dropdownInformationRef} className="hidden z-10 rounded-lg border px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 divide-y divide-gray-100 shadow w-44  dark:divide-gray-600">
            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div className="font-medium truncate">{signerAddress}</div>
            </div>
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownInformationButton">
              <li>
                <a href="#" onClick={handleSubmissionsButtonClick} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Claims</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
              </li>
            </ul>
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-10 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-20">
        {/* CONNECT WALLET */}
        <div
          className="hidden rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer"
          onClick={connectWallet}
          ref={connectWalletRef}
        >
          <h2 className={`text-2xl font-semibold`}>
            Connect Wallet{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </div>

        {/* APPLICATION FORM */}
        <div
          className="hidden sm:min-w-96 rounded-lg border px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 z-50"
          ref={applicationFormRef}
        >
          <h2 className={`text-2xl font-semibold`}>
            {applicationTitle + " "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>

          <div
            ref={insuranceTypeRef}
          >
            <select
              className="mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={handleInsuranceTypeChange}
            >
              <option defaultValue>Choose insurance type</option>
              {Object.keys(insuranceTypes).map((key) => {
                return (
                  <option key={key} value={key}>
                    {insuranceTypes[key]}
                  </option>
                );
              })}
            </select>
          </div>

          <div
            className='hidden'
            ref={insuranceDataRef}
          >
            <div className='flex '>
              <label className='
              mt-4 px-4 py-2 transition-colors z-50
              '>{insuranceData[application.type]?.data}</label>
              <input className='
              rounded-lg border mt-4 px-4 py-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer
              ' onChange={handleInsuranceDataChange}></input>
            </div>
          </div>

          <div
            className='hidden'
            ref={insurableAmountRef}
          >
            <div className='flex '>
              <label className='
              mt-4 px-4 py-2 transition-colors z-50
              '>Amount in XRP: </label>
              <input className='
              rounded-lg border mt-4 px-4 py-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer
              ' onChange={handleInsurableAmountChange}></input>
            </div>
          </div>

          <div
            className='hidden'
            ref={insuranceDurationRef}
          >
            <select
              className="mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={handleInsuranceDurationChange}
            >
              <option defaultValue>Choose insurance duration time</option>
              {Object.keys(insuranceTimeOptions).map((key) => {
                return (
                  <option key={key} value={key}>
                    {insuranceTimeOptions[key]}
                  </option>
                );
              })}
            </select>
          </div>

          <div
            className='hidden'
            ref={claimerRef}
          >
            <div className='flex '>
              <label className='
              mt-4 px-4 py-2 transition-colors z-50
              '>Address of claimer in case of insurable event: </label>
              <input className='
              rounded-lg border mt-4 px-4 py-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer
              ' onChange={handleClaimerChange}></input>
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              ref={nextStepRef}
              onClick={nextStep}
              className='
                  hidden rounded-lg border mt-4 px-4 py-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer
                '
            >
              next
            </button>
          </div>
        </div>

        {/* FINAL FORM */}
        <div
          className="hidden sm:min-w-max rounded-lg border px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 z-50"
          ref={finalFormRef}
        >
          <h2 className={`text-2xl font-semibold`}>
            Confirm insurance application
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>

          <div className='font-mono mt-8 my-4'>
            <div className='flex justify-between items-center my-1'>
              <span className='
        px-4 transition-colors z-50
        '>Insurance type: </span><b>{insuranceTypes[application.type]}</b>
            </div>
            <div className='flex justify-between items-center my-1'>
              <label className='
        px-4 transition-colors z-50
        '>{insuranceData[application.type]?.data}</label><b>{application.data}</b>
            </div>
            <div className='flex justify-between items-center my-1'>
              <label className='
        px-4 transition-colors z-50
        '>Amount in XRP: </label><b>{application.amount}</b>
            </div>
            <div className='flex justify-between items-center my-1'>
              <label className='
        px-4 transition-colors z-50
        '>Price in XRP: </label><b>{getPrice(application.amount)}</b>
            </div>
            <div className='flex justify-between items-center my-1'>
              <label className='
        px-4 transition-colors z-50
        '>Insurance duration: </label><b>{application.duration?.toLocaleDateString()}</b>
            </div>
            <div className='flex justify-between items-center my-1'>
              <label className='
        px-4 transition-colors z-50
        '>Address of claimer in case of insurable event: </label><b>{application.claimer}</b>
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              onClick={handleSubmit}
              className='
                rounded-lg border mt-4 px-4 py-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer
              '
            >
              Submit
            </button>
          </div>

        </div>


        {/* LOADING SCREEN */}
        <div
          className="hidden sm:min-w-max rounded-lg border px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 z-50"
          ref={loadingScreenRef}
        >
          <h2 className={`text-2xl font-semibold`}>
            Loading...
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </div>

        {/* SUBMISSIONS */}
        <div
          className="hidden  rounded-lg border px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 z-50"
          ref={submissionsRef}
        >
          <h2 className={`text-2xl font-semibold`}>
            Submited insurances
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <div className='font-mono mt-8 my-4'>
            {userInsurances.map((insurance, index) => {
              return (
                <div key={index} className='flex flex-col justify-between items-center my-3 mx-12 border'>

                  <div className='flex justify-between items-center w-full my-1'>
                    <span className='
        px-4 transition-colors z-50
        '>Insurance type: </span>
                    <b>{insuranceTypes[insurance.insuranceType]}</b>
                  </div>
                  <div className='flex justify-between items-center w-full my-1'>
                    <label className='
        px-4 transition-colors z-50
        '>{insuranceData[insurance.insuranceType]?.data}: </label>
                    <b>{insurance.data}</b>
                  </div>
                  <div className='flex justify-between items-center w-full my-1'>
                    <label className='
        px-4 transition-colors z-50
        '>Max settlement amount: </label>
                    <b>{getFormatedBalance(ethers.utils.parseUnits(`${insurance.maxCoverageAmount}`, 'gwei'))}</b>
                  </div>
                  <div className='flex justify-between items-center w-full my-1'>
                    <label className='
        px-4 transition-colors z-50
        '>Premium Amount: </label>
                    <b>{getFormatedBalance(insurance.payedAmount)}</b>
                  </div>
                  <div className='flex justify-between items-center w-full my-1'>
                    <label className='
        px-4 transition-colors z-50
        '>Insurance expirity date: </label>
                    <b>{getFormatedDate(insurance.expirityDate)}</b>
                  </div>
                  <div className='flex justify-between items-center w-full my-1'>
                    <label className='
        px-4 transition-colors z-50
        '>Address of claimer in case of insurable event: </label>
                    <b>{insurance.receiver}</b>
                  </div>
                  <hr className='w-full my-2' />
                  <div className='flex justify-between items-center w-full my-1'>
                    <label className='
        px-4 transition-colors z-50
        '>Address of claimer in case of insurable event: </label>
                    <b>{insuranceStatus[insurance.status]}</b>
                  </div>

                  {insurance.status == 1 && <div className='flex justify-end'>
                    <button
                      onClick={handleSubmit}
                      className='
                          rounded-lg border my-4 px-4 py-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-50 cursor-pointer
                        '
                    >
                      Submit a claim
                    </button>
                  </div>}

                </div>
              )
            })}
          </div>
        </div>

      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
      </div>
    </main>
  );
}
