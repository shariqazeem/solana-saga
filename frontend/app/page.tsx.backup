'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletButton } from './components/WalletButton';
import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Shield, Plus, ArrowRight, Sparkles, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { celebrateSuccess, celebratePayout, celebrateJoin } from './utils/confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { TrustScoreWidget } from './components/TrustScoreWidget';
import { LandingPage } from './components/LandingPage';
import idl from './idl.json';

const PROGRAM_ID = new PublicKey('ABKnVQCt2ATkMivkFux7X3zKnozHzXELc2LiUdZM8vCN');
// Circle's official USDC token on Solana Devnet
// Users can get testnet USDC from: https://faucet.circle.com/
const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Phase labels
const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  joining: { label: 'Joining', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  deposit: { label: 'Deposit Round', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  payout: { label: 'Payout Ready', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  completed: { label: 'Completed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function Home() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<any>(null);
  const [committees, setCommittees] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [solBalance, setSolBalance] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProgram = () => {
    if (!wallet || !publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet.adapter as any,
      { commitment: 'confirmed' }
    );
    return new Program(idl as any, provider) as any;
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchCommittees();
      fetchSolBalance();
    }
  }, [connected, publicKey]);

  const fetchSolBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / 1e9);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
    }
  };

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!program) return;

      const allCommittees: any[] = [];
      const checkedCommittees = new Set<string>();

      console.log('🔍 Starting committee fetch for:', publicKey!.toString().slice(0, 8));

      // 1. Fetch all committees created by this user (check indexes with early stop)
      let consecutiveMisses = 0;
      const maxConsecutiveMisses = 3; // Stop after 3 consecutive misses

      for (let index = 0; index < 100 && consecutiveMisses < maxConsecutiveMisses; index++) {
        try {
          const indexBuffer = Buffer.alloc(4);
          indexBuffer.writeUInt32LE(index);

          const [userCommitteePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('committee'), publicKey!.toBuffer(), indexBuffer],
            PROGRAM_ID
          );

          const committeeAccount = await program.account.committee.fetch(userCommitteePDA);

          // Reset consecutive misses on success
          consecutiveMisses = 0;

          // Check if creator is also a member
          const [creatorMemberPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('member'), userCommitteePDA.toBuffer(), publicKey!.toBuffer()],
            PROGRAM_ID
          );

          let memberAccount = null;
          try {
            memberAccount = await program.account.member.fetch(creatorMemberPDA);
          } catch (e) {
            console.log(`ℹ️ Creator has not joined committee ${index} as member yet`);
          }

          allCommittees.push({
            ...committeeAccount,
            publicKey: userCommitteePDA,
            role: 'creator',
            memberAccount: memberAccount,
            memberPDA: creatorMemberPDA
          });
          checkedCommittees.add(userCommitteePDA.toString());
          console.log(`✅ Found created committee at index ${index}:`, committeeAccount.name);
        } catch (e) {
          // No committee at this index, increment miss counter
          consecutiveMisses++;
          continue;
        }
      }

      console.log(`📊 Checked ${Math.min(100, allCommittees.length + consecutiveMisses)} indexes, found ${allCommittees.length} committees`);


      // 2. Check for stored committee addresses
      try {
        const storedCommittees = localStorage.getItem(`user_${publicKey!.toString()}_committees`);
        if (storedCommittees) {
          const committeeAddresses = JSON.parse(storedCommittees) as string[];
          console.log(`📦 Found ${committeeAddresses.length} stored committee addresses`);

          for (const committeeAddress of committeeAddresses) {
            if (checkedCommittees.has(committeeAddress)) continue;

            try {
              const committeeKey = new PublicKey(committeeAddress);

              const [memberPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('member'), committeeKey.toBuffer(), publicKey!.toBuffer()],
                PROGRAM_ID
              );

              const memberAccount = await program.account.member.fetch(memberPDA);
              const committeeAccount = await program.account.committee.fetch(committeeKey);

              allCommittees.push({
                ...committeeAccount,
                publicKey: committeeKey,
                role: 'member',
                memberAccount: memberAccount,
                memberPDA: memberPDA
              });
              checkedCommittees.add(committeeAddress);
              console.log('✅ Found joined committee:', committeeAccount.name);
            } catch (e) {
              console.log('⚠️ Stored committee no longer valid:', committeeAddress.slice(0, 8));
            }
          }
        }
      } catch (e) {
        console.log('ℹ️ No stored committees found');
      }

      // 3. Fetch all member accounts for this user to discover committees
      console.log('🔍 Scanning blockchain for member accounts...');
      try {
        const memberAccounts = await program.account.member.all([
          {
            memcmp: {
              offset: 40, // authority field offset in member account
              bytes: publicKey!.toBase58(),
            },
          },
        ]);

        console.log(`📋 Found ${memberAccounts.length} member accounts on-chain`);

        for (const memberAccount of memberAccounts) {
          const committeeKey = memberAccount.account.committee;

          // Skip if we already have this committee
          if (checkedCommittees.has(committeeKey.toString())) {
            continue;
          }

          try {
            const committeeAccount = await program.account.committee.fetch(committeeKey);

            // Determine role - if creator matches publicKey, they're the creator
            const isCreator = committeeAccount.authority.toString() === publicKey!.toString();

            allCommittees.push({
              ...committeeAccount,
              publicKey: committeeKey,
              role: isCreator ? 'creator' : 'member',
              memberAccount: memberAccount.account,
              memberPDA: memberAccount.publicKey
            });
            checkedCommittees.add(committeeKey.toString());

            // Store in localStorage for faster future loads
            try {
              const storageKey = `user_${publicKey!.toString()}_committees`;
              const stored = localStorage.getItem(storageKey);
              const committees = stored ? JSON.parse(stored) : [];
              if (!committees.includes(committeeKey.toString())) {
                committees.push(committeeKey.toString());
                localStorage.setItem(storageKey, JSON.stringify(committees));
              }
            } catch (e) {
              console.log('⚠️ Could not update localStorage');
            }

            console.log(`✅ Discovered ${isCreator ? 'created' : 'joined'} committee from blockchain:`, committeeAccount.name);
          } catch (e) {
            console.log('⚠️ Committee no longer exists:', committeeKey.toString().slice(0, 8));
          }
        }
      } catch (e: any) {
        console.log('⚠️ Error scanning for member accounts:', e.message);
      }

      console.log(`📋 Total committees: ${allCommittees.length}`);
      setCommittees(allCommittees);
    } catch (error: any) {
      console.error('❌ Error in fetchCommittees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (committeeKey: PublicKey) => {
    try {
      const program = getProgram();
      if (!program) return;

      const memberAccounts = await program.account.member.all([
        {
          memcmp: {
            offset: 8,
            bytes: committeeKey.toBase58(),
          },
        },
      ]);

      setMembers(memberAccounts.map((m: any) => m.account));
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  // Replace these functions in your app/page.tsx

  const handleContribute = async (committee: any) => {
    try {
      setContributing(true);
      const program = getProgram();
      if (!program || !publicKey) return;

      // Refresh committee data first to get latest memberAccount
      const [memberPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), committee.publicKey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );

      let currentMemberAccount;
      try {
        currentMemberAccount = await program.account.member.fetch(memberPDA);
      } catch (e) {
        toast.error('You are not a member of this committee!');
        return;
      }

      // Check if member has already deposited this round
      if (currentMemberAccount.hasDepositedCurrentRound) {
        toast('You have already contributed for this round! Wait for other members to deposit.', { icon: '✅' });
        return;
      }

      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      const memberTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        publicKey
      );

      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), committee.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

      console.log('🚀 Sending contribution...');

      try {
        const tx = await Promise.race([
          program.methods
            .contribute()
            .accounts({
              committee: committee.publicKey,
              member: memberPDA,
              memberTokenAccount: memberTokenAccount,
              committeeVault: vaultPDA,
              authority: publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ skipPreflight: true }),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 10000)
          )
        ]);

        console.log('✅ Contribution sent:', tx);
      } catch (txError: any) {
        if (txError.message === 'TIMEOUT') {
          console.log('⏳ Transaction is processing...');
        } else if (txError.message && txError.message.includes('already been processed')) {
          console.log('⚠️ Transaction already processed');
        } else {
          throw txError;
        }
      }

      console.log(`🚀 Verifying contribution...`);

      // Background verification with shorter wait times
      for (let i = 0; i < 8; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
          const memberAccount = await program.account.member.fetch(memberPDA);
          if (memberAccount.hasDepositedCurrentRound) {
            console.log('✅ Contribution verified!');
            toast.success(`Successfully contributed ${(committee.monthlyContribution / 1_000_000).toFixed(2)} USDC!`);
            celebrateSuccess();
            await fetchCommittees();
            return;
          }
        } catch (e) {
          console.log(`⏳ Verification attempt ${i + 1}/8...`);
        }
      }

      // If not verified after 12 seconds, still refresh
      console.log('⏳ Contribution likely succeeded, refreshing...');
      await fetchCommittees();

    } catch (error: any) {
      console.error('❌ Error contributing:', error);

      let errorMsg = 'Failed to contribute';
      if (error.message) {
        if (error.message.includes('insufficient')) {
          errorMsg = 'Insufficient USDC balance';
        } else if (error.message.includes('already deposited')) {
          errorMsg = 'You already contributed this round';
        } else if (error.message.includes('User rejected')) {
          errorMsg = 'Transaction cancelled';
        } else if (error.message.includes('already been processed')) {
          toast('Transaction already processed. Verifying...', { icon: '🔄' });
          await new Promise(resolve => setTimeout(resolve, 3000));
          await fetchCommittees();
          return;
        } else {
          errorMsg = error.message;
        }
      }

      toast.error(errorMsg);
    } finally {
      setContributing(false);
    }
  };

  const handleDistributePayout = async (committee: any) => {
    try {
      const program = getProgram();
      if (!program || !publicKey) return;

      if (committee.role !== 'creator') {
        toast.error('Only the committee creator can distribute payouts!');
        return;
      }

      console.log('💰 Starting payout distribution...');

      const allMembers = await program.account.member.all([
        {
          memcmp: {
            offset: 8,
            bytes: committee.publicKey.toBase58(),
          },
        },
      ]);

      console.log(`Found ${allMembers.length} members`);

      const eligibleMember = allMembers.find((m: any) => !m.account.hasReceivedPayout);

      if (!eligibleMember) {
        toast.error('No eligible members for payout!');
        return;
      }

      console.log('💰 Distributing to:', eligibleMember.account.authority.toString().slice(0, 8));

      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      const recipientTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        eligibleMember.account.authority
      );

      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), committee.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

      console.log('🚀 Sending payout transaction...');

      try {
        const tx = await Promise.race([
          program.methods
            .distributePayout()
            .accounts({
              committee: committee.publicKey,
              recipientMember: eligibleMember.publicKey,
              committeeVault: vaultPDA,
              recipientTokenAccount: recipientTokenAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ skipPreflight: true }),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 10000)
          )
        ]);

        console.log('✅ Payout transaction sent:', tx);
      } catch (txError: any) {
        if (txError.message === 'TIMEOUT') {
          console.log('⏳ Transaction is processing...');
        } else if (txError.message && txError.message.includes('already been processed')) {
          console.log('⚠️ Transaction already processed');
        } else {
          throw txError;
        }
      }

      // Show optimistic update
      toast('Payout sent! Verifying...', { icon: '💰' });

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify payout was successful
      let verified = false;
      for (let i = 0; i < 5; i++) {
        try {
          const updatedMember = await program.account.member.fetch(eligibleMember.publicKey);
          if (updatedMember.hasReceivedPayout) {
            console.log('✅ Payout verified!');
            verified = true;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (verified) {
        toast.success(`Successfully distributed ${(committee.monthlyContribution * committee.maxMembers / 1_000_000).toFixed(2)} USDC to ${eligibleMember.account.authority.toString().slice(0, 6)}...!`);
        celebratePayout();

        // Check if payout was the last one - if so, committee should be completed
        // Otherwise, reset member deposits for the next round
        const updatedCommittee = await program.account.committee.fetch(committee.publicKey);

        // If not completed (still in deposit phase for next round), reset all member deposits
        if (updatedCommittee.phase && Object.keys(updatedCommittee.phase)[0] === 'deposit') {
          console.log('🔄 Resetting all member deposits for new round...');
          await resetAllMemberDeposits({ ...committee, ...updatedCommittee });
        }
      } else {
        toast('Payout sent. Page will refresh to show updated status.', { icon: '⏳' });
      }

      // Auto-refresh committee list
      await fetchCommittees();

    } catch (error: any) {
      console.error('❌ Error distributing payout:', error);

      let errorMsg = 'Failed to distribute payout';
      if (error.message) {
        if (error.message.includes('insufficient')) {
          errorMsg = 'Insufficient funds in committee vault';
        } else if (error.message.includes('User rejected')) {
          errorMsg = 'Transaction cancelled';
        } else if (error.message.includes('already received')) {
          errorMsg = 'This member already received payout';
        } else if (error.message.includes('already been processed')) {
          toast('Transaction already processed. Verifying...', { icon: '🔄' });
          await new Promise(resolve => setTimeout(resolve, 5000));
          await fetchCommittees();
          return;
        } else {
          errorMsg = error.message;
        }
      }

      toast.error(errorMsg);
    }
  };


  const resetAllMemberDeposits = async (committee: any) => {
    try {
      const program = getProgram();
      if (!program || !publicKey) return;

      console.log('🔄 Resetting all member deposit statuses...');

      // Get all members
      const allMembers = await program.account.member.all([
        {
          memcmp: {
            offset: 8,
            bytes: committee.publicKey.toBase58(),
          },
        },
      ]);

      console.log(`Found ${allMembers.length} members to reset`);

      // Reset each member's deposit status
      for (const memberAccount of allMembers) {
        try {
          const tx = await program.methods
            .resetMemberForRound()
            .accounts({
              committee: committee.publicKey,
              member: memberAccount.publicKey,
            })
            .rpc({ skipPreflight: true });

          console.log('✅ Reset deposit for:', memberAccount.account.authority.toString().slice(0, 8), 'tx:', tx);

          // Small delay between transactions
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e: any) {
          console.log('⚠️ Failed to reset member:', memberAccount.account.authority.toString().slice(0, 8), e.message);
        }
      }

      console.log('✅ All member deposits reset!');
    } catch (error) {
      console.error('❌ Error resetting deposits:', error);
    }
  };

  const handleJoinCommittee = async (inviteCode: string) => {
    try {
      const program = getProgram();
      if (!program || !publicKey) {
        toast.error('Please connect your wallet first');
        return false;
      }

      const balance = await connection.getBalance(publicKey);
      if (balance < 2000000) {
        toast.error("Insufficient SOL! You need at least 0.002 SOL to join a committee. Get free Devnet SOL at: https://faucet.solana.com", { duration: 6000 });
        return false;
      }

      const committeeKey = new PublicKey(inviteCode);

      const [memberPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), committeeKey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Check if already a member
      try {
        await program.account.member.fetch(memberPDA);
        toast("You're already a member of this committee!", { icon: 'ℹ️' });
        await fetchCommittees();
        setShowJoinModal(false);
        return true; // CHANGE: return true instead of false
      } catch (e) {
        // Not a member yet, continue
      }

      const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } = await import('@solana/spl-token');

      const memberTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        publicKey
      );

      let needsTokenAccount = false;
      try {
        await getAccount(connection, memberTokenAccount);
      } catch (e) {
        needsTokenAccount = true;
      }

      const txBuilder = program.methods
        .joinCommittee()
        .accounts({
          committee: committeeKey,
          member: memberPDA,
          memberTokenAccount: memberTokenAccount,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        });

      if (needsTokenAccount) {
        const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

        const createATAIx = createAssociatedTokenAccountInstruction(
          publicKey,
          memberTokenAccount,
          publicKey,
          USDC_MINT_DEVNET,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        txBuilder.preInstructions([createATAIx]);
      }

      // CHANGE: Send with timeout and better error handling
      console.log('🚀 Sending join transaction...');

      try {
        const tx = await Promise.race([
          txBuilder.rpc({ skipPreflight: true }),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 10000)
          )
        ]);

        console.log('✅ Transaction sent:', tx);

      } catch (txError: any) {
        if (txError.message === 'TIMEOUT') {
          console.log('⏳ Transaction is processing...');
        } else if (txError.message && txError.message.includes('already been processed')) {
          console.log('⚠️ Transaction already processed');
        } else {
          throw txError; // Re-throw other errors
        }
      }

      // Store committee address
      try {
        const storageKey = `user_${publicKey!.toString()}_committees`;
        const stored = localStorage.getItem(storageKey);
        const committees = stored ? JSON.parse(stored) : [];
        if (!committees.includes(committeeKey.toString())) {
          committees.push(committeeKey.toString());
          localStorage.setItem(storageKey, JSON.stringify(committees));
        }
      } catch (e) {
        console.log('⚠️ Could not store committee address');
      }

      // CHANGE: Always show success and verify in background
      toast('Joining committee... Verifying membership...', { icon: '🚀' });
      setShowJoinModal(false);

      // Background verification
      console.log('🔄 Verifying membership in background...');
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          await program.account.member.fetch(memberPDA);
          console.log('✅ Membership verified!');
          toast.success('Successfully joined the committee!');
          celebrateJoin();
          await fetchCommittees();
          return true;
        } catch (e) {
          console.log(`⏳ Verification attempt ${i + 1}/15...`);
        }
      }

      // If still not verified after 30 seconds
      toast('Taking longer than expected. Refresh the page in 1 minute to see if you joined.', { icon: '⚠️', duration: 6000 });
      await fetchCommittees();
      return true;

    } catch (error: any) {
      console.error('❌ Error joining committee:', error);

      let errorMsg = 'Failed to join committee';
      if (error.message) {
        if (error.message.includes('Invalid public key')) {
          errorMsg = 'Invalid committee address';
        } else if (error.message.includes('Account does not exist')) {
          errorMsg = 'Committee not found';
        } else if (error.message.includes('insufficient')) {
          errorMsg = 'Insufficient SOL balance';
        } else if (error.message.includes('User rejected')) {
          errorMsg = 'Transaction cancelled';
        } else if (error.message.includes('full')) {
          errorMsg = 'Committee is full';
        } else if (error.message.includes('already been processed')) {
          // Transaction succeeded, verify membership
          toast('Transaction already processed. Checking membership...', { icon: '🔄' });
          await new Promise(resolve => setTimeout(resolve, 5000));

          try {
            const [memberPDA] = PublicKey.findProgramAddressSync(
              [Buffer.from('member'), new PublicKey(inviteCode).toBuffer(), publicKey!.toBuffer()],
              PROGRAM_ID
            );
            const prog = getProgram();
            await prog?.account.member.fetch(memberPDA);
            toast.success('Successfully joined the committee!');
            celebrateJoin();
            await fetchCommittees();
            setShowJoinModal(false);
            return true;
          } catch {
            toast('Please refresh the page to verify membership.', { icon: '⚠️' });
          }
          return false;
        } else {
          errorMsg = error.message;
        }
      }

      toast.error(errorMsg);
      return false;
    }
  };

  const refreshCommitteeData = async (committee: any) => {
    const program = getProgram();
    if (!program || !publicKey) return committee;

    try {
      console.log('🔄 Refreshing committee data...');

      const freshCommitteeData = await program.account.committee.fetch(committee.publicKey);

      const [memberPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), committee.publicKey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );

      let freshMemberData = null;
      try {
        freshMemberData = await program.account.member.fetch(memberPDA);
      } catch (e) {
        console.log('ℹ️ Not a member or member data not found');
      }

      const refreshed = {
        ...freshCommitteeData,
        publicKey: committee.publicKey,
        role: committee.role,
        memberAccount: freshMemberData,
        memberPDA: memberPDA
      };

      console.log('✅ Fresh data:', {
        round: refreshed.currentRound,
        deposits: refreshed.depositsThisRound,
        memberDeposited: freshMemberData?.hasDepositedCurrentRound
      });

      return refreshed;
    } catch (error) {
      console.error('❌ Error refreshing:', error);
      return committee;
    }
  };

  const getPhaseInfo = (phase: any) => {
    const phaseKey = Object.keys(phase || {})[0] || 'joining';
    return PHASE_LABELS[phaseKey] || PHASE_LABELS.joining;
  };

  const getFrequencyLabel = (frequency: any) => {
    const freqKey = Object.keys(frequency || {})[0] || 'monthly';
    return freqKey.charAt(0).toUpperCase() + freqKey.slice(1);
  };

  // Show landing page if not connected
  if (!connected) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 relative"
          style={{
            background: `
              radial-gradient(circle at 80% 10%, rgba(22,219,101,0.1), transparent 60%),
              radial-gradient(circle at 20% 90%, rgba(59,130,246,0.08), transparent 60%),
              linear-gradient(to bottom right, rgb(2,6,23), rgb(15,23,42), rgb(6,78,59))
            `
          }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'border-white/10 backdrop-blur-xl bg-black/40 shadow-lg shadow-black/20'
          : 'border-white/5 backdrop-blur-sm bg-black/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-white text-2xl font-bold tracking-tight">RizqFi</span>
                <p className="text-emerald-400 text-xs font-medium">Community Savings</p>
              </div>
            </div>
            {connected && publicKey ? (
              <div className="flex items-center gap-3">
                {/* Wallet Address Pill */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-emerald-500/30 relative group"
                     style={{boxShadow: '0 0 20px rgba(16,185,129,0.15), inset 0 0 20px rgba(255,255,255,0.03)'}}>
                  {/* Solana Logo */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                      <path d="M4.5 7.5L12 3l7.5 4.5v9L12 21l-7.5-4.5v-9z"/>
                    </svg>
                  </div>
                  {/* Address */}
                  <span className="text-white font-mono text-sm font-medium">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </span>
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </div>
                {/* SOL Balance Badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                  <span className={`text-xs font-semibold ${solBalance < 0.01 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {solBalance.toFixed(3)} SOL
                  </span>
                </div>
                <WalletButton />
              </div>
            ) : (
              <WalletButton />
            )}
          </div>
        </div>
      </nav>

      {!connected ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 pt-32">
          <div className="text-center animate-fadeIn">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Powered by Solana</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
              Traditional Committees,
              <br />
              <span className="text-emerald-400">Blockchain Trust</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Join transparent savings circles on Solana. No banks, no middlemen – just your community and smart contracts ensuring fairness.
            </p>

            <WalletButton />
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pt-24 sm:pt-32 animate-fadeIn">
          {/* Trust Score Widget */}
          <TrustScoreWidget committees={committees} />

          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">Welcome back! 👋</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">Manage your committees and grow your savings</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 text-base sm:text-lg">Create Committee</span>
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold backdrop-blur-sm border-2 border-white/30 hover:border-emerald-400/50 transition-all hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <Users className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
              <span className="relative z-10 text-base sm:text-lg">Join Committee</span>
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 relative" style={{boxShadow: 'inset 0 0 40px rgba(255,255,255,0.02), 0 0 60px rgba(16,185,129,0.08)'}}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wider">My Committees</h3>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : committees.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 animate-float">
                    <Users className="w-16 h-16 text-emerald-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">No committees yet</h3>
                <p className="text-slate-400 text-base sm:text-lg mb-6 px-4">Start your savings journey by creating or joining a committee</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 px-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  >
                    Create Committee
                  </button>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  >
                    Join Committee
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {committees.map((committee, idx) => {
                  const phaseInfo = getPhaseInfo(committee.phase);
                  const frequencyLabel = getFrequencyLabel(committee.frequency);
                  const monthlyAmount = committee.monthlyContribution / 1_000_000;
                  const totalPool = monthlyAmount * committee.maxMembers;
                  const progress = (committee.currentMembers / committee.maxMembers) * 100;
                  const isCreator = committee.role === 'creator';

                  return (
                    <div
                      key={idx}
                      onClick={async () => {
                        const refreshed = await refreshCommitteeData(committee);
                        setSelectedCommittee(refreshed);
                      }}
                      className="group glass-card rounded-3xl p-4 sm:p-6 border border-white/20 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] relative"
                      style={{boxShadow: '0 0 60px rgba(16,185,129,0.08), inset 0 0 30px rgba(255,255,255,0.02)'}}
                    >
                      {/* Ambient glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="text-white font-bold text-lg sm:text-xl truncate">{committee.name}</h4>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${phaseInfo.color}`}>
                              {phaseInfo.label}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${isCreator ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {isCreator ? 'CREATOR' : 'MEMBER'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{committee.currentMembers}/{committee.maxMembers}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{frequencyLabel}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Round {committee.currentRound}</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-emerald-400 transition-all flex-shrink-0 ml-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 relative z-10">
                        <div className="bg-black/20 rounded-lg p-2 sm:p-3 border border-white/5 relative" style={{boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'}}>
                          <p className="text-slate-400 text-[10px] sm:text-xs">Per Round</p>
                          <p className="text-white font-bold text-sm sm:text-base">${monthlyAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 sm:p-3 border border-white/5 relative" style={{boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'}}>
                          <p className="text-slate-400 text-[10px] sm:text-xs">Total Pool</p>
                          <p className="text-white font-bold text-sm sm:text-base">${totalPool.toFixed(2)}</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 sm:p-3 border border-white/5 relative" style={{boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'}}>
                          <p className="text-slate-400 text-[10px] sm:text-xs">Deposits</p>
                          <p className="text-white font-bold text-sm sm:text-base">{committee.depositsThisRound || 0}/{committee.currentMembers}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                          <span>Member Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                            style={{width: `${progress}%`}}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateCommitteeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchCommittees}
          program={getProgram()}
          userPublicKey={publicKey}
        />
      )}

      {showJoinModal && (
        <JoinCommitteeModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinCommittee}
        />
      )}

      {selectedCommittee && (
        <CommitteeDetailsModal
          committee={selectedCommittee}
          onClose={() => setSelectedCommittee(null)}
          onContribute={async () => {
            await handleContribute(selectedCommittee);
            // Refresh committee data after contribution
            const refreshed = await refreshCommitteeData(selectedCommittee);
            setSelectedCommittee(refreshed);
          }}
          onDistributePayout={async () => {
            await handleDistributePayout(selectedCommittee);
            // Refresh committee data after payout
            const refreshed = await refreshCommitteeData(selectedCommittee);
            setSelectedCommittee(refreshed);
          }}
          onViewMembers={() => {
            fetchMembers(selectedCommittee.publicKey);
            setShowMembersModal(true);
          }}
          onShare={() => setShowShareModal(true)}
          contributing={contributing}
          onRefresh={async () => {
            const refreshed = await refreshCommitteeData(selectedCommittee);
            setSelectedCommittee(refreshed);
          }}
        />
      )}

      {showMembersModal && selectedCommittee && (
        <MembersModal
          committee={selectedCommittee}
          members={members}
          onClose={() => setShowMembersModal(false)}
        />
      )}

      {showShareModal && selectedCommittee && (
        <ShareInviteModal
          committee={selectedCommittee}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
}

function CreateCommitteeModal({ onClose, onSuccess, program, userPublicKey }: any) {
  const { connection } = useConnection();
  const [formData, setFormData] = useState({
    name: '',
    contribution: '',
    members: '5',
    payoutMode: 'auto',
    rotationType: 'fixed',
    frequency: 'monthly',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Find the next available committee index for this user
  const findNextCommitteeIndex = async (): Promise<number> => {
    let index = 0;
    while (index < 100) { // Safety limit: max 100 committees per wallet
      try {
        const indexBuffer = Buffer.alloc(4);
        indexBuffer.writeUInt32LE(index);
        const [committeePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('committee'), userPublicKey!.toBuffer(), indexBuffer],
          PROGRAM_ID
        );
        await program?.account.committee.fetch(committeePDA);
        index++; // If fetch succeeds, this index is taken, try next
      } catch (e) {
        // Committee doesn't exist at this index, use it
        return index;
      }
    }
    throw new Error('Maximum number of committees reached');
  };
  const autoJoinCreator = async (committeeKey: PublicKey) => {
    try {
      console.log('🔄 Auto-joining creator...');

      const [memberPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), committeeKey.toBuffer(), userPublicKey.toBuffer()],
        PROGRAM_ID
      );

      try {
        await program.account.member.fetch(memberPDA);
        return;
      } catch (e) { }

      const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } = await import('@solana/spl-token');

      const memberTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        userPublicKey
      );

      let needsTokenAccount = false;
      try {
        await getAccount(connection, memberTokenAccount);
      } catch (e) {
        needsTokenAccount = true;
      }

      const txBuilder = program.methods
        .joinCommittee()
        .accounts({
          committee: committeeKey,
          member: memberPDA,
          memberTokenAccount: memberTokenAccount,
          authority: userPublicKey,
          systemProgram: web3.SystemProgram.programId,
        });

      if (needsTokenAccount) {
        const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

        const createATAIx = createAssociatedTokenAccountInstruction(
          userPublicKey,
          memberTokenAccount,
          userPublicKey,
          USDC_MINT_DEVNET,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        txBuilder.preInstructions([createATAIx]);
      }

      await txBuilder.rpc({ skipPreflight: true });
      console.log('✅ Creator auto-joined!');
    } catch (error) {
      console.error('⚠️ Error auto-joining:', error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !userPublicKey) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setCreating(true);
      setError('');

      // Find next available index
      const committeeIndex = await findNextCommitteeIndex();
      console.log(`📋 Creating committee with index: ${committeeIndex}`);

      const indexBuffer = Buffer.alloc(4);
      indexBuffer.writeUInt32LE(committeeIndex);

      const [committeePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('committee'), userPublicKey.toBuffer(), indexBuffer],
        PROGRAM_ID
      );

      const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), committeePDA.toBuffer()],
        PROGRAM_ID
      );

      const payoutMode = formData.payoutMode === 'auto' ? { auto: {} } : { manual: {} };
      const rotationType =
        formData.rotationType === 'fixed' ? { fixed: {} } :
          formData.rotationType === 'random' ? { random: {} } :
            { bidding: {} };
      const frequency =
        formData.frequency === 'weekly' ? { weekly: {} } :
          formData.frequency === 'biweekly' ? { biweekly: {} } :
            { monthly: {} };

      const startDateTimestamp = new BN(Math.floor(new Date(formData.startDate).getTime() / 1000));

      console.log('🚀 Sending transaction...');

      // Send transaction without waiting for full confirmation
      const txPromise = program.methods
        .createCommittee(
          committeeIndex,
          formData.name,
          new BN(parseFloat(formData.contribution) * 1_000_000),
          parseInt(formData.members),
          payoutMode,
          rotationType,
          frequency,
          startDateTimestamp
        )
        .accounts({
          committee: committeePDA,
          vault: vaultPDA,
          usdcMint: USDC_MINT_DEVNET,
          authority: userPublicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc({ skipPreflight: true });

      // Race between transaction and timeout
      const signature = await Promise.race([
        txPromise,
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 10000)
        )
      ]).catch((err) => {
        if (err.message === 'TIMEOUT') {
          console.log('⏳ Transaction sent but confirmation is slow...');
          return 'PENDING';
        }
        throw err;
      });

      if (signature === 'PENDING' || signature) {
        console.log('📤 Transaction submitted, verifying in background...');

        // Close modal immediately with pending message
        toast('Committee creation in progress! This may take 30-60 seconds. The page will refresh automatically when ready.', { icon: '🚀', duration: 8000 });
        onClose();

        // Background verification
        const verifyCommittee = async () => {
          for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Check every 3 seconds

            try {
              const committeeAccount = await program.account.committee.fetch(committeePDA);
              console.log('✅ Committee verified on-chain!');

              // Auto-join creator
              await autoJoinCreator(committeePDA);
              await new Promise(resolve => setTimeout(resolve, 2000));

              toast.success('Committee created successfully! You have been added as the first member.');
              celebrateSuccess();
              onSuccess();
              return;
            } catch (e) {
              console.log(`⏳ Verification attempt ${i + 1}/20...`);
            }
          }

          // After 60 seconds of trying
          toast('Committee creation is taking longer than expected. Please refresh the page in 1-2 minutes to see if it was created.', { icon: '⚠️', duration: 8000 });
        };

        verifyCommittee();
      }

    } catch (err: any) {
      console.error('❌ Error:', err);

      if (err.message && err.message.includes('User rejected')) {
        setError('Transaction cancelled');
      } else {
        setError(err.message || 'Transaction failed');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto relative"
        style={{boxShadow: '0 0 80px rgba(16,185,129,0.15), inset 0 0 40px rgba(255,255,255,0.03)'}}
      >
        {/* Ambient modal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Create Committee</h2>
            <p className="text-slate-400 text-sm mt-1">Start a new savings circle</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 text-sm">Committee Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Contribution per Round (USDC)</label>
            <input
              type="number"
              value={formData.contribution}
              onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              placeholder="10"
              required
              min="1"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Maximum Members</label>
            <select
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                <option key={num} value={num} className="bg-slate-900">{num} members</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="weekly" className="bg-slate-900">Weekly (Every 7 days)</option>
              <option value="biweekly" className="bg-slate-900">Biweekly (Every 14 days)</option>
              <option value="monthly" className="bg-slate-900">Monthly (Every 30 days)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              required
            />
            <p className="text-slate-500 text-xs mt-1">When should the first round start?</p>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Payout Mode</label>
            <select
              value={formData.payoutMode}
              onChange={(e) => setFormData({ ...formData, payoutMode: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="auto" className="bg-slate-900">Auto (Instant)</option>
              <option value="manual" className="bg-slate-900">Manual (Claim)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Rotation Type</label>
            <select
              value={formData.rotationType}
              onChange={(e) => setFormData({ ...formData, rotationType: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="fixed" className="bg-slate-900">Fixed (Sequential)</option>
              <option value="random" className="bg-slate-900">Random (Lottery)</option>
              <option value="bidding" className="bg-slate-900">Bidding</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-emerald-400 font-medium mb-1">Total Pool Each Round</p>
                <p className="text-slate-300">
                  ${(parseFloat(formData.contribution || '0') * parseInt(formData.members)).toFixed(2)} USDC
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function JoinCommitteeModal({ onClose, onJoin }: { onClose: () => void; onJoin: (code: string) => void }) {
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    try {
      await onJoin(inviteCode.trim());
    } catch (error) {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative"
        style={{boxShadow: '0 0 80px rgba(16,185,129,0.15), inset 0 0 40px rgba(255,255,255,0.03)'}}
      >
        {/* Ambient modal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-3xl pointer-events-none"></div>
        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Committee</h2>
          <p className="text-slate-400 text-sm">Enter the committee address</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-slate-300 mb-2 text-sm">Committee Address</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Paste address here"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-mono text-sm"
              required
              disabled={joining}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold"
              disabled={joining}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={joining}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
            >
              {joining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <span>Join</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CommitteeDetailsModal({
  committee,
  onClose,
  onContribute,
  onDistributePayout,
  onViewMembers,
  onShare,
  contributing,
  onRefresh

}: any) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const monthlyAmount = committee.monthlyContribution / 1_000_000;
  const totalPool = monthlyAmount * committee.maxMembers;
  const isCreator = committee.role === 'creator';
  const memberData = committee.memberAccount;
  const phaseInfo = PHASE_LABELS[Object.keys(committee.phase || {})[0] || 'joining'];
  const frequencyLabel = Object.keys(committee.frequency || {})[0] || 'monthly';

  // Check if user can contribute (works for both creator and members)
  const canContribute =
    memberData && // User must be a member
    committee.phase &&
    Object.keys(committee.phase)[0] === 'deposit' &&
    !memberData.hasDepositedCurrentRound &&
    committee.depositsThisRound < committee.currentMembers; // Ensure not all deposits are in yet

  const canDistributePayout =
    isCreator &&
    committee.phase &&
    Object.keys(committee.phase)[0] === 'payout';

  const isCompleted =
    committee.phase &&
    Object.keys(committee.phase)[0] === 'completed';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto relative"
        style={{boxShadow: '0 0 80px rgba(16,185,129,0.15), inset 0 0 40px rgba(255,255,255,0.03)'}}
      >
        {/* Ambient modal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-3xl pointer-events-none"></div>
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{committee.name}</h2>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${phaseInfo.color}`}>
                {phaseInfo.label}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${isCreator ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                {isCreator ? 'CREATOR' : 'MEMBER'}
              </span>
              {/* Refresh Button with Loading State */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={refreshing}
                className="text-xs font-bold px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {refreshing ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Member Status Card - Show for anyone who is a member (including creator) */}
        {memberData && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <p className="text-blue-400 font-semibold mb-2">Your Status</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Total Contributed</p>
                <p className="text-white font-semibold">${(memberData.totalContributed / 1_000_000).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">This Round</p>
                <p className="text-white font-semibold">
                  {memberData.hasDepositedCurrentRound ? '✅ Paid' : '⏳ Pending'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Rounds Completed</p>
                <p className="text-white font-semibold">{memberData.roundsParticipated}</p>
              </div>
              <div>
                <p className="text-slate-400">Payout Status</p>
                <p className="text-white font-semibold">
                  {memberData.hasReceivedPayout ? '✅ Received' : '⏳ Waiting'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Not a Member Warning - Show for creator who hasn't joined */}
        {isCreator && !memberData && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-400 font-medium mb-1">You haven't joined as a member yet</p>
                <p className="text-slate-300 text-xs">
                  As the creator, you were automatically joined during committee creation. If you see this message, please refresh the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the component stays the same... */}
        {/* Payout Ready Alert */}
        {canDistributePayout && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-purple-400 font-semibold mb-1">Ready for Payout!</p>
                <p className="text-slate-300 text-sm">
                  All members have contributed. Click below to distribute ${totalPool.toFixed(2)} USDC to the next recipient.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-emerald-400 font-semibold mb-1">Committee Completed! 🎉</p>
                <p className="text-slate-300 text-sm">
                  All members have received their payouts. This committee has successfully completed its cycle!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <p className="text-slate-400 text-xs mb-1">Per Round</p>
            <p className="text-white font-bold text-xl">${monthlyAmount.toFixed(2)}</p>
            <p className="text-emerald-400 text-xs capitalize">{frequencyLabel}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <p className="text-slate-400 text-xs mb-1">Total Pool</p>
            <p className="text-white font-bold text-xl">${totalPool.toFixed(2)}</p>
            <p className="text-emerald-400 text-xs">per payout</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <p className="text-slate-400 text-xs mb-1">Progress</p>
            <p className="text-white font-bold text-xl">Round {committee.currentRound}</p>
            <p className="text-slate-400 text-xs">{committee.depositsThisRound || 0}/{committee.currentMembers} deposits</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Contribute Button - Show for anyone who is a member and hasn't paid */}
          {canContribute && (
            <button
              onClick={onContribute}
              disabled={contributing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {contributing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Contribute ${monthlyAmount.toFixed(2)} USDC</span>
                </>
              )}
            </button>
          )}

          {/* Distribute Payout Button */}
          {canDistributePayout && (
            <button
              onClick={onDistributePayout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              <Sparkles className="w-5 h-5" />
              <span>Distribute ${totalPool.toFixed(2)} Payout</span>
            </button>
          )}

          {/* Waiting Message for non-creators in payout phase */}
          {!isCreator && committee.phase && Object.keys(committee.phase)[0] === 'payout' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium mb-1">Waiting for Payout Distribution</p>
                  <p className="text-slate-300 text-xs">
                    The committee creator will distribute the payout shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Committee to Fill (Joining Phase) */}
          {memberData && committee.phase && Object.keys(committee.phase)[0] === 'joining' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium mb-1">Waiting for Members to Join</p>
                  <p className="text-slate-300 text-xs">
                    {committee.currentMembers} / {committee.maxMembers} members have joined. Once the committee is full, you'll be able to contribute.
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Share the invite code to get more members!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Deposits Message */}
          {memberData && committee.phase && Object.keys(committee.phase)[0] === 'deposit' && !canContribute && memberData.hasDepositedCurrentRound && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium mb-1">Waiting for Other Members</p>
                  <p className="text-slate-300 text-xs">
                    You've contributed for this round. Waiting for {committee.currentMembers - (committee.depositsThisRound || 0)} other member(s) to deposit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewMembers}
              className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all border border-white/10 hover:border-emerald-500/30"
            >
              <Users className="w-4 h-4" />
              <span>View Members</span>
            </button>
            <button
              onClick={onShare}
              className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all border border-white/10 hover:border-emerald-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share Invite</span>
            </button>
          </div>
        </div>

        {/* How It Works Info Box */}
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-emerald-400 font-medium mb-1">How it works</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                Each member contributes ${monthlyAmount.toFixed(2)} every {frequencyLabel}.
                One member receives the full pool of ${totalPool.toFixed(2)} per round.
                This continues for {committee.maxMembers} rounds until everyone gets their payout.
              </p>
            </div>
          </div>
        </div>

        {/* Payout History */}
        {committee.membersWhoReceivedPayout && committee.membersWhoReceivedPayout.length > 0 && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white font-semibold mb-3 text-sm">Payout History</p>
            <div className="space-y-2">
              {committee.membersWhoReceivedPayout.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-black/20 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <span className="text-emerald-400 text-xs font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-slate-300 font-mono">
                      {member.toString().slice(0, 6)}...{member.toString().slice(-4)}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-semibold">${totalPool.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MembersModal({ committee, members, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative"
        style={{boxShadow: '0 0 80px rgba(16,185,129,0.15), inset 0 0 40px rgba(255,255,255,0.03)'}}
      >
        {/* Ambient modal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-3xl pointer-events-none"></div>
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Members</h2>
            <p className="text-slate-400 text-sm">{committee.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No members yet</p>
            </div>
          ) : (
            members.map((member: any, idx: number) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <span className="text-emerald-400 font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm font-mono">
                        {member.authority.toString().slice(0, 8)}...
                      </p>
                      <p className="text-slate-400 text-xs">
                        {member.hasDepositedCurrentRound ? '✅ Deposited' : '⏳ Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold text-sm">
                      ${(member.totalContributed / 1_000_000).toFixed(2)}
                    </p>
                    <p className="text-slate-500 text-xs">total</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ShareInviteModal({ committee, onClose }: any) {
  const [copied, setCopied] = useState(false);
  const inviteCode = committee.publicKey.toString();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative"
        style={{boxShadow: '0 0 80px rgba(16,185,129,0.15), inset 0 0 40px rgba(255,255,255,0.03)'}}
      >
        {/* Ambient modal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-3xl pointer-events-none"></div>
        <div className="flex items-start justify-between mb-6 relative z-10">
          <h2 className="text-2xl font-bold text-white">Share Committee</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">{committee.name}</h3>
            <p className="text-slate-300 text-sm">
              {committee.currentMembers}/{committee.maxMembers} members
            </p>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Committee Address</label>
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs pr-24"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}