import express, { Request, Response } from "express";

import { ActionEvents } from "@stackr/sdk";
import { Playground } from "@stackr/sdk/plugins";
import { schemas, ProofType } from "./actions.ts";
import { QLMachine, mru } from "./ql.ts";
import { reducers } from "./reducers.ts";

console.log("Starting server...");

const erc20Machine = mru.stateMachines.get<QLMachine>("erc-20");

const app = express();
app.use(express.json());

const playground = Playground.init(mru);

playground.addGetMethod(
  "/custom/hello",
  async (_req: Request, res: Response) => {
    res.send("Hello World");
  }
);

const { actions, chain, events } = mru;

app.get("/actions/:hash", async (req: Request, res: Response) => {
  const { hash } = req.params;
  const action = await actions.getByHash(hash);
  if (!action) {
    return res.status(404).send({ message: "Action not found" });
  }
  return res.send(action);
});

app.get("/blocks/:hash", async (req: Request, res: Response) => {
  const { hash } = req.params;
  const block = await chain.getBlockByHash(hash);
  if (!block) {
    return res.status(404).send({ message: "Block not found" });
  }
  return res.send(block.data);
});

const url = "http://127.0.0.1:8080/";

function sendProof(body: string, proofType: ProofType) {
  fetch(url + proofType, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

app.post("/submit-verify", async (req: Request, res: Response) => {
  const { msgSender, signature, payload } = req.body as {
    msgSender: string;
    signature: string;
    payload: any;
  };
  const reducerName = "updateVerify";
  const actionReducer = reducers[reducerName];

  if (!actionReducer) {
    res.status(400).send({ message: "no reducer for action" });
    return;
  }
  const action = reducerName as keyof typeof schemas;

  const schema = schemas[action];

  try {
    const newAction = schema.newAction({ msgSender, signature, payload });
    const ack = await mru.submitAction(reducerName, newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
  return;

});



app.post("/:reducerName", async (req: Request, res: Response) => {
  const { reducerName } = req.params;
  const actionReducer = reducers[reducerName];

  if (!actionReducer) {
    res.status(400).send({ message: "no reducer for action" });
    return;
  }
  const action = reducerName as keyof typeof schemas;

  const { msgSender, signature, payload } = req.body as {
    msgSender: string;
    signature: string;
    payload: any;
  };

  const schema = schemas[action];

  try {
    const newAction = schema.newAction({ msgSender, signature, payload });
    const ack = await mru.submitAction(reducerName, newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
  return;
});

app.post("risc0-verify", async (req: Request, res: Response) => {
  let state = erc20Machine?.state.unwrap();
  console.log("State", state);
  const { payload } = req.body as {
    payload: any;
  }
  const { address, elf, proofPath } = payload;
  const fromIndex = state?.findIndex((leaf) => leaf.address === address);
  if (fromIndex === -1) {
    throw new Error("Account does not exist");
  }
  const body = JSON.stringify({
    tx_id: address,
    elf_file_path: elf,
    proof_file_path: proofPath,
  })
  sendProof(body, ProofType.SP1);


})


app.post("miden-verify", async (req: Request, res: Response) => {
  let state = erc20Machine?.state.unwrap();
  console.log("State", state);
  const { payload } = req.body as {
    payload: any;
  }
  const { address, elf, proofPath, inputsStack, outputsStack, programHash } = payload;
  const fromIndex = state?.findIndex((leaf) => leaf.address === address);
  if (fromIndex === -1) {
    throw new Error("Account does not exist");
  }
  const body = JSON.stringify({
    tx_id: address,
    inputs_stack: elf,
    outputs_stack: outputsStack,
    program_hash: programHash,
    proof_file_path: proofPath,
  })
  sendProof(body, ProofType.MIDEN);


})


app.post("risc0-verify", async (req: Request, res: Response) => {
  let state = erc20Machine?.state.unwrap();
  console.log("State", state);
  const { payload } = req.body as {
    payload: any;
  }
  const { address, imageID, proofPath } = payload;
  const fromIndex = state?.findIndex((leaf) => leaf.address === address);
  if (fromIndex === -1) {
    throw new Error("Account does not exist");
  }
  const body = JSON.stringify({
    tx_id: address,
    image_id: imageID,
    proof_file_path: proofPath,
  })
  sendProof(body, ProofType.SP1);


})

events.subscribe(ActionEvents.SUBMIT, (args) => {
  console.log("Submitted an action", args);
});

events.subscribe(ActionEvents.EXECUTION_STATUS, async (action) => {
  console.log("Submitted an action", action);
});

app.get("/", (_req: Request, res: Response) => {
  return res.send({ state: erc20Machine?.state.unwrap() });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
