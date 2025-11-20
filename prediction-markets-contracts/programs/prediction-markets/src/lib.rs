use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j");

#[program]
pub mod prediction_markets {
    use super::*;

    /// Create a new prediction market
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_id: u64,
        question: String,
        description: String,
        end_time: i64,
        category: String,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        require!(question.len() <= 200, MarketError::QuestionTooLong);
        require!(description.len() <= 500, MarketError::DescriptionTooLong);
        require!(end_time > clock.unix_timestamp, MarketError::EndTimeInPast);
        require!(end_time < clock.unix_timestamp + 30 * 24 * 60 * 60, MarketError::EndTimeTooFar);

        market.id = market_id;
        market.question = question;
        market.description = description;
        market.creator = ctx.accounts.creator.key();
        market.created_at = clock.unix_timestamp;
        market.end_time = end_time;
        market.resolution_time = None;
        market.outcome = None;
        market.category = category;

        // Initialize AMM pools with 50/50 ratio (1000 USDC each side for virtual liquidity)
        market.yes_pool = 1_000_000_000; // 1000 USDC (6 decimals)
        market.no_pool = 1_000_000_000;  // 1000 USDC
        market.total_yes_bets = 0;
        market.total_no_bets = 0;
        market.total_volume = 0;
        market.total_bets_count = 0;
        market.unique_bettors = 0;

        market.fee_percentage = 2; // 2% platform fee
        market.status = MarketStatus::Active;
        market.vault = ctx.accounts.vault.key();
        market.vault_bump = ctx.bumps.vault;
        market.resolver = ctx.accounts.creator.key(); // Deprecated, kept for compatibility

        // Decentralized resolution fields
        market.resolution_proposer = None;
        market.resolution_bond = 0;
        market.challenge_deadline = None;
        market.is_finalized = false;

