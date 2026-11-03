// Shape returned by dashboard Server Actions to their forms (useActionState).
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Changes on every success so forms can reset themselves with a `key`. */
  nonce?: number;
};

export const idleState: ActionState = { status: "idle" };
