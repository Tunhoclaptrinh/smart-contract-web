import type { Actor } from "@scw/contracts";
export type { Role, ContractStatus } from "@scw/contracts";

export interface Organization {
  id: string;
  name: string;
}

export type User = Actor;