        msg!("Market created: {} (ID: {})", market.question, market_id);
        Ok(())
    }

    /// Place a bet on a market (YES or NO)
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        _market_id: u64,
        amount: u64,
        prediction: bool, // true = YES, false = NO
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;
        let clock = Clock::get()?;

        // Validations
        require!(market.status == MarketStatus::Active, MarketError::MarketNotActive);
        require!(clock.unix_timestamp < market.end_time, MarketError::MarketEnded);
        require!(amount >= 1_000_000, MarketError::BetTooSmall); // Min 1 USDC
        require!(amount <= 10_000_000_000, MarketError::BetTooLarge); // Max 10,000 USDC

        // Calculate tokens received using simplified constant product AMM
        let total_pool = market.yes_pool.checked_add(market.no_pool)
            .ok_or(MarketError::MathOverflow)?;
        let selected_pool = if prediction { market.yes_pool } else { market.no_pool };

        // Simplified AMM: tokens = (amount * opposite_pool) / (selected_pool + amount)
        let opposite_pool = if prediction { market.no_pool } else { market.yes_pool };
        let tokens_received = (amount as u128)
            .checked_mul(opposite_pool as u128)
            .ok_or(MarketError::MathOverflow)?
            .checked_div((selected_pool as u128).checked_add(amount as u128).ok_or(MarketError::MathOverflow)?)
            .ok_or(MarketError::MathOverflow)? as u64;

        // Transfer USDC from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update market state
        if prediction {
            market.yes_pool = market.yes_pool.checked_add(amount).ok_or(MarketError::MathOverflow)?;
            market.total_yes_bets = market.total_yes_bets.checked_add(amount).ok_or(MarketError::MathOverflow)?;
        } else {
            market.no_pool = market.no_pool.checked_add(amount).ok_or(MarketError::MathOverflow)?;
            market.total_no_bets = market.total_no_bets.checked_add(amount).ok_or(MarketError::MathOverflow)?;
        }
        market.total_volume = market.total_volume.checked_add(amount).ok_or(MarketError::MathOverflow)?;
        market.total_bets_count = market.total_bets_count.checked_add(1).ok_or(MarketError::MathOverflow)?;

        // Record bet
        bet.market = market.key();
        bet.user = ctx.accounts.user.key();
        bet.amount = amount;
        bet.tokens_received = tokens_received;
        bet.prediction = prediction;
        bet.timestamp = clock.unix_timestamp;
        bet.claimed = false;
        bet.payout = 0;

        // Update user stats
        let user_stats = &mut ctx.accounts.user_stats;
        if user_stats.total_bets == 0 {
            user_stats.user = ctx.accounts.user.key();
            user_stats.total_wagered = 0;
            user_stats.total_won = 0;
            user_stats.total_lost = 0;
            user_stats.win_count = 0;
            user_stats.loss_count = 0;
            user_stats.current_streak = 0;
            user_stats.best_streak = 0;
            user_stats.net_profit = 0;
            market.unique_bettors = market.unique_bettors.checked_add(1).ok_or(MarketError::MathOverflow)?;
        }
        user_stats.total_bets = user_stats.total_bets.checked_add(1).ok_or(MarketError::MathOverflow)?;
        user_stats.total_wagered = user_stats.total_wagered.checked_add(amount).ok_or(MarketError::MathOverflow)?;

        msg!("Bet placed: {} USDC on {} for market {}",
             amount, if prediction { "YES" } else { "NO" }, market.id);
        Ok(())
    }

    /// Propose resolution for a market (DECENTRALIZED - anyone can propose with bond)
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        _market_id: u64,
        outcome: bool, // true = YES won, false = NO won
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        require!(market.status == MarketStatus::Active, MarketError::MarketNotActive);
        require!(clock.unix_timestamp >= market.end_time, MarketError::MarketNotEnded);

        // Require minimum bond of 100 USDC
        const MIN_RESOLUTION_BOND: u64 = 100_000_000; // 100 USDC (6 decimals)
        require!(
            ctx.accounts.proposer_token_account.amount >= MIN_RESOLUTION_BOND,
            MarketError::InsufficientBond
        );

        // If already proposed, require 2x the current bond to challenge
        if let Some(_existing_proposer) = market.resolution_proposer {
            let required_bond = market.resolution_bond.checked_mul(2)
                .ok_or(MarketError::MathOverflow)?;

            // Transfer 2x bond from new proposer to vault
            let cpi_accounts = Transfer {
                from: ctx.accounts.proposer_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.proposer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, required_bond)?;

            // Update resolution with new proposer
            market.resolution_proposer = Some(ctx.accounts.proposer.key());
            market.outcome = Some(outcome);
            market.resolution_bond = required_bond;
            market.challenge_deadline = Some(clock.unix_timestamp + 24 * 60 * 60); // 24 hours
            market.resolution_time = Some(clock.unix_timestamp);

            msg!("Resolution challenged! New outcome: {}, bond: {}",
                if outcome { "YES" } else { "NO" }, required_bond);
        } else {
            // First proposal - transfer initial bond
            let cpi_accounts = Transfer {
                from: ctx.accounts.proposer_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.proposer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, MIN_RESOLUTION_BOND)?;

            // Set initial resolution
            market.resolution_proposer = Some(ctx.accounts.proposer.key());
            market.outcome = Some(outcome);
            market.resolution_bond = MIN_RESOLUTION_BOND;
            market.challenge_deadline = Some(clock.unix_timestamp + 24 * 60 * 60); // 24 hours
            market.resolution_time = Some(clock.unix_timestamp);

            msg!("Market {} resolution proposed: {} (24h challenge period)",
                market.id, if outcome { "YES" } else { "NO" });
        }

        Ok(())
    }

    /// Finalize resolution after challenge period (anyone can call)
    pub fn finalize_resolution(
        ctx: Context<FinalizeResolution>,
        _market_id: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        require!(market.status == MarketStatus::Active, MarketError::MarketNotActive);
        require!(market.outcome.is_some(), MarketError::NoResolutionProposed);
        require!(!market.is_finalized, MarketError::AlreadyFinalized);

        let challenge_deadline = market.challenge_deadline
            .ok_or(MarketError::NoResolutionProposed)?;
        require!(
            clock.unix_timestamp >= challenge_deadline,
            MarketError::ChallengePeriodActive
        );

        // Finalize the resolution
        market.status = MarketStatus::Resolved;
        market.is_finalized = true;

        // Return bond to the final proposer
        if market.resolution_bond > 0 {
            let proposer = market.resolution_proposer
                .ok_or(MarketError::NoResolutionProposed)?;

            let market_id_bytes = market.id.to_le_bytes();
            let vault_bump = &[market.vault_bump];
            let seeds = &[
                b"vault".as_ref(),
                market_id_bytes.as_ref(),
                vault_bump.as_ref(),
            ];
            let signer = &[&seeds[..]];

            // Transfer bond back to proposer
            let cpi_accounts = Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.proposer_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, market.resolution_bond)?;

            msg!("Resolution finalized! Outcome: {}, proposer rewarded: {}",
                if market.outcome.unwrap() { "YES" } else { "NO" }, proposer);
        }

        Ok(())
    }

    /// Claim winnings from a resolved market
    pub fn claim_winnings(
        ctx: Context<ClaimWinnings>,
        _market_id: u64,
    ) -> Result<()> {
        let market = &ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;
        let user_stats = &mut ctx.accounts.user_stats;

        require!(market.status == MarketStatus::Resolved, MarketError::MarketNotResolved);
        require!(market.is_finalized, MarketError::ResolutionNotFinalized);
        require!(!bet.claimed, MarketError::AlreadyClaimed);
        require!(bet.user == ctx.accounts.user.key(), MarketError::NotBetOwner);

        let outcome = market.outcome.ok_or(MarketError::MarketNotResolved)?;

        // Check if user won
        if bet.prediction == outcome {
            // Winner! Calculate payout
            let winning_pool = if outcome { market.yes_pool } else { market.no_pool };
            let losing_pool = if outcome { market.no_pool } else { market.yes_pool };

            // Payout = (bet_amount / winning_pool) * losing_pool
            let payout_ratio = (bet.amount as u128)
                .checked_mul(losing_pool as u128)
                .ok_or(MarketError::MathOverflow)?
                .checked_div(winning_pool as u128)
                .ok_or(MarketError::MathOverflow)? as u64;

            // Add original bet back
            let total_payout = bet.amount.checked_add(payout_ratio).ok_or(MarketError::MathOverflow)?;

            // Deduct 2% fee
            let fee = total_payout.checked_mul(market.fee_percentage as u64)
                .ok_or(MarketError::MathOverflow)?
                .checked_div(100)
                .ok_or(MarketError::MathOverflow)?;
            let payout_after_fee = total_payout.checked_sub(fee).ok_or(MarketError::MathOverflow)?;

            // Transfer winnings from vault to user
            let market_id_bytes = market.id.to_le_bytes();
            let vault_bump = &[market.vault_bump];
            let seeds = &[
                b"vault".as_ref(),
                market_id_bytes.as_ref(),
                vault_bump.as_ref(),
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, payout_after_fee)?;

            bet.payout = payout_after_fee;
            bet.claimed = true;

            // Update user stats
            user_stats.total_won = user_stats.total_won.checked_add(payout_after_fee).ok_or(MarketError::MathOverflow)?;
            user_stats.win_count = user_stats.win_count.checked_add(1).ok_or(MarketError::MathOverflow)?;
            user_stats.current_streak = user_stats.current_streak.checked_add(1).ok_or(MarketError::MathOverflow)?;
            if user_stats.current_streak > user_stats.best_streak {
                user_stats.best_streak = user_stats.current_streak;
            }

            let profit = (payout_after_fee as i64).checked_sub(bet.amount as i64).ok_or(MarketError::MathOverflow)?;
            user_stats.net_profit = user_stats.net_profit.checked_add(profit).ok_or(MarketError::MathOverflow)?;

            msg!("User won {} USDC!", payout_after_fee);
        } else {
            // Loser - no payout
            bet.payout = 0;
            bet.claimed = true;

            user_stats.total_lost = user_stats.total_lost.checked_add(bet.amount).ok_or(MarketError::MathOverflow)?;
            user_stats.loss_count = user_stats.loss_count.checked_add(1).ok_or(MarketError::MathOverflow)?;
            user_stats.current_streak = 0;

            let loss = -(bet.amount as i64);
            user_stats.net_profit = user_stats.net_profit.checked_add(loss).ok_or(MarketError::MathOverflow)?;

            msg!("User lost the bet");
        }

        Ok(())
    }

    /// Cancel market (only creator, only if no bets placed)
    pub fn cancel_market(
        ctx: Context<CancelMarket>,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;

        require!(ctx.accounts.creator.key() == market.creator, MarketError::NotCreator);
        require!(market.total_bets_count == 0, MarketError::HasBets);
        require!(market.status == MarketStatus::Active, MarketError::MarketNotActive);

        market.status = MarketStatus::Cancelled;

        msg!("Market {} cancelled", market.id);
        Ok(())
    }
}

