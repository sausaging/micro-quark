import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../stackr.config.ts";

import { createAccountSchema, schemas } from "./actions.ts";
import { qlStateMachine } from "./machines.stackr.ts";

type QLMachine = typeof qlStateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  actions: [createAccountSchema, ...Object.values(schemas)],
});

mru.stateMachines.add(qlStateMachine);

await mru.init();

export { QLMachine, mru };
