# Qwestive Voting Smart Contract Test Script

## Before you begin:

Install all dependencies:

```
npm install
```

## To run the script:

```
npm run 'SCRIPT_NAME'
```

Where SCRIPT_NAME corresponds to an element in package.json[scripts]. For example:

```
npm run example
```

Note: do not change or remove compile script.

## To add a new script:

1. Create a new file under src/:
> Example: src/initialize_vote.ts

2. Under package.json scripts, add the command to compile and run the file as so:

```
  "scripts": {
    "compile": "tsc -p ./tsconfig.json",
    ...
    "initialize_vote": "npm run compile && node build/initialize_vote.js"
  },
```

3. Run the script.