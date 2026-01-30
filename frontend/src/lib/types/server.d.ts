export type User = {
  name: string;
  position: [number, number];
};

export type GameState = {
  users: Record<string, User>;
};
