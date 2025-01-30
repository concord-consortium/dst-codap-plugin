declare module "*.json5";
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.svg";
declare module "*.scss";
declare module "*.csv";

// used by libraries like React and MST to control runtime behavior
declare namespace process {
  const env: {
    NODE_ENV: string; // e.g. "development" or "production"
    [index: string]: string;
  }
}

type Maybe<T> = T | undefined;
