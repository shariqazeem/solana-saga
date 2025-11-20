# IDL Directory

This directory should contain the Anchor IDL (Interface Definition Language) file for the deployed smart contract.

## Setup Instructions

After building your Anchor program locally, copy the generated IDL file here:

```bash
# From the root of the project
cp prediction-markets-contracts/target/idl/prediction_markets.json frontend/lib/solana/idl/
```

The IDL file is required for the frontend to interact with the on-chain program.

## What is the IDL?

The IDL is automatically generated when you run `anchor build` and contains:
- Program structure and account definitions
- Instruction schemas
- Type definitions
- Error codes

It acts as the interface between your frontend TypeScript code and the on-chain Rust program.
