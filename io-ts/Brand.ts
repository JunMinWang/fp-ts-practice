import * as t from "io-ts";
import { PathReporter } from "io-ts/PathReporter";
import { withMessage, optionFromNullable } from "io-ts-types";

// *************************************************************************
// 1. Define a brand.
// *************************************************************************

interface NonEmptyString50Brand {
  readonly NonEmptyString50: unique symbol;
}

const NonEmptyString50 = t.brand(
  t.string,
  (s: string): s is t.Branded<string, NonEmptyString50Brand> =>
    s.length > 0 && s.length <= 50,
  "NonEmptyString50"
);

// type NonEmptyString50 = t.TypeOf<typeof NonEmptyString50>;

// console.log(PathReporter.report(NonEmptyString50.decode(42)));

// *************************************************************************
// 2. Use withMessage
// *************************************************************************

const FirstName = withMessage(
  NonEmptyString50,
  (input) => `First name value must be a string(length 1 ~ 50). Got ${input}`
);

const LastName = withMessage(
  NonEmptyString50,
  (input) => `Last name value must be a string(length 1 ~ 50). Got ${input}`
);

// console.log(PathReporter.report(FirstName.decode(42)));

// *************************************************************************
// 3. Usage of Email
// *************************************************************************

interface EmailAddressBrand {
  readonly EmailAddress: unique symbol;
}

const emailPattern =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;

const EmailAddress = withMessage(
  t.brand(
    t.string,
    (s: string): s is t.Branded<string, EmailAddressBrand> =>
      emailPattern.test(s),
    "EmailAddress"
  ),
  (input) => `Email Address value must be a valid email address, got: ${input}.`
);

type EmailAddress = t.TypeOf<typeof EmailAddress>;

// console.log(PathReporter.report(EmailAddress.decode("Helloworld")));

// *************************************************************************
// 4. Usage of optionFromNullable
// *************************************************************************
interface ChardBrand {
  readonly Char: unique symbol;
}

const Char = t.brand(
  t.string,
  (s: string): s is t.Branded<string, ChardBrand> => s.length === 1,
  "Char"
);

type Char = t.TypeOf<typeof Char>;

const MiddleNameInitial = withMessage(
  optionFromNullable(Char),
  (i) => `Middle name initial value must be a single character, got: ${i}.`
);

// console.log(PathReporter.report(MiddleNameInitial.decode("H")));

// *************************************************************************
// 5. Usage of remaining readings
// *************************************************************************

interface PositiveIntBrand {
  readonly PositiveInt: unique symbol;
}

const PositiveInt = t.brand(
  t.Int,
  (n: t.Int): n is t.Branded<t.Int, PositiveIntBrand> => n >= 0,
  "PositiveInt"
);

type PositiveInt = t.TypeOf<typeof PositiveInt>;

const RemainingReadings = withMessage(
  PositiveInt,
  (i) => `Remaining readings value must be a positive integer, got: ${i}`
);

// console.log(PathReporter.report(RemainingReadings.decode(7)));

// *************************************************************************
// 6. Verified date
// *************************************************************************

interface TimestampBrand {
  readonly Timestamp: unique symbol;
}

const Timestamp = t.brand(
  t.Int,
  (t: t.Int): t is t.Branded<t.Int, TimestampBrand> =>
    t >= -8640000000000000 && t <= 8640000000000000,
  "Timestamp"
);

type Timestamp = t.TypeOf<typeof Timestamp>;

const VerifiedDate = withMessage(
  Timestamp,
  (i) =>
    `Timestamp value must be a valid timestamp (integer between -8640000000000000 and 8640000000000000), got: ${i}`
);

console.log(PathReporter.report(VerifiedDate.decode(-8640000000000001)));

// *************************************************************************
// 7. Object with optional properties
// *************************************************************************

const UserLike = t.intersection([
  t.type({
    firstName: t.unknown,
    lastName: t.unknown,
    emailAddress: t.unknown,
  }),
  t.partial({
    middleNameInitial: t.unknown,
    verifiedDate: t.unknown,
    remainingReadings: t.unknown,
  }),
]);

type UserLike = t.TypeOf<typeof UserLike>;

// Use strict() to make sure any extra property of the input is discarded from a UserLikePartiallyValid data object.
const UserLikePartiallyValid = t.strict({
  firstName: FirstName,
  lastName: LastName,
  emailAddress: EmailAddress,
  middleNameInitial: MiddleNameInitial,
});

type UserLikePartiallyValid = t.TypeOf<typeof UserLikePartiallyValid>;

const UntaggedUnverifiedUser = t.intersection(
  [
    UserLikePartiallyValid,
    t.strict({
      remainingReadings: RemainingReadings,
    }),
  ],
  "UntaggedUnverifiedUser"
);

type UntaggedUnverifiedUser = t.TypeOf<typeof UntaggedUnverifiedUser>;
type UnverifiedUser = UntaggedUnverifiedUser & {
  readonly type: "UnverifiedUser";
};

const UntaggedVerifiedUser = t.intersection(
  [
    UserLikePartiallyValid,
    t.strict({
      verifiedDate: VerifiedDate,
    }),
  ],
  "UntaggedVerifiedUser"
);

type UntaggedVerifiedUser = t.TypeOf<typeof UntaggedUnverifiedUser>;
type VerifiedUser = UntaggedUnverifiedUser & { readonly type: "VerifiedUser" };

type User = VerifiedUser | UnverifiedUser;

const unverifiedUser = (fields: UntaggedUnverifiedUser): User => ({
  ...fields,
  type: "UnverifiedUser",
});
const verifiedUser = (fields: UntaggedVerifiedUser): User => ({
  ...fields,
  type: "VerifiedUser",
});
