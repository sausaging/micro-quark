import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../genesis-state.json";
import { reducers } from "./reducers";
import { QL } from "./state";

const STATE_MACHINES = {
  QL: "ql",
};

const qlStateMachine = new StateMachine({
  id: STATE_MACHINES.QL,
  state: new QL(genesisState.state),
  on: reducers,
});

export { STATE_MACHINES, qlStateMachine };
