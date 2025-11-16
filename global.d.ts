import {Room} from "./app/types/game";

export {};

declare global {
  var rooms: Map<string, Room>;
}
