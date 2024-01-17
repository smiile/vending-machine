import { ProductType } from "../../types";
import "./Settings.css";
import { useFieldArray, useForm } from "react-hook-form";
export default function Settings({
  products,
  onSubmit,
}: {
  products: ProductType[];
  onSubmit: (products: ProductType[]) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ products: ProductType[] }>({
    defaultValues: {
      products: products,
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "products",
    control,
    rules: {
      required: "At least one item must exist",
    },
  });

  return (
    <section className="product-settings">
      <h1>Settings</h1>
      <form onSubmit={handleSubmit((data) => onSubmit(data.products))}>
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="form-group">
              <label className="form-control">
                <span>Name</span>
                <input
                  {...register(`products.${index}.name`, {
                    required: true,
                    pattern: /^(?!\s*$).+/,
                  })}
                />
                {errors.products && errors.products[index]?.name ? (
                  <span className="error">Name is required</span>
                ) : (
                  ""
                )}
              </label>
              <label className="form-control">
                <span>Quantity</span>
                <input
                  type="number"
                  {...register(`products.${index}.quantity`, {
                    required: true,
                    min: 1,
                    max: 15,
                    valueAsNumber: true,
                  })}
                />
                {errors.products && errors.products[index]?.quantity ? (
                  <span className="error">Enter a number between 1 and 15</span>
                ) : (
                  ""
                )}
              </label>
              <label className="form-control">
                <span>Price</span>
                <input
                  type="number"
                  step={0.01}
                  {...register(`products.${index}.price`, {
                    required: true,
                    min: 0.01,
                    validate: {
                      unique: (value, formValues) => {
                        for (const formValue of formValues.products) {
                          if (
                            formValue["_id"] !== field["_id"] &&
                            formValue.price === value
                          ) {
                            return false;
                          }
                        }
                        return true;
                      },
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.products && errors.products[index]?.price ? (
                  <span className="error">
                    Enter a unique price equal or larger than 0.01
                  </span>
                ) : (
                  ""
                )}
              </label>
              <button onClick={() => remove(index)}>Delete</button>
            </div>
          );
        })}
        <button
          onClick={() => {
            append({
              _id: String(parseInt(fields[fields.length - 1]?._id) + 1),
              name: "",
              quantity: 0,
              price: 0,
            });
          }}
        >
          Append
        </button>
        <input type="submit" value="Save" />
        <p>{errors.products?.root?.message}</p>
      </form>
    </section>
  );
}
