import { ActionSchema, SolidityType } from "@stackr/sdk";

export enum ProofType {
  SP1 = "sp1-verify",
  RISC0 = "risc0-verify",
  MIDEN = "miden-verify"
}

function generateSchema(proofType: ProofType): ActionSchema {
  const params: Record<string, SolidityType> = {
    proofPath: SolidityType.STRING,
  };

  switch (proofType) {
    case ProofType.SP1:
      params.elf = SolidityType.STRING;
      break;
    case ProofType.RISC0:
      params.imageID = SolidityType.STRING;
      break;
    default:
      params.inputStack = SolidityType.STRING;
      params.outputStack = SolidityType.STRING;
      params.programHash = SolidityType.STRING;
  }

  return new ActionSchema(proofType, {
    type: SolidityType.STRING,
    params,
    address: SolidityType.ADDRESS,
  });
}

export const createAccountSchema = new ActionSchema("createAccount", {
  address: SolidityType.ADDRESS,
});

export const schemas = {
  create: createAccountSchema,
  submitSP1: generateSchema(ProofType.SP1),
  submitRisc0: generateSchema(ProofType.RISC0),
  submitMiden: generateSchema(ProofType.MIDEN)
};
