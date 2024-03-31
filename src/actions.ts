import { ActionSchema, SolidityType } from "@stackr/sdk";

export enum ProofType {
  SP1 = "sp1-verify",
  RISC0 = "risc0-verify",
  MIDEN = "miden-verify"
}

// function generateSchema(proofType: ProofType): ActionSchema {
//   const params: Record<string, SolidityType> = {
//     proofPath: SolidityType.STRING,
//   };

//   switch (proofType) {
//     case ProofType.SP1:
//       params.elf = SolidityType.STRING;
//       break;
//     case ProofType.RISC0:
//       params.imageID = SolidityType.STRING;
//       break;
//     default:
//       params.inputStack = SolidityType.STRING;
//       params.outputStack = SolidityType.STRING;
//       params.programHash = SolidityType.STRING;
//   }

//   return new ActionSchema(proofType, {
//     type: SolidityType.STRING,
//     params,
//     address: SolidityType.ADDRESS,
//   });
// }

export const createAccountSchema = new ActionSchema("createAccount", {
  address: SolidityType.ADDRESS,
});

export const schemas = {
  create: createAccountSchema,
  submitSP1: new ActionSchema(ProofType.SP1, {
    address: SolidityType.ADDRESS,
    elf: SolidityType.STRING,
    proofPath: SolidityType.STRING,
  }),
  submitRisc0: new ActionSchema(ProofType.RISC0, {
    address: SolidityType.ADDRESS,
    imageID: SolidityType.STRING,
    proofPath: SolidityType.STRING,
  }),
  submitMiden: new ActionSchema(ProofType.MIDEN, {
    address: SolidityType.ADDRESS,
    inputStack: SolidityType.STRING,
    outputStack: SolidityType.STRING,
    programHash: SolidityType.STRING,
    proofPath: SolidityType.STRING,
  }),
  updateVerify: new ActionSchema("update-verify", {
    address: SolidityType.ADDRESS,
    is_valid: SolidityType.BOOL,
  }),
};
