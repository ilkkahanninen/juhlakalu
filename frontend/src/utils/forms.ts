import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/function";
import { eqStrict } from "fp-ts/lib/Eq";
import { Lens } from "monocle-ts";
import { symFold, symMap } from "./either";
import { keys } from "./objects";

export type FieldValue<T> = {
  value: T;
  errors: FieldError[];
  touched: boolean;
};
export type FieldString = FieldValue<string>;
export type FieldNullableString = FieldValue<string | null>;
export type FieldError = string;

export type ValidatedFieldValue<T> = E.Either<FieldValue<T>, FieldValue<T>>;
export type ValidatedForm<S> = E.Either<S, S>;

export type ValidationGuard = (field: FieldValue<any>) => boolean;

export type FieldValidation<T> = (
  guard: ValidationGuard
) => (value: FieldValue<T>) => ValidatedFieldValue<T>;

export type FieldCompareValidation<A, B> = (
  guard: ValidationGuard
) => (value: FieldValue<A>, coValue: FieldValue<B>) => ValidatedFieldValue<A>;

export type PartialFormValidation<S> = {
  validate: (guard: ValidationGuard) => (form: S) => ValidatedForm<S>;
  lenses: Array<Lens<S, FieldValue<any>>>;
};

export type FormValidation<S> = (
  guard: ValidationGuard
) => (form: S) => ValidatedForm<S>;

export type AsForm<T extends object> = {
  [key in keyof T]: {
    value: T[key];
    errors: FieldError[];
    touched: boolean;
  };
};

export const fieldValueL = <T>() => Lens.fromProp<FieldValue<T>>()("value");
export const fieldErrorsL = Lens.fromProp<FieldValue<any>>()("errors");
export const fieldTouchedL = Lens.fromProp<FieldValue<any>>()("touched");

export const validateAll: ValidationGuard = () => true;
export const validateTouched: ValidationGuard = (field) => field.touched;

export const formatter =
  <A>(format: (a: A) => A): FieldValidation<A> =>
  (_guard) =>
    flow(fieldValueL<A>().modify(format), E.right);

export const validator =
  <A>(
    validate: (a: A) => boolean,
    onError: (a: A) => FieldError
  ): FieldValidation<A> =>
  (guard) =>
  (input) =>
    guard(input)
      ? validate(input.value)
        ? E.right(input)
        : E.left(fieldErrorsL.modify(A.append(onError(input.value)))(input))
      : E.right(input);

export const compareValidator =
  <A, B>(
    validate: (a: A, b: B) => boolean,
    onError: (a: A, b: B) => FieldError
  ): FieldCompareValidation<A, B> =>
  (guard) =>
  (a, b) =>
    guard(a)
      ? validate(a.value, b.value)
        ? E.right(a)
        : E.left(fieldErrorsL.modify(A.append(onError(a.value, b.value)))(a))
      : E.right(a);

export const field = <S, A>(
  lens: Lens<S, FieldValue<A>>,
  validate: FieldValidation<A>
): PartialFormValidation<S> => ({
  validate: (guard) => (input) =>
    pipe(
      input,
      lens.get,
      validate(guard),
      symMap((value) => lens.set(value)(input))
    ),
  lenses: [lens],
});

export const fieldCompare = <S, A, B>(
  lens: Lens<S, FieldValue<A>>,
  coLens: Lens<S, FieldValue<B>>,
  validate: FieldCompareValidation<A, B>
): PartialFormValidation<S> => ({
  validate: (guard) => (input) =>
    pipe(
      validate(guard)(lens.get(input), coLens.get(input)),
      symMap((value) => lens.set(value)(input))
    ),
  lenses: [lens],
});

export const combine =
  <T>(...validations: Array<FieldValidation<T>>): FieldValidation<T> =>
  (guard) =>
  (input) =>
    pipe(
      validations,
      A.reduce(E.right(input) as ValidatedFieldValue<T>, (acc, validate) =>
        pipe(
          acc,
          E.fold(flow(validate(guard), symFold(E.left)), validate(guard))
        )
      )
    );

export const formValidator = <S>(
  ...validations: Array<PartialFormValidation<S>>
): FormValidation<S> => {
  const lenses = pipe(
    validations,
    A.chain((v) => v.lenses),
    A.uniq<Lens<S, any>>(eqStrict)
  );

  const validate = (guard: ValidationGuard) => (input: S) =>
    pipe(
      validations,
      A.reduce(E.right(input) as ValidatedForm<S>, (acc, v) =>
        pipe(
          acc,
          E.fold(flow(v.validate(guard), symFold(E.left)), v.validate(guard))
        )
      )
    );

  return (guard) => flow(resetErrors(lenses), validate(guard));
};

const resetErrors =
  <S>(lenses: Array<Lens<S, any>>) =>
  (input: S): S =>
    pipe(
      lenses,
      A.reduce(input, (acc, lens) => lens.modify(fieldErrorsL.set([]))(acc))
    );

export const fromDataObject = <T extends object>(data: T): AsForm<T> =>
  pipe(
    data,
    keys,
    A.map((key) => [key, { value: data[key], errors: [], touched: false }]),
    Object.fromEntries
  );

export const toDataObject = <T extends object>(form: AsForm<T>): T =>
  pipe(
    form,
    keys,
    A.map((key) => [key, form[key].value]),
    Object.fromEntries
  );
