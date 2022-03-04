import { QwestiveVoting } from "../target/types/qwestive_voting";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import assert from "assert";
import * as bs58 from "bs58";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import * as splToken from "@solana/spl-token";
import * as serumCmn from "@project-serum/common";


describe("qwestive-voting", () => {
  // Configure the client to use the local cluster.
  // const provider = anchor.Provider.env();
  // anchor.setProvider(provider);
  // Read the generated IDL.
  const idl = JSON.parse(
    require("fs").readFileSync("./idl/qwestive_voting.json", "utf8")
  );

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey("6bQUnk1ZFgdaj5tEBTkijkztPnB1Kcg5raYf3CqBqio");

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  //const program = anchor.workspace.QwestiveVoting as Program<QwestiveVoting>;

  // The mint token and the voteTokenAccount
  let mintA: Token = null;
  let mintB: Token = null;

  let voter1TokenAAccount;//: PublicKey = null;
  let voter1TokenBAccount;//: PublicKey = null;
  let voter2TokenAAccount;//: PublicKey = null;
  let voter2TokenBAccount;//: PublicKey = null;
  let voter3TokenAAccount;//: PublicKey = null;
  let voter4TokenAAccount;//: PublicKey = null;
  
  // Mint Authority
  const mintAuthority = anchor.web3.Keypair.generate();
  const mintBAuthority = anchor.web3.Keypair.generate();

  // Token amount to mint
  const voter1TokenAAmountOwned = 500;
  const voter1TokenBAmountOwned = 100;
  const voter2TokenAAmountOwned = 250;
  const voter2TokenBAmountOwned = 200;
  const voter3TokenAAmountOwned = 1;
  const voter4TokenAAmountOwned = 2;

  // The token account
  const tokenWallet = anchor.web3.Keypair.generate();
  // Second token wallet holder
  const secondTokenWallet = anchor.web3.Keypair.generate();
  // Third token wallet holder
  const thirdTokenWallet = anchor.web3.Keypair.generate();

  // The Account to create.
  const communityVoteAccount = anchor.web3.Keypair.generate();
  const communityBVoteAccount = anchor.web3.Keypair.generate();

  const UNIX_MS_FACTOR = 1000;
  const DAY_IN_UNIX = 24 * 60 * 60;
  const HOURS_IN_UNIX = 60 * 60;
  const MINUTES_IN_UNIX = 60;
  const SECONDS_IN_UNIX = 1;

  it("Initialize token account", async () => {
    // Airdropping tokens to a payer.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(tokenWallet.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    // Airdropping tokens to a payer.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(secondTokenWallet.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(thirdTokenWallet.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    mintA = await Token.createMint(
      provider.connection,
      tokenWallet,
      mintAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    mintB = await Token.createMint(
      provider.connection,
      secondTokenWallet,
      mintBAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    const voter3TokenAccountInfo = await mintA.getOrCreateAssociatedAccountInfo(secondTokenWallet.publicKey);

    anchor.web3.TransactionInstruction
    const instructions: anchor.web3.TransactionInstruction[] = [];  

    // Create the associated token accounts
    // Primary Provider Token Accounts
    await mintA.getOrCreateAssociatedAccountInfo(provider.wallet.publicKey); //mintA.createAccount(provider.wallet.publicKey);
    voter1TokenAAccount = await findAssociatedTokenAddress(provider.wallet.publicKey, mintA.publicKey);
    await mintB.getOrCreateAssociatedAccountInfo(provider.wallet.publicKey); //mintB.createAccount(provider.wallet.publicKey);
    voter1TokenBAccount = await findAssociatedTokenAddress(provider.wallet.publicKey, mintB.publicKey);

    // First Token Wallet Holder Token Accounts
    await mintA.getOrCreateAssociatedAccountInfo(tokenWallet.publicKey); //await mintA.createAccount(tokenWallet.publicKey);
    voter2TokenAAccount = await findAssociatedTokenAddress(tokenWallet.publicKey, mintA.publicKey);
    await mintB.getOrCreateAssociatedAccountInfo(tokenWallet.publicKey); //await mintB.createAccount(tokenWallet.publicKey);
    voter2TokenBAccount = await findAssociatedTokenAddress(tokenWallet.publicKey, mintB.publicKey);
    
    // Second Token Wallet Holder Token Acccount
    await mintA.getOrCreateAssociatedAccountInfo(secondTokenWallet.publicKey);// mintA.createAccount(secondTokenWallet.publicKey);
    voter3TokenAAccount = await findAssociatedTokenAddress(secondTokenWallet.publicKey, mintA.publicKey);

    // Third Token Wallet Holder Token Acccount
    await mintA.getOrCreateAssociatedAccountInfo(thirdTokenWallet.publicKey);//await mintA.createAccount(thirdTokenWallet.publicKey);
    voter4TokenAAccount = await findAssociatedTokenAddress(thirdTokenWallet.publicKey, mintA.publicKey);

    await mintA.mintTo(
      voter1TokenAAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      voter1TokenAAmountOwned
    );

    await mintA.mintTo(
      voter2TokenAAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      voter2TokenAAmountOwned
    );

    await mintA.mintTo(
      voter3TokenAAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      voter3TokenAAmountOwned
    );
    
    // await mintA.mintTo(
    //   associatedVoter3TokenAccount,
    //   mintAuthority.publicKey,
    //   [mintAuthority],
    //   voter3TokenAAmountOwned
    // );

    await mintA.mintTo(
      voter4TokenAAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      voter4TokenAAmountOwned
    );

    await mintB.mintTo(
      voter1TokenBAccount,
      mintBAuthority.publicKey,
      [mintBAuthority],
      voter1TokenBAmountOwned
    );

    await mintB.mintTo(
      voter2TokenBAccount,
      mintBAuthority.publicKey,
      [mintBAuthority],
      voter2TokenBAmountOwned
    );

    let _voter1TokenAAccount = await mintA.getAccountInfo(
      voter1TokenAAccount
    );

    let _voter1TokenBAccount = await mintB.getAccountInfo(
      voter1TokenBAccount
    );

    let _voter2TokenAAccount = await mintA.getAccountInfo(
      voter2TokenAAccount
    );

    let _voter2TokenBAccount= await mintB.getAccountInfo(
      voter2TokenBAccount
    );

    let _voter3TokenAAccount= await mintA.getAccountInfo(
      voter3TokenAAccount
    );

    let _voter4TokenAAccount= await mintA.getAccountInfo(
      voter4TokenAAccount
    );

     assert.ok(_voter1TokenAAccount.amount.toNumber() == voter1TokenAAmountOwned);
     assert.ok(_voter1TokenBAccount.amount.toNumber() == voter1TokenBAmountOwned);
     assert.ok(_voter2TokenAAccount.amount.toNumber() == voter2TokenAAmountOwned);
     assert.ok(_voter2TokenBAccount.amount.toNumber() == voter2TokenBAmountOwned);
     assert.ok(_voter3TokenAAccount.amount.toNumber() == voter3TokenAAmountOwned);
     assert.ok(_voter4TokenAAccount.amount.toNumber() == voter4TokenAAmountOwned);
  });

  async function findAssociatedTokenAddress(
    walletAddress: anchor.web3.PublicKey,
    tokenMintAddress: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
  }

  const getNumberBuffer = (total: number, alloc = 8) => {
    const totalProposalAccountBuf = Buffer.alloc(alloc);
    totalProposalAccountBuf.writeUIntLE(total, 0, 6);
    return totalProposalAccountBuf;
  };

  const newUser = anchor.web3.Keypair.generate();
  before(async () => {
    const signature = await program.provider.connection.requestAirdrop(
      newUser.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(signature);
  });

  it("Initialize Community Voting", async () => {

    const [communityAccountPublicKey, communityAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
        anchor.workspace.QwestiveVoting.programId
      );

    // Add your test here.
    const tx = await program.rpc.initializeVoting(
      communityAccountBump, 
      false,                // Flag to indicate if this is an NFT Community
      "",                   // Empty string for non NFT community
      new anchor.BN(0),     // Minimum token needed to be in community
    {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        tokenAccount: voter1TokenAAccount,
        //mint: mintA.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      //signers: [communityVoteAccount],
    });

    const communityA = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    const [communityBAccountPublicKey, communityBAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintB.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const tx2 = await program.rpc.initializeVoting(
      communityBAccountBump, 
      false,                      // Flag to indicate if this is an NFT Community
      "",                         // Empty string for non NFT community
      new anchor.BN(1),           // Minimum token needed to be in community
    {
      accounts: {
        communityVoteAccount: communityBAccountPublicKey,
        tokenAccount: voter1TokenBAccount,
        //mint: mintB.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      //signers: [communityBVoteAccount],
    });

    const communityB = await program.account.communityVoteAccount.fetch(
      communityBAccountPublicKey
    );

    assert.equal(communityA.totalProposalCount, 0);
    assert.equal(communityA.minimumTokenCount, 0);
    assert.equal(communityA.mint.toBase58(), mintA.publicKey.toBase58());

    assert.equal(communityB.totalProposalCount, 0);
    assert.equal(communityB.minimumTokenCount, 1);
    assert.equal(communityB.mint.toBase58(), mintB.publicKey.toBase58());
  });

  it("Can add a proposal!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    let account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    console.log("Your account", account);
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
    const [proposalAccountPublicKey, accountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.addProposal(
      communityAccountBump,
      accountBump,
      account.totalProposalCount,
      "Test Title",
      "Test Description",
      new anchor.BN(0), // minimum_token_count
      new anchor.BN(1), // voting system - one vote per token account
      new anchor.BN(1), // threshold - needs at least 1 vote 
      new anchor.BN(0), // voting_type - 0 - yes or not, 1 - multiple choice is not currently supported
      new anchor.BN(0), // 0 candidates when not using voting type 1
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 1 * DAY_IN_UNIX), //voting_end_timestamp
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 2 * DAY_IN_UNIX), //finalize_vote_end_timestamp
      {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: proposalAccountPublicKey,
          tokenAccount: voter1TokenAAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  });

  it("Can add a second proposal!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    let account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    const secondProposalId = getNumberBuffer(
      account.totalProposalCount.toNumber()
    );
    const [secondProposalAccountPublicKey, secondAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), secondProposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    console.log("SECOND:", secondProposalAccountPublicKey, secondAccountBump);

    await program.rpc.addProposal(
      communityAccountBump,
      secondAccountBump,
      account.totalProposalCount,
      "Second Test Title",
      "Second Test Description",
      new anchor.BN(0), // minimum_token_count
      new anchor.BN(1), // voting system - one vote per token account
      new anchor.BN(2), // threshold - needs at least 1 vote 
      new anchor.BN(0), // voting_type - 0 - yes or not, 1 - multiple choice is not currently supported
      new anchor.BN(0), // 0 candidates when not using voting type 1
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 1 * DAY_IN_UNIX), //voting_end_timestamp
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 2 * DAY_IN_UNIX), //finalize_vote_end_timestamp
      {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: secondProposalAccountPublicKey,
          tokenAccount: voter1TokenAAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    account = await program.account.communityVoteAccount.fetch(communityAccountPublicKey);

    const proposals = await program.account.proposal.all();
    assert.ok(proposals.length === account.totalProposalCount.toNumber());
  });

  it("Can NOT add a proposal with wrong token account!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    let account = await program.account.communityVoteAccount.fetch(communityAccountPublicKey);

    const thirdProposalId = getNumberBuffer(
      account.totalProposalCount.toNumber()
    );
    const [thirdProposalAccountPublicKey, thirdAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), thirdProposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    console.log("THIRD:", thirdProposalAccountPublicKey, thirdAccountBump);
    await assert.rejects(
      async () => {

      await program.rpc.addProposal(
        communityAccountBump,
        thirdAccountBump,
        account.totalProposalCount,
        "Third Test Title",
        "Third Test Description",
        new anchor.BN(0), // minimum_token_count
        new anchor.BN(1), // voting system - one vote per token account
        new anchor.BN(1), // threshold - needs at least 1 vote 
        new anchor.BN(0), // voting_type - 0 - yes or not, 1 - multiple choice is not currently supported
        new anchor.BN(0), // 0 candidates when not using voting type 1
        new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 1 * DAY_IN_UNIX), //voting_end_timestamp
        new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 2 * DAY_IN_UNIX), //finalize_vote_end_timestamp
        {
          accounts: {
            communityVoteAccount: communityAccountPublicKey,
            proposal: thirdProposalAccountPublicKey,
            tokenAccount: voter1TokenBAccount,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const proposals = await program.account.proposal.all();
    assert.ok(proposals.length === 2);
  });

  it("Can add a new proposal with a different token account!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintB.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    let account = await program.account.communityVoteAccount.fetch(communityAccountPublicKey);

    console.log("Your Token B account", account);

    // Assign a new number with the next proposal id available
    const tokenBProposalId = getNumberBuffer(2);

    const [tokenBProposalAccountPublicKey, tokenBAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), tokenBProposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    console.log("Token B FIRST:", tokenBProposalAccountPublicKey, tokenBAccountBump);

    await program.rpc.addProposal(
      communityAccountBump,
      tokenBAccountBump,
      new anchor.BN(2),
      "Token B Test Title",
      "Token B Test Description",
      new anchor.BN(0), // minimum_token_count
      new anchor.BN(1), // voting system - one vote per token account
      new anchor.BN(1), // threshold - needs at least 1 vote 
      new anchor.BN(0), // voting_type - 0 - yes or not, 1 - multiple choice is not currently supported
      new anchor.BN(0), // 0 candidates when not using voting type 1
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 1 * DAY_IN_UNIX), //voting_end_timestamp
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + 2 * DAY_IN_UNIX), //finalize_vote_end_timestamp
      {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: tokenBProposalAccountPublicKey,
          tokenAccount: voter1TokenBAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    account = await program.account.communityVoteAccount.fetch(communityAccountPublicKey);

    const proposals = await program.account.proposal.all();

    const communityAPDA = await program.account.communityVoteAccount.all([
      {
          memcmp: {
           offset: 9, // Discriminator + isNFT
           bytes: bs58.encode(
              mintA.publicKey.toBuffer()
           ),
          },
      },
    ]);

    let token_a_account = communityAPDA[0].account;

    // assert.ok(proposals.length === token_a_account.totalProposalCount.toNumber() + account.totalProposalCount.toNumber());
    assert.ok(account.totalProposalCount.toNumber() == 1);
  });

  it("Can vote for a proposal!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const proposalId = getNumberBuffer(0);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.voteForProposal(
      communityAccountBump,
      voteBump,                   // vote bump account
      new anchor.BN(0),           // proposal id
      true,                       // vote_bool  true - yes and false - no
      new anchor.BN(0),           // candidate = 0 to implies multiple choice is not selected
      {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: proposalAccountPublicKey,
          vote: voteAccountPublicKey,
          tokenAccount: voter1TokenAAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
    });

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 1);

    let account = await program.account.communityVoteAccount.fetch(communityAccountPublicKey);
    assert.ok(account.totalProposalCount.toNumber() === 2);
  });

  it("Can vote for a second proposal!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const proposalId = getNumberBuffer(1);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );
    await program.rpc.voteForProposal(
      communityAccountBump,
      voteBump,                           // vote bump account
      new anchor.BN(1),                   // proposal id
      false,                              // vote_bool  true - yes and false - no
      new anchor.BN(0), {                 // candidate = 0 to implies multiple choice is not selected
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        vote: voteAccountPublicKey,
        tokenAccount: voter1TokenAAccount,
        systemProgram: SystemProgram.programId,
      },
    });
    const vote = await program.account.vote.all();
    assert.equal(vote.length, 2);
  });

  it("Can not vote for a same proposal twice!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    await assert.rejects(
      async () => {
        const proposalId = getNumberBuffer(0);
        const [proposalAccountPublicKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("proposal_account"), proposalId],
            anchor.workspace.QwestiveVoting.programId
          );

        const [voteAccountPublicKey, voteBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("vote_account"),
              proposalId,
              provider.wallet.publicKey.toBuffer(),
            ],
            anchor.workspace.QwestiveVoting.programId
          );
        await program.rpc.voteForProposal(
          communityAccountBump,
          voteBump, 
          new anchor.BN(0), 
          true, 
          new anchor.BN(0), {
          accounts: {
            communityVoteAccount: communityAccountPublicKey,
            proposal: proposalAccountPublicKey,
            user: provider.wallet.publicKey,
            vote: voteAccountPublicKey,
            tokenAccount: voter1TokenAAccount,
            systemProgram: SystemProgram.programId,
          },
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );
    const vote = await program.account.vote.all();
    assert.equal(vote.length, 2);
  });

  it("Can not vote if insufficient token count!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    await assert.rejects(
      async () => {
        const proposalId = getNumberBuffer(1);
        const [proposalAccountPublicKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("proposal_account"), proposalId],
            anchor.workspace.QwestiveVoting.programId
          );

        const [voteAccountPublicKey, voteBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("vote_account"),
              proposalId,
              secondTokenWallet.publicKey.toBuffer(),
            ],
            anchor.workspace.QwestiveVoting.programId
          );
        await program.rpc.voteForProposal(
          communityAccountBump,
          voteBump, 
          new anchor.BN(1), 
          true, 
          new anchor.BN(0), {
          accounts: {
            communityVoteAccount: communityAccountPublicKey,
            proposal: proposalAccountPublicKey,
            user: secondTokenWallet.publicKey,
            vote: voteAccountPublicKey,
            tokenAccount: voter3TokenAAccount,
            systemProgram: SystemProgram.programId,
          },
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );
    const vote = await program.account.vote.all();
    assert.equal(vote.length, 2);
  });


  it("Can not vote for a proposal with the wrong token account!", async () => {
    await assert.rejects(
      async () => {
        const [communityBAccountPublicKey, communityBAccountBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from("community_account"), mintB.publicKey.toBuffer()],
          anchor.workspace.QwestiveVoting.programId
        );

        const proposalId = getNumberBuffer(2);
        const [proposalAccountPublicKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("proposal_account"), proposalId],
            anchor.workspace.QwestiveVoting.programId
          );

        const [voteAccountPublicKey, voteBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("vote_account"),
              proposalId,
              provider.wallet.publicKey.toBuffer(),
            ],
            anchor.workspace.QwestiveVoting.programId
          );
        await program.rpc.voteForProposal(
          communityBAccountBump,
          voteBump, 
          new anchor.BN(2), 
          true, 
          new anchor.BN(0), {
          accounts: {
            communityVoteAccount: communityBAccountPublicKey,
            proposal: proposalAccountPublicKey,
            user: provider.wallet.publicKey,
            vote: voteAccountPublicKey,
            tokenAccount: voter1TokenAAccount,
            systemProgram: SystemProgram.programId,
          },
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );
    const vote = await program.account.vote.all();
    assert.equal(vote.length, 2);
  });

  it("Can not vote for a proposal that does not exist!", async () => {
    await assert.rejects(
      async () => {
        const [communityAccountPublicKey, communityAccountBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
          anchor.workspace.QwestiveVoting.programId
        );

        const proposalId = getNumberBuffer(999999009);
        const [proposalAccountPublicKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("proposal_account"), proposalId],
            anchor.workspace.QwestiveVoting.programId
          );

        const [voteAccountPublicKey, voteBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("vote_account"),
              proposalId,
              provider.wallet.publicKey.toBuffer(),
            ],
            anchor.workspace.QwestiveVoting.programId
          );
        console.log(voteAccountPublicKey.toString(), voteBump);
        await program.rpc.voteForProposal(
          communityAccountBump,
          voteBump,
          new anchor.BN(999999009),
          true,
          new anchor.BN(0),
          {
            accounts: {
              communityVoteAccount: communityAccountPublicKey,
              proposal: proposalAccountPublicKey,
              user: provider.wallet.publicKey,
              vote: voteAccountPublicKey,
              tokenAccount: voter1TokenAAccount,
              systemProgram: SystemProgram.programId,
            },
          }
        );
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 2);
  });
  
  
  it("Can vote for a new proposal for Token B!", async () => {
    const [communityBAccountPublicKey, communityBAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintB.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const proposalId = getNumberBuffer(2);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );

    const tokenBFirstProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
      );
    assert.ok(tokenBFirstProposal.title === "Token B Test Title");

    await program.rpc.voteForProposal(
      communityBAccountBump,
      voteBump,            // vote bump account
      new anchor.BN(2),                   // proposal id
      false,                              // vote_bool  true - yes and false - no
      new anchor.BN(0), {                 // candidate = 0 to implies multiple choice is not selected
      accounts: {
        communityVoteAccount: communityBAccountPublicKey,
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        vote: voteAccountPublicKey,
        tokenAccount: voter1TokenBAccount,
        systemProgram: SystemProgram.programId,
      },
    });
    const vote = await program.account.vote.all();
    assert.equal(vote.length, 3);
  });

  it("New User Can Vote to first proposal", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const proposalId = getNumberBuffer(0);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const firstProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );
    assert.ok(firstProposal.title === "Test Title");

    const [voter2AccountPublicKey, voter2Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("vote_account"), proposalId, 
        tokenWallet.publicKey.toBuffer()],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.voteForProposal(
      communityAccountBump,
      voter2Bump, 
      new anchor.BN(0),
      false, 
      new anchor.BN(0), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        user: tokenWallet.publicKey,
        vote: voter2AccountPublicKey,
        tokenAccount: voter2TokenAAccount,
        systemProgram: SystemProgram.programId,
      },
      signers: [tokenWallet],
    });

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 4);
  });

  it("New user can vote to second proposal", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const secondProposalId = getNumberBuffer(1);
    const [secondProposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), secondProposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const secondProposal = await program.account.proposal.fetch(
      secondProposalAccountPublicKey
    );

    assert.ok(secondProposal.title === "Second Test Title");
    const [secondVoteAccountPublicKey, secondVoteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          secondProposalId,
          tokenWallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.voteForProposal(communityAccountBump, secondVoteBump, secondProposal.id, true, new anchor.BN(0), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: secondProposalAccountPublicKey,
        vote: secondVoteAccountPublicKey,
        tokenAccount: voter2TokenAAccount,
        user: tokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [tokenWallet],
    });

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 5);
  });

  it("We can get votes for Proposals", async () => {
    const proposalOneVotes = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(getNumberBuffer(0)),
        },
      },
    ]);
    assert.ok(proposalOneVotes.length === 2);
  });

  it("We can filter votes which is yes", async () => {
    const proposalOneYesVotes = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(
            Buffer.concat([getNumberBuffer(0), Buffer.from([0]), Buffer.from([1])])
          ),
        },
      },
    ]);
    const allVotes = await program.account.vote.all();
    assert.equal(allVotes.length, 5);
    assert.equal(proposalOneYesVotes.length, 1);
    assert.ok(proposalOneYesVotes[0].account.voteBool === true);
  });

  it("We can filter votes which is no", async () => {
    const proposalOneNoVotes = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(
            Buffer.concat([getNumberBuffer(0), Buffer.from([0]), Buffer.from([0])])
          ),
        },
      },
    ]);
    assert.equal(proposalOneNoVotes.length, 1);
    assert.ok(proposalOneNoVotes[0].account.voteBool === false);
  });

  it("Can add a weight vote proposal!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    console.log("Your account", account);
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber() + 1);
    const [proposalAccountPublicKey, accountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.addProposal(
      communityAccountBump,
      accountBump,
      new anchor.BN(account.totalProposalCount.toNumber() + 1),
      "Weighted Vote Title",
      "Weighted Vote Description",
      new anchor.BN(0), // minimum_token_count
      new anchor.BN(1), // voting system - 0 - one vote per token account, 1 - weighted, 2 - quadratic (not supported)
      new anchor.BN(1), // threshold - needs at least 1 vote 
      new anchor.BN(0), // voting_type - 0 - yes or not, 1 - multiple choice is not currently supported
      new anchor.BN(0), // 0 candidates when not using voting type 1
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + (3 * SECONDS_IN_UNIX)), //voting_end_timestamp
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + (10 * SECONDS_IN_UNIX)), //finalize_vote_end_timestamp
      {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: proposalAccountPublicKey,
          tokenAccount: voter1TokenAAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    const weightedVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");
  });

  it("Can vote for weighted vote proposal", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
    // Get the weighted vote proposal id
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const weightedVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    // Voter with 500 tokens votes true
    const [voter1AccountPublicKey, voter1Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.voteForProposal(communityAccountBump, voter1Bump, weightedVoteProposal.id, true, new anchor.BN(0), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        vote: voter1AccountPublicKey,
        tokenAccount: voter1TokenAAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      //signers: [provider.wallet.publicKey],
    });

    // Voter 3 with 1 token A votes false
    const [voter3AccountPublicKey, voter3Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        secondTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );
 
    await program.rpc.voteForProposal(communityAccountBump, voter3Bump, weightedVoteProposal.id, false, new anchor.BN(0), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        vote: voter3AccountPublicKey,
        tokenAccount: voter3TokenAAccount,
        user: secondTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [secondTokenWallet],
    });

    // Voter with 500 tokens votes true
    const [voter4AccountPublicKey, voter4Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          thirdTokenWallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );

      await program.rpc.voteForProposal(communityAccountBump, voter4Bump, weightedVoteProposal.id, false, new anchor.BN(0), {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: proposalAccountPublicKey,
          vote: voter4AccountPublicKey,
          tokenAccount: voter4TokenAAccount,
          user: thirdTokenWallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [thirdTokenWallet],
      });

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 8);

    const updatedWeightedVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updated1Vote = await program.account.vote.fetch(
      voter1AccountPublicKey
    );

    const updated3Vote = await program.account.vote.fetch(
      voter3AccountPublicKey
    );

    const updated4Vote = await program.account.vote.fetch(
      voter4AccountPublicKey
    );

    assert.ok(updatedWeightedVoteProposal.voteYes.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updatedWeightedVoteProposal.voteNo.toNumber() == voter3TokenAAmountOwned + voter4TokenAAmountOwned);
    assert.ok(updated1Vote.voterWeight.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updated3Vote.voterWeight.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updated4Vote.voterWeight.toNumber() == voter4TokenAAmountOwned);
  });

  // **************** Tally Tests *******************************//
  it("Can not tally vote before beginning tally instruction!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    const [voter1AccountPublicKey, voter1Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );
    console.log(voter1AccountPublicKey.toString(), voter1Bump);

    let associatedVoter1TokenAccount = await findAssociatedTokenAddress(provider.wallet.publicKey, mintA.publicKey);

    await assert.rejects(
      async () => {
        await program.rpc.tallyVote(
          weightedVoteProposal.id,
          {
            accounts: {
              proposal: proposalAccountPublicKey,
              user: provider.wallet.publicKey,
              vote: voter1AccountPublicKey,
              tokenAccount: associatedVoter1TokenAccount,//voter1TokenAAccount,
              systemProgram: SystemProgram.programId,
            },
          }
        );
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    //const programId = new anchor.web3.PublicKey("<YOUR-PROGRAM-ID>");
    // console.log("provider wallet key: {}", provider.wallet.publicKey);
    // console.log("tokenWallet key: {}", tokenWallet.publicKey);
    // console.log("secondTokenWallet key: {}", secondTokenWallet.publicKey);
    // console.log("Qwestive programId: {}",  program.programId);

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updated1Vote = await program.account.vote.fetch(
      voter1AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteYes.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updatedWeightedProposal.voteNo.toNumber() == voter3TokenAAmountOwned + voter4TokenAAmountOwned);
    assert.ok(updatedWeightedProposal.votingFinalized == false);
    assert.ok(updatedWeightedProposal.tallyStarted == false);
    assert.ok(updated1Vote.voterWeight.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updated1Vote.tallyCompleted == false);
  });

  it("Cannot begin tally until voting time ends!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );


    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    await assert.rejects(
      async () => {
        await program.rpc.beginTally(
          weightedVoteProposal.id,
          {
            accounts: {
              proposal: proposalAccountPublicKey,
              user: provider.wallet.publicKey,
              tokenAccount: voter1TokenAAccount,
              systemProgram: SystemProgram.programId,
            },
          }
        );
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );
    assert.ok(updatedWeightedProposal.tallyStarted == false);
  });

  it("Can begin tally after voting time ends", async () => {
    await new Promise(resolve => setTimeout(resolve, 5 * UNIX_MS_FACTOR));

    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );


    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    await program.rpc.beginTally(
      weightedVoteProposal.id, {
      accounts: {
        proposal: proposalAccountPublicKey,
        tokenAccount: voter3TokenAAccount,
        user: secondTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [secondTokenWallet],
    });

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );
    assert.ok(updatedWeightedProposal.tallyStarted == true);
  });

  it("Can tally vote", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    const [voter3AccountPublicKey, voter3Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        secondTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    
    let associatedVoter3TokenAccount = await findAssociatedTokenAddress(secondTokenWallet.publicKey, mintA.publicKey);
    //let voter3AccountInfo = await connection.getAccountInfo(voter3TokenA);
    
    await program.rpc.tallyVote(voter3Bump, weightedVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        vote: voter3AccountPublicKey,
        tokenAccount: associatedVoter3TokenAccount,//voter3TokenAAccount,  voter3TokenAccountInfo, //
        user: secondTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [secondTokenWallet],
    });

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updatedVoter3Account = await program.account.vote.fetch(
      voter3AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteNo.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updatedVoter3Account.tallyCompleted == true);
  });

  it("Cannot tally the same vote!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    const [voter3AccountPublicKey, voter3Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        secondTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );
    
    let associatedVoter3TokenAccount = await findAssociatedTokenAddress(secondTokenWallet.publicKey, mintA.publicKey);

    await assert.rejects(
      async () => {
        await program.rpc.tallyVote( voter3Bump, weightedVoteProposal.id, { 
          accounts: {
            proposal: proposalAccountPublicKey,
            vote: voter3AccountPublicKey,
            tokenAccount: associatedVoter3TokenAccount,//voter3TokenAAccount,
            user: secondTokenWallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [secondTokenWallet],
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updatedVoter3Account = await program.account.vote.fetch(
      voter3AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteNo.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updatedVoter3Account.tallyCompleted == true);
  });

  it("Can tally a second voter", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    const [voter1AccountPublicKey, voter1Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        provider.wallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    let associatedVoter1TokenAccount = await findAssociatedTokenAddress(provider.wallet.publicKey, mintA.publicKey);

    await program.rpc.tallyVote( voter1Bump, weightedVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        vote: voter1AccountPublicKey,
        tokenAccount: associatedVoter1TokenAccount,//voter1TokenAAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updatedVoter3Account = await program.account.vote.fetch(
      voter1AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteYes.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updatedVoter3Account.tallyCompleted == true);
  });

  it("Cannot finalize vote before finalize end time!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");
    
    await assert.rejects(
      async () => {
        await program.rpc.finalizeVote( weightedVoteProposal.id, { 
          accounts: {
            proposal: proposalAccountPublicKey,
            tokenAccount: voter3TokenAAccount,
            user: secondTokenWallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [secondTokenWallet],
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(updatedWeightedProposal.votingFinalized == false);
  });

  it("Can finalize vote after time ends", async () => {
    await new Promise(resolve => setTimeout(resolve, 6 * UNIX_MS_FACTOR));

    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    await program.rpc.finalizeVote( weightedVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        tokenAccount: voter1TokenAAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(updatedWeightedProposal.votingFinalized == true);
  });

  it("Cannot tally vote already tallied and after voting finalized!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    const [voter3AccountPublicKey, voter3Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        secondTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    let associatedVoter3TokenAccount = await findAssociatedTokenAddress(provider.wallet.publicKey, mintA.publicKey);
    
    await assert.rejects(
      async () => {
        await program.rpc.tallyVote( voter3Bump, weightedVoteProposal.id, { 
          accounts: {
            proposal: proposalAccountPublicKey,
            vote: voter3AccountPublicKey,
            tokenAccount: associatedVoter3TokenAccount,//voter3TokenAAccount,
            user: secondTokenWallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [secondTokenWallet],
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updatedVoter3Account = await program.account.vote.fetch(
      voter3AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteNo.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updatedVoter3Account.tallyCompleted == true);
  });

  it("Cannot tally a vote after voting is finalized!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the weighted vote proposal
    const weightedVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Weighted Vote Title");

    const [voter4AccountPublicKey, voter4Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        thirdTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );
    
    let associatedVoter4TokenAccount = await findAssociatedTokenAddress(thirdTokenWallet.publicKey, mintA.publicKey);

    await assert.rejects(
      async () => {
        await program.rpc.tallyVote( voter4Bump, weightedVoteProposal.id, { 
          accounts: {
            proposal: proposalAccountPublicKey,
            vote: voter4AccountPublicKey,
            tokenAccount: associatedVoter4TokenAccount,
            user: thirdTokenWallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [thirdTokenWallet],
        });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updatedVoter4Account = await program.account.vote.fetch(
      voter4AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteNo.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updatedVoter4Account.tallyCompleted == false);
  });

  //********************Multiple Candidate Test**************************//
  
  it("Can add a weighted multiple candidate vote proposal!", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    console.log("Your account", account);
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber() + 1);
    const [proposalAccountPublicKey, accountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.addProposal(
      communityAccountBump,
      accountBump,
      new anchor.BN(account.totalProposalCount.toNumber() + 1),
      "Which Coin is the Best?",
      "1.BTC 2.ETH 3.SOL",
      new anchor.BN(0), // minimum_token_count
      new anchor.BN(1), // voting system - 0 - one vote per token account, 1 - weighted, 2 - quadratic (not supported)
      new anchor.BN(1), // threshold - needs at least 1 vote 
      new anchor.BN(1), // voting_type - 0 - yes or not, 1 - multiple choice is not currently supported
      new anchor.BN(3), // 0 candidates when not using voting type 1
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + (3 * SECONDS_IN_UNIX)), //voting_end_timestamp
      new anchor.BN((+new Date() / UNIX_MS_FACTOR) + (9 * SECONDS_IN_UNIX)), //finalize_vote_end_timestamp
      {
        accounts: {
          communityVoteAccount: communityAccountPublicKey,
          proposal: proposalAccountPublicKey,
          tokenAccount: voter1TokenAAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    const weightedVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(weightedVoteProposal.title === "Which Coin is the Best?");
    assert.ok(weightedVoteProposal.description === "1.BTC 2.ETH 3.SOL");
  });

  it("Can vote for candidate vote proposal", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
    // Get the candidate vote proposal id
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const candidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");

    // Voter with 500 tokens votes true
    const [voter1AccountPublicKey, voter1Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.QwestiveVoting.programId
      );

    await program.rpc.voteForProposal(communityAccountBump, voter1Bump, candidateVoteProposal.id, false, new anchor.BN(1), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        vote: voter1AccountPublicKey,
        tokenAccount: voter1TokenAAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      //signers: [provider.wallet.publicKey],
    });

    // Voter 3 with 1 token A votes false
    const [voter3AccountPublicKey, voter3Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        secondTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    await program.rpc.voteForProposal(communityAccountBump, voter3Bump, candidateVoteProposal.id, false, new anchor.BN(2), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        vote: voter3AccountPublicKey,
        tokenAccount: voter3TokenAAccount,
        user: secondTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [secondTokenWallet],
    });

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 10);

    const updatedCandidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updated1Vote = await program.account.vote.fetch(
      voter1AccountPublicKey
    );

    const updated3Vote = await program.account.vote.fetch(
      voter3AccountPublicKey
    );

    assert.ok(updatedCandidateVoteProposal.voteYes.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.voteNo.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.totalVotes.toNumber() == 2);
    assert.ok(updated1Vote.voterWeight.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updated3Vote.voterWeight.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updated1Vote.candidate.toNumber() == 1);
    assert.ok(updated3Vote.candidate.toNumber() == 2);
  });

  it("Cannot vote for candidates outside of candidate max!", async() => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
    // Get the candidate vote proposal id
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const candidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");
    // Voter 3
    const [voter4AccountPublicKey, voter4Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
            Buffer.from("vote_account"),
            proposalId,
            thirdTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    await assert.rejects(
      async () => {
        await program.rpc.voteForProposal(communityAccountBump, voter4Bump, candidateVoteProposal.id, false, new anchor.BN(4), {
            accounts: {
              communityVoteAccount: communityAccountPublicKey,
              proposal: proposalAccountPublicKey,
              vote: voter4AccountPublicKey,
              tokenAccount: voter4TokenAAccount,
              user: thirdTokenWallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [thirdTokenWallet],});
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );
  
    const updatedCandidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    await assert.rejects(
      async () => {
      const updated4Vote = await program.account.vote.fetch(
        voter4AccountPublicKey
      );
      },
      {
        name: "Error",
        // message: "301: Account doesn't exist",
      }
    );

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 10);
    assert.ok(updatedCandidateVoteProposal.voteYes.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.voteNo.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.totalVotes.toNumber() == 2);
  });

  it("Cannot vote for true when proposal voting type is 1!", async() => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
    // Get the candidate vote proposal id
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const candidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");
    // Voter 3
    const [voter4AccountPublicKey, voter4Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
            Buffer.from("vote_account"),
            proposalId,
            thirdTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    await assert.rejects(
      async () => {
        await program.rpc.voteForProposal(communityAccountBump, voter4Bump, candidateVoteProposal.id, true, new anchor.BN(3), {
            accounts: {
              communityVoteAccount: communityAccountPublicKey,
              proposal: proposalAccountPublicKey,
              vote: voter4AccountPublicKey,
              tokenAccount: voter4TokenAAccount,
              user: thirdTokenWallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [thirdTokenWallet],});
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );
  
    const updatedCandidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    await assert.rejects(
      async () => {
      const updated4Vote = await program.account.vote.fetch(
        voter4AccountPublicKey
      );
      },
      {
        name: "Error",
        // message: "301: Account doesn't exist",
      }
    );

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 10);
    assert.ok(updatedCandidateVoteProposal.voteYes.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.voteNo.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.totalVotes.toNumber() == 2);
  });

  it("Can have other wallet vote for the candidates", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
    // Get the candidate vote proposal id
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const candidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");

    // Voter 3
    const [voter4AccountPublicKey, voter4Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
            Buffer.from("vote_account"),
            proposalId,
            thirdTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    await program.rpc.voteForProposal(communityAccountBump, voter4Bump, candidateVoteProposal.id, false, new anchor.BN(3), {
      accounts: {
        communityVoteAccount: communityAccountPublicKey,
        proposal: proposalAccountPublicKey,
        vote: voter4AccountPublicKey,
        tokenAccount: voter4TokenAAccount,
        user: thirdTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [thirdTokenWallet],
    });

    const vote = await program.account.vote.all();
    assert.equal(vote.length, 11);

    const updatedCandidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updated4Vote = await program.account.vote.fetch(
      voter4AccountPublicKey
    );

    assert.ok(updatedCandidateVoteProposal.voteYes.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.voteNo.toNumber() == 0);
    assert.ok(updatedCandidateVoteProposal.totalVotes.toNumber() == 3);
    assert.ok(updated4Vote.voterWeight.toNumber() == voter4TokenAAmountOwned);
    assert.ok(updated4Vote.candidate.toNumber() == 3);
  });

  it("We can filter votes for specific candidates before tally has started", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    // Get the candidate vote proposal id
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

    const candidateVoteProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");

    const votesForCandidate1 = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(
            Buffer.concat([proposalId, Buffer.from([0]), Buffer.from([0]), getNumberBuffer(1)])
          ),
        },
      },
    ]);

    const votesForCandidate2 = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(
            Buffer.concat([proposalId, Buffer.from([0]), Buffer.from([0]), getNumberBuffer(2)])
          ),
        },
      },
    ]);

    const votesForCandidate3 = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(
            Buffer.concat([proposalId, Buffer.from([0]), Buffer.from([0]), getNumberBuffer(3)])
          ),
        },
      },
    ]);

    assert.equal(votesForCandidate1.length, 1);
    assert.ok(votesForCandidate1[0].account.candidate.toNumber() == 1);
    assert.ok(votesForCandidate1[0].account.voterWeight.toNumber() == voter1TokenAAmountOwned);
    assert.equal(votesForCandidate2.length, 1);
    assert.ok(votesForCandidate2[0].account.candidate.toNumber() == 2);
    assert.ok(votesForCandidate2[0].account.voterWeight.toNumber() == voter3TokenAAmountOwned);
    assert.equal(votesForCandidate3.length, 1);
    assert.ok(votesForCandidate3[0].account.candidate.toNumber() == 3);
    assert.ok(votesForCandidate3[0].account.voterWeight.toNumber() == voter4TokenAAmountOwned);
  });

  it("Can begin tally after voting time ends", async () => {
    await new Promise(resolve => setTimeout(resolve, 5 * UNIX_MS_FACTOR));
    
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the cndidate vote proposal
    const candidateVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");

    await program.rpc.beginTally(
      candidateVoteProposal.id, {
      accounts: {
        proposal: proposalAccountPublicKey,
        tokenAccount: voter3TokenAAccount,
        user: secondTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [secondTokenWallet],
    });

    const updatedCandidateProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );
    assert.ok(updatedCandidateProposal.tallyStarted == true);
  });

  it("Can tally vote", async () => {
    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the candidate vote proposal
    const candidateVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");

    const [voter1AccountPublicKey, voter1Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        provider.wallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    let associatedVoter1TokenAccount = await findAssociatedTokenAddress(provider.wallet.publicKey, mintA.publicKey);

    await program.rpc.tallyVote( voter1Bump, candidateVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        vote: voter1AccountPublicKey,
        tokenAccount: associatedVoter1TokenAccount,//voter1TokenAAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    const [voter3AccountPublicKey, voter3Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        secondTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );

    let associatedVoter3TokenAccount = await findAssociatedTokenAddress(secondTokenWallet.publicKey, mintA.publicKey);

    await program.rpc.tallyVote(voter3Bump, candidateVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        vote: voter3AccountPublicKey,
        tokenAccount: associatedVoter3TokenAccount,//voter3TokenAAccount,
        user: secondTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [secondTokenWallet],
    });

    const [voter4AccountPublicKey, voter4Bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("vote_account"),
        proposalId,
        thirdTokenWallet.publicKey.toBuffer(),
      ],
      anchor.workspace.QwestiveVoting.programId
    );


    let associatedVoter4TokenAccount = await findAssociatedTokenAddress(thirdTokenWallet.publicKey, mintA.publicKey);

    await program.rpc.tallyVote(voter4Bump, candidateVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        vote: voter4AccountPublicKey,
        tokenAccount: associatedVoter4TokenAccount,//voter4TokenAAccount,
        user: thirdTokenWallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [thirdTokenWallet],
    });

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    const updatedVoter1Account = await program.account.vote.fetch(
      voter1AccountPublicKey
    );

    const updatedVoter3Account = await program.account.vote.fetch(
      voter3AccountPublicKey
    );

    const updatedVoter4Account = await program.account.vote.fetch(
      voter4AccountPublicKey
    );

    assert.ok(updatedWeightedProposal.voteNo.toNumber() == 0);
    assert.ok(updatedVoter1Account.tallyCompleted == true);
    assert.ok(updatedVoter1Account.voterWeight.toNumber() == voter1TokenAAmountOwned);
    assert.ok(updatedWeightedProposal.voteNo.toNumber() == 0);
    assert.ok(updatedVoter3Account.tallyCompleted == true);
    assert.ok(updatedVoter3Account.voterWeight.toNumber() == voter3TokenAAmountOwned);
    assert.ok(updatedWeightedProposal.voteNo.toNumber() == 0);
    assert.ok(updatedVoter4Account.tallyCompleted == true);
    assert.ok(updatedVoter4Account.voterWeight.toNumber() == voter4TokenAAmountOwned);
  });

  it("Can finalize candidate vote after time ends", async () => {
    await new Promise(resolve => setTimeout(resolve, 4 * UNIX_MS_FACTOR));

    const [communityAccountPublicKey, communityAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("community_account"), mintA.publicKey.toBuffer()],
      anchor.workspace.QwestiveVoting.programId
    );

    const account = await program.account.communityVoteAccount.fetch(
      communityAccountPublicKey
    );

    // Get the proposal with weighted voting system
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());

    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.QwestiveVoting.programId
      );

      // Retrieve the candidate vote proposal
    const candidateVoteProposal = await program.account.proposal.fetch(
        proposalAccountPublicKey
    );

    assert.ok(candidateVoteProposal.title === "Which Coin is the Best?");

    await program.rpc.finalizeVote( candidateVoteProposal.id, { 
      accounts: {
        proposal: proposalAccountPublicKey,
        tokenAccount: voter1TokenAAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    const updatedWeightedProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );

    assert.ok(updatedWeightedProposal.votingFinalized == true);
  });
});
