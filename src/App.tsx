import { useEffect, useState } from "react";
import "./App.css";
import Logo from "./assets/logo.svg";
import OneEuroCent from "./assets/1_euro_cent.svg";
import TwoEuroCent from "./assets/2_euro_cent.svg";
import FiveEuroCent from "./assets/5_euro_cent.svg";
import TenEuroCent from "./assets/10cent.svg";
import TwentyEuroCent from "./assets/20cent.svg";
import FiftyEuroCent from "./assets/50cent.svg";
import OneEuro from "./assets/1euro.svg";
import TwoEuro from "./assets/2euro.svg";
import VendingMachineDrawing from "./assets/vending-machine.svg";
import Gears from "./assets/gears.svg";
import { CoinType, ProductType } from "./types";
import Settings from "./components/Settings/Settings";
import VendingMachine from "./components/VendingMachine/VendingMachine";

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
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetch(dataSourceURL)
      .then((response) => response.json())
      .then((data: ProductType[]) => {
        setInitialProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }

  if (initialProducts.length === 0) {
    return <div>No products available!</div>;
  }

  return (
    <>
      <section className="vending-machine">
        <h1 className="name">
          <img src={Logo} alt="Logo" />
          The Vending Oasis
        </h1>
        {isEditMode ? (
          <Settings
            products={JSON.parse(JSON.stringify(initialProducts))}
            onSubmit={(products) => {
              setInitialProducts(products);
              setIsEditMode(false);
            }}
          />
        ) : (
          <VendingMachine
            coins={coins}
            initialProducts={JSON.parse(JSON.stringify(initialProducts))}
            currency={currency}
          />
        )}
      </section>
      <button
        className="mode"
        title="Change mode"
        onClick={() => setIsEditMode(!isEditMode)}
      >
        {isEditMode ? (
          <img src={VendingMachineDrawing} alt="Play" height={60} />
        ) : (
          <img src={Gears} alt="Settings" height={60} />
        )}
      </button>
    </>
  );
}

export default App;
