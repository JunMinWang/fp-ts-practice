import { pipe } from "fp-ts/function";
import { Either, left, right, map, chain, match } from "fp-ts/Either";
import { double } from "../utils";

// Below is origin approach

export const imperative = (xs: ReadonlyArray<number>) => {
  const head = (xs: ReadonlyArray<number>) => {
    if (xs.length === 0) {
      throw new Error("Empty array!");
    }
    return xs[0];
  };

  const inverse = (n: number) => {
    if (n === 0) {
      throw new Error("Can't divide by zero");
    }
    return 1 / n;
  };

  try {
    return `Result is ${inverse(double(head(xs)))}`;
  } catch (err: any) {
    return `Error is ${err.message}`;
  }
};

// Below is fp approach

export const imperativeFP = (xs: ReadonlyArray<number>): string => {
  // Either<type of left, type of right>
  const head = <T>(xs: ReadonlyArray<T>): Either<string, T> =>
    xs.length === 0 ? left("Empty array") : right(xs[0]);

  const inverse = (n: number): Either<string, number> =>
    n === 0 ? left("Can't divide by zero.") : right(1 / n);

  return pipe(
    xs,
    head,
    map(double),
    chain(inverse),
    match(
      (err) => `Error is ${err}`, // onLeft handler
      (r) => `Result is ${r}` // onRight handler
    )
  );
};

console.log(imperativeFP([1, 2, 3])); // Result is 0.5
console.log(imperativeFP([])); // Error is Empty array
