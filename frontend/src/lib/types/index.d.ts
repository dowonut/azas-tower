export type Direction = "up" | "down" | "left" | "right";

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
