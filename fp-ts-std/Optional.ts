import { Optional } from "monocle-ts";
import { compact, map, filter } from "fp-ts/Array";
import { flow } from "fp-ts/lib/function";
import { isSome, getOrElse, toUndefined, toNullable } from "fp-ts/Option";

type InnerPayload = {
  foo?: string;
  bar?: string;
};

type Payload = {
  i: string;
  v: InnerPayload;
};

const data = [
  {
    i: "identity1",
    v: {
      foo: "foo1",
    },
  },
  {
    i: "identity2",
    v: {
      foo: "foo2",
    },
  },
  {
    i: "identity3",
    v: {
      foo: "",
    },
  },
  {
    i: "identity3",
    v: {
      bar: "",
    },
  },
];

const getOptionVFoo = Optional.fromPath<Payload>()(["v", "foo"]).getOption;

// 1. Using Option to filter out array of objects has optional key.

const filterObjHasFoo = flow(getOptionVFoo, isSome);

const p1 = flow(filter(filterObjHasFoo));

console.log(p1(data));

// 2. Extract array of option's some object

const p2 = flow(map(getOptionVFoo), compact);

console.log(p2(data));

// 3. Extract a option's value

const p3 = flow(
  getOptionVFoo,
  // getOrElse(() => ""),  // Option 1: Get Some value and set the default value for None
  // toUndefined,          // Option 2: Get Some value and set None to undefined
  toNullable               // Option 3: Get Some value and set None to null
);

console.log(p3(data[0]));
console.log(p3(data[3]));
