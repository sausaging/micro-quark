import { Reducers, STF } from "@stackr/sdk/machine";
import { QL, BetterMerkleTree as StateWrapper } from "./state";
import { ProofType } from "./actions";

// --------- Utilities ---------
const findIndexOfAccount = (state: StateWrapper, address: string) => {
  return state.leaves.findIndex((leaf) => leaf.address === address);
};

type CreateInput = {
  address: string;
};

type BaseActionInput = {
  type: ProofType;
  params: Record<string, any>;
  from: string;
};

const url = "http://127.0.0.1:8080/";

// --------- State Transition Handlers ---------
const create: STF<QL, CreateInput> = {
  handler: ({ inputs, state }) => {
    const { address } = inputs;
    if (state.leaves.find((leaf) => leaf.address === address)) {
      throw new Error("Account already exists");
    }
    state.leaves.push({
      address,
      is_valid: false,
    });
    return state;
  },
};

const submit: STF<QL, BaseActionInput> = {
  handler: ({ inputs, state }) => {
    const { type, params, from } = inputs;
    const fromIndex = findIndexOfAccount(state, from);
    if (fromIndex === -1) {
      throw new Error("Account does not exist");
    }
    const account = state.leaves[fromIndex];
    if (account.is_valid) {
      throw new Error("Account already submitted and verified");
    }
    switch (type) {
      case ProofType.SP1: {
        const { elf, proofPath } = params;
        const body = JSON.stringify({
          tx_id: account.address,
          elf_file_path: elf,
          proof_file_path: proofPath,
        })
        // submit the proof to the rust server and add a listener for the response
        // update the state directly without reducers
        break;
      }
      case ProofType.RISC0: {
        const { imageID, proofPath } = params;
        // verify the proof & update the state
        break;
      }
      case ProofType.MIDEN: {
        const { inputStack, outputStack, programHash, proofPath } = params;
        // verify the proof & update the state
        break;
      }
      default:
        throw new Error("Invalid proof type");
    }
    return state;
  },
};

export const reducers: Reducers<QL> = {
  create,
  submit
};
