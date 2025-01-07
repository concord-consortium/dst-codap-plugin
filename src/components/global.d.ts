declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.svg";
declare module "*.scss";
declare module "*.csv";

type Maybe<T> = T | undefined;