// ========== ACCOUNTS ==========

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = creator,
        token::mint = usdc_mint,
        token::authority = vault,
        seeds = [b"vault", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: USDC mint address
    pub usdc_mint: AccountInfo<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct PlaceBet<'info> {
    #[account(
        mut,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = user,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", market.key().as_ref(), user.key().as_ref(), &market.total_bets_count.to_le_bytes()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStats::INIT_SPACE,
        seeds = [b"user_stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(
        mut,
        seeds = [b"vault", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"vault", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub proposer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct FinalizeResolution<'info> {
    #[account(
        mut,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"vault", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: Proposer token account - derived from market.resolution_proposer
    #[account(mut)]
    pub proposer_token_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct ClaimWinnings<'info> {
    #[account(
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(mut)]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub user_stats: Account<'info, UserStats>,

    #[account(
        mut,
        seeds = [b"vault", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    pub creator: Signer<'info>,
}

// ========== DATA STRUCTURES ==========

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub id: u64,
    #[max_len(200)]
    pub question: String,
    #[max_len(500)]
    pub description: String,
    pub creator: Pubkey,
    pub created_at: i64,
    pub end_time: i64,
    pub resolution_time: Option<i64>,
    pub outcome: Option<bool>, // None = unresolved, Some(true) = YES won, Some(false) = NO won
    #[max_len(50)]
    pub category: String,

    // AMM pools
    pub yes_pool: u64,  // Virtual YES tokens
    pub no_pool: u64,   // Virtual NO tokens

    // Stats
    pub total_yes_bets: u64,
    pub total_no_bets: u64,
    pub total_volume: u64,
    pub total_bets_count: u64,
    pub unique_bettors: u64,

    pub fee_percentage: u8,
    pub status: MarketStatus,
    pub vault: Pubkey,
    pub vault_bump: u8,

    // Decentralized resolution
    pub resolution_proposer: Option<Pubkey>,  // Who proposed the current resolution
    pub resolution_bond: u64,                  // Current bond amount staked
    pub challenge_deadline: Option<i64>,       // When challenge period ends
    pub is_finalized: bool,                    // True after challenge period with no disputes
    pub resolver: Pubkey,                      // Deprecated, kept for compatibility
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub market: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub tokens_received: u64,
    pub prediction: bool, // true = YES, false = NO
    pub timestamp: i64,
    pub claimed: bool,
    pub payout: u64,
}

#[account]
#[derive(InitSpace)]
pub struct UserStats {
    pub user: Pubkey,
    pub total_bets: u64,
    pub total_wagered: u64,
    pub total_won: u64,
    pub total_lost: u64,
    pub win_count: u32,
    pub loss_count: u32,
    pub current_streak: u32,
    pub best_streak: u32,
    pub net_profit: i64, // Can be negative
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MarketStatus {
    Active,
    Resolved,
    Cancelled,
}

// ========== ERRORS ==========

#[error_code]
pub enum MarketError {
    #[msg("Question too long (max 200 characters)")]
    QuestionTooLong,
    #[msg("Description too long (max 500 characters)")]
    DescriptionTooLong,
    #[msg("End time must be in the future")]
    EndTimeInPast,
    #[msg("End time too far in the future (max 30 days)")]
    EndTimeTooFar,
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Market has not ended yet")]
    MarketNotEnded,
    #[msg("Market already ended")]
    MarketEnded,
    #[msg("Bet too small (minimum 1 USDC)")]
    BetTooSmall,
    #[msg("Bet too large (maximum 10,000 USDC)")]
    BetTooLarge,
    #[msg("Unauthorized resolver")]
    UnauthorizedResolver,
    #[msg("Market not resolved yet")]
    MarketNotResolved,
    #[msg("Already claimed")]
    AlreadyClaimed,
    #[msg("Not the bet owner")]
    NotBetOwner,
    #[msg("Not the market creator")]
    NotCreator,
    #[msg("Market has bets, cannot cancel")]
    HasBets,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient bond for resolution")]
    InsufficientBond,
    #[msg("No resolution has been proposed yet")]
    NoResolutionProposed,
    #[msg("Resolution already finalized")]
    AlreadyFinalized,
    #[msg("Challenge period still active")]
    ChallengePeriodActive,
    #[msg("Resolution not finalized yet")]
    ResolutionNotFinalized,
}
