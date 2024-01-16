import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Product from "./components/Product";
import Logo from "./assets/logo.svg";
import OneEuroCent from "./assets/1_euro_cent.svg";
import TwoEuroCent from "./assets/2_euro_cent.svg";
import FiveEuroCent from "./assets/5_euro_cent.svg";
import TenEuroCent from "./assets/10cent.svg";
import TwentyEuroCent from "./assets/20cent.svg";
import FiftyEuroCent from "./assets/50cent.svg";
import OneEuro from "./assets/1euro.svg";
import TwoEuro from "./assets/2euro.svg";
import { CoinType, ProductType } from "./types";
import { multiply, round, subtract, sum } from "mathjs";

function App() {
  const currency = "EUR";
  const dataSourceURL = "http://localhost:3001/products";
  const coins: CoinType[] = [
    { img: OneEuroCent, alt: "One Cent", value: 0.01 },
    { img: TwoEuroCent, alt: "Two Cents", value: 0.02 },
    { img: FiveEuroCent, alt: "Five Cents", value: 0.05 },
    { img: TenEuroCent, alt: "Ten Cents", value: 0.1 },
    { img: TwentyEuroCent, alt: "Twenty Cents", value: 0.2 },
    { img: FiftyEuroCent, alt: "Fifty Cents", value: 0.5 },
    { img: OneEuro, alt: "One Euro", value: 1 },
    { img: TwoEuro, alt: "Two Euro", value: 2 },
  ];
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [initialProducts, setInitialProducts] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [basket, setBasket] = useState<ProductType[]>([]);
  const [providedAmount, setProvidedAmount] = useState(0);
  const bill: number = useMemo(
    () =>
      basket.reduce(
        (accumulator, product) =>
          round(sum(accumulator, multiply(product.price, product.quantity)), 2),
        0
      ),
    [basket]
  );

  useEffect(() => {
    fetch(dataSourceURL)
      .then((response) => response.json())
      .then((data: ProductType[]) => {
        // keep an independent value in order to be able to reset and do CRUD operations on it
        setInitialProducts(JSON.parse(JSON.stringify(data)));
        // separate "draft" state of the products as we don't actually want to remove the items after transaction has ended
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setError(error);
      });
  }, []);

  const isBillPaid = providedAmount >= bill && bill !== 0;

  const formatMoney = (value: number) =>
    `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}${currency}`;

  const returnChange = (
    bill: number,
    providedAmount: number,
    coins: CoinType[]
  ) => {
    const listOfCoinsReturned = [];
    let amountToBeReturned = round(subtract(providedAmount, bill), 2);
    const ascendingCoinValues = [...coins]
      .sort((a, b) => a.value - b.value)
      .map((coin) => coin.value); // in case the order of provided coins is changed by user

    while (amountToBeReturned > 0) {
      const coin = { value: ascendingCoinValues.pop(), amount: 0 };
      listOfCoinsReturned.push(coin);
      while (coin.value && amountToBeReturned >= coin.value) {
        coin.amount += 1;
        amountToBeReturned = round(subtract(amountToBeReturned, coin.value), 2);
      }
    }
    return listOfCoinsReturned as { value: number; amount: number }[];
  };

  const displayChange = () => {
    if (isBillPaid) {
      const change = returnChange(bill, providedAmount, coins).filter(
        (coin) => coin.amount !== 0
      );

      if (change.length === 0) {
        return <p>Change: 0</p>;
      }
      return (
        <>
          <p>Change:</p>
          {change.map((coin) => (
            <p>
              [x{coin.amount}] {formatMoney(coin.value)}
            </p>
          ))}
        </>
      );
    }
    return "";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }

  if (products.length === 0) {
    return <div>No products available!</div>;
  }

  return (
    <section className="vending-machine">
      <h1 className="name">
        <img src={Logo} alt="Logo" />
        The Vending Oasis
      </h1>
      <div className="products-grid">
        {products.map((product) => (
          <Product
            product={product}
            currency={currency}
            clickHandler={() => {
              if (product.quantity === 0 || isBillPaid) {
                return;
              }

              const updatedBasket = [...basket];
              const basketProductIdx = updatedBasket.findIndex(
                (p) => p.id === product.id
              );
              if (basketProductIdx === -1) {
                updatedBasket.push({ ...{ ...product, quantity: 1 } });
              } else {
                updatedBasket[basketProductIdx].quantity += 1;
              }
              setBasket(updatedBasket);

              const updatedProducts = [...products];
              updatedProducts[
                updatedProducts.findIndex((p) => p.id === product.id)
              ].quantity -= 1;
              setProducts(updatedProducts);
            }}
          />
        ))}
      </div>
      <div className="side-panel">
        <div className="providedAmount">{formatMoney(providedAmount)}</div>
        <div className="coins">
          {coins.map((coin) => (
            <img
              src={coin.img}
              alt={coin.alt}
              height={40}
              onClick={() => {
                if (!isBillPaid)
                  setProvidedAmount(round(sum(providedAmount, coin.value), 2));
              }}
            />
          ))}
        </div>
        <div className="log-display">
          <p>Bill: {formatMoney(bill)}</p>
          {basket.map((product) => (
            <p key={product.id}>
              [{product.quantity}x] {product.name} {formatMoney(product.price)}
            </p>
          ))}
          {displayChange()}
        </div>
        <button
          className="reset"
          onClick={() => {
            setBasket([]);
            setProvidedAmount(0);
            setProducts(JSON.parse(JSON.stringify(initialProducts)));
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

export default App;
