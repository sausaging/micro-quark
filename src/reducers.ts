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

type SP1Input = {
  address: string;
  elf: string;
  proofPath: string;
};

type Risc0Input = {
  address: string;
  imageID: string;
  proofPath: string;
};

type MidenInput = {
  address: string;
  inputStack: string;
  outputStack: string;
  programHash: string;
  proofPath: string;
};

type VerifyInput = {
  address: string;
  is_valid: boolean;
};


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

const updateVerify: STF<QL, VerifyInput> = {
  handler: ({ inputs, state }) => {
    const { address, is_valid } = inputs;
    if (state.leaves.find((leaf) => leaf.address === address) === undefined) {
      throw new Error("Account does not exist");
    }
    if (state.leaves.find((leaf) => leaf.is_valid === true)) {
      throw new Error("Account already verified");
    }
    let addressIndex = findIndexOfAccount(state, address);
    state.leaves[addressIndex].is_valid = is_valid;
    return state;
  },
};

export const reducers: Reducers<QL> = {
  create,
  updateVerify
};
