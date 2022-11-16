import React, { useState } from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/clientApp";

import {
  where,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { useCollection, useDocument } from "react-firebase-hooks/firestore";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [id, setId] = useState("0X4T0nX41A9Bijfe1Haa");
  const [balance, setBalance] = useState(0);
  const [stockId, setStockId] = useState("xHJkRrnUZppkDMsUkhTl");
  const [selectedCompany, setSelectedCompany] = useState("lenovo");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedCompanySold, setSelectedCompanySold] = useState("lenovo");
  const [selectedAmountSold, setSelectedAmountSold] = useState(0);
  const [stock, setStock] = useState(0);
  const [stockPrice, setStockPrice] = useState(0);
  const [companySpent, setCompanySpent] = useState(0);
  const [companyStock, setCompanyStock] = useState(0);
  const [user] = useAuthState(auth);
  const [value] = useDocument(doc(db, "users", id));
  const [stockValue] = useDocument(doc(db, "market", stockId));
  const [market] = useCollection(collection(db, "market"));

  if (!user)
    return (
      <Link href="/auth" style={{ fontSize: 40 }}>
        Click to Login
      </Link>
    );

  async function getDocumentID() {
    const usersRef = collection(db, "users");

    const q = query(usersRef, where("EMAIL", "==", user.email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setId(doc.id);
    });
  }

  getDocumentID();

  async function getStockData(company) {
    // Get the doc ID for the company
    const ref = collection(db, "market");
    const q = query(ref, where("name", "==", company));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setStockId(doc.id);
    });

    // Get the current stock price & number of stocks
    stockValue && setStock(stockValue.data().remStocks);
    stockValue && setStockPrice(stockValue.data().stockPrice);

    // Get user's current balance
    value && setBalance(value.data().BALANCE);
    // Get user's current expense on company stock
    value && setCompanySpent(value.data().company + "Spent");
    console.log(companySpent);
    // Get user's current number of company stock
    value && setCompanyStock(value.data().company + "Stocks");
  }

  async function buyStocks(company, amt) {
    await getStockData(company);
    // Check if enough stocks are available
    if (stock < amt) {
      toast.error("Insufficient stocks remaining!");
      return;
    } else if (stockPrice * amt > balance) {
      toast.error("Insufficient balance!");
      return;
    } else {
      // Update the user's balance
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        BALANCE: balance - stockPrice * amt,
      });

      // Update the company's remaining stocks
      const companyRef = doc(db, "market", stockId);
      await updateDoc(companyRef, {
        remStocks: stock - amt,
      });

      // Add the stocks to the user's portfolio
      const portfolioRef = doc(db, "users", id);
      await updateDoc(portfolioRef, {
        [company + "Spent"]: companySpent + stockPrice * amt,
        [company + "Stocks"]: companyStock + amt,
      });

      toast.success("Stocks bought successfully!");
    }
  }

  async function sellStocks(company, amt) {
    await getStockData(company);
    // Check if enough stocks are available
    if (companyStock < amt) {
      toast.error("Insufficient stocks owned!");
      return;
    } else {
      // Update the user's balance
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        BALANCE: balance + stockPrice * amt,
      });

      // Update the company's remaining stocks
      const companyRef = doc(db, "market", stockId);
      await updateDoc(companyRef, {
        remStocks: stock + amt,
      });

      // Add the stocks to the user's portfolio
      const portfolioRef = doc(db, "users", id);
      await updateDoc(portfolioRef, {
        [company + "Spent"]: companySpent - stockPrice * amt,
        [company + "Stocks"]: companyStock - amt,
      });

      toast.success("Stocks sold successfully!");
    }
  }

  return (
    <div className={styles.container}>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          <h3 className={styles.bal}>
            Balance: R¥ {value && value.data().BALANCE}
          </h3>
          <h3 className={styles.sch}>| {value && value.data().SCHOOL}</h3>
        </div>
        <div>
          <center>
            <h1 className={styles.head}>maverick dashboard</h1>
          </center>
        </div>
        <div className={styles.wrap}>
          <div className={styles.card}>
            <h3 className={styles.title}>Number of Stocks</h3>
            <select
              className={styles.select}
              name="Stock Name"
              onChange={(e) => {
                setSelectedCompany(e.target.value.toLowerCase());
              }}
            >
              <option value="Lenovo">Lenovo</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Samsung">Samsung</option>
              <option value="Sony">Sony</option>
              <option value="Dell">Dell</option>
              <option value="LG">LG</option>
              <option value="Apple">Apple</option>
            </select>
            <input
              className={styles.input}
              type="number"
              max={25}
              onChange={(e) => {
                setSelectedAmount(e.currentTarget.value);
              }}
            />
            <button
              className={styles.button}
              onClick={() => {
                buyStocks(selectedCompany, selectedAmount);
              }}
            >
              Buy
            </button>
          </div>
          <div className={styles.card}>
            <h3 className={styles.title}>Number of Stocks</h3>
            <select
              className={styles.select}
              name="Stock Name"
              onChange={(e) => {
                setSelectedCompanySold(e.target.value.toLowerCase());
              }}
            >
              <option value="Lenovo">Lenovo</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Samsung">Samsung</option>
              <option value="Sony">Sony</option>
              <option value="Dell">Dell</option>
              <option value="LG">LG</option>
              <option value="Apple">Apple</option>
            </select>
            <input
              className={styles.input}
              type="number"
              max={25}
              onChange={(e) => {
                setSelectedAmountSold(e.currentTarget.value);
              }}
            />
            <button
              className={styles.button}
              onClick={() => {
                sellStocks(selectedCompanySold, selectedAmountSold);
              }}
            >
              Sell
            </button>
          </div>
        </div>
        <div className={styles.stonk}>
          <h3 className={styles.stonkhead}>Your Stocks</h3>
          <div className={styles.stonkwrap}>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>Apple</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().appleStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().appleSpent}
              </h3>
            </div>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>Dell</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().dellStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().dellSpent}
              </h3>
            </div>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>Lenovo</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().lenovoStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().lenovoSpent}
              </h3>
            </div>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>LG</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().lgStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().lgSpent}
              </h3>
            </div>
          </div>
          <div className={styles.stonkwrap2}>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>Microsoft</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().microsoftStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().microsoftSpent}
              </h3>
            </div>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>OnePlus</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().oneplusStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().oneplusSpent}
              </h3>
            </div>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>Samsung</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().samsungStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().samsungSpent}
              </h3>
            </div>
            <div className={styles.stonkcard}>
              <h1 className={styles.stonktitle}>Sony</h1>
              <h3 className={styles.stonknum}>
                Stocks: {value && value.data().sonyStocks}
              </h3>
              <h3 className={styles.stonknum}>
                Price: {value && value.data().sonySpent}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
