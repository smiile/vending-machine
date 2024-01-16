import { ProductType } from "../types";
import "./Product.css";

export default function Product({
  product,
  currency,
  clickHandler,
}: {
  product: ProductType;
  currency: string;
  clickHandler: React.MouseEventHandler;
}) {
  return (
    <div className="product-item" onClick={clickHandler}>
      <p className="title">{product.name}</p>
      <p className="price">
        {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        {currency}
      </p>
      <p className="availability">[{product.quantity} left]</p>
    </div>
  );
}
