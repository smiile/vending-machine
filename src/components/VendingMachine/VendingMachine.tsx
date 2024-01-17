import { useMemo, useState } from "react";
import "./VendingMachine.css";
import Product from "../Product/Product";
import { CoinType, ProductType } from "../../types";
import { multiply, round, subtract, sum } from "mathjs";

export default function VendingMachine({
  initialProducts,
  currency,
  coins,
}: {
  initialProducts: ProductType[];
  currency: string;
  coins: CoinType[];
}) {
  const [products, setProducts] = useState<ProductType[]>(
    JSON.parse(JSON.stringify(initialProducts))
  );
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
  const isBillPaid = providedAmount >= bill && bill !== 0;

  const displayChange = () => {
    if (isBillPaid) {
      const change = returnChange(bill, providedAmount, coins).filter(
        (coin) => coin.amount !== 0
      );

      if (change.length === 0) {
        return (
          <div className="paid-bill-message">
            <p>Change: 0</p>
            <p>Thanks for your purchase!</p>
          </div>
        );
      }
      return (
        <div className="paid-bill-message">
          <p>Change:</p>
          {change.map((coin) => (
            <p>
              [{coin.amount}x] {formatMoney(coin.value)}
            </p>
          ))}
          <p>Thanks for your purchase!</p>
        </div>
      );
    }
    return "";
  };
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
  return (
    <>
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
                (p) => p["_id"] === product["_id"]
              );
              if (basketProductIdx === -1) {
                updatedBasket.push({ ...{ ...product, quantity: 1 } });
              } else {
                updatedBasket[basketProductIdx].quantity += 1;
              }
              setBasket(updatedBasket);

              const updatedProducts = [...products];
              updatedProducts[
                updatedProducts.findIndex((p) => p["_id"] === product["_id"])
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
          {displayChange()}
          <p>Bill: {formatMoney(bill)}</p>
          {basket.map((product) => (
            <p key={product["_id"]}>
              [{product.quantity}x] {product.name} {formatMoney(product.price)}
            </p>
          ))}
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
    </>
  );
}
