# Mood Economy & Business Model

## High-Level Description

Our app is a mood-tracking platform that uses a subscription-based model with a unique twist — users can earn back in full or part of their subscription fee by making daily entries. The app has three tiers:

### Basic

This is the entry-level tier. Users can track their mood daily and view their entries.

### Silver

A premium tier that offers all the features of the app.

### Gold

The highest tier with all features and the biggest potential for earning back the subscription fee.
Users pay a monthly subscription fee, which can also be paid with tokens that they earn by maintaining streaks of daily logins. If a user logs their mood every day for a week, they earn weekly streak tokens. If they do this for an entire month, they earn monthly streak tokens. For Gold tier users, logging every day for three months straight comes with a big token bonus.

Our app's economy is designed to be balanced, meaning we give out less in token rewards than we receive in subscription fees. This is important to prevent the tokens from losing value and to ensure the company remains profitable.

Here's how it works:

Most users won't complete all their streaks, which means not everyone will earn enough tokens to pay for their subscriptions. This is where the company profits.
Users are distributed across the tiers. Most are Basic users, fewer are Silver, and the least are Gold. Each tier has different rewards and costs.
Tokens are burned when used to pay for subscriptions, which helps maintain the token value.
The model assumes that the combined token value given back to users is less than the total subscription fees collected. This means the app should always have more incoming revenue (from fees) than outgoing rewards (tokens), making it a sustainable business.

## Detailed Low-Level Description

The mood-tracking app utilizes a token-based incentive system integrated within a subscription model. Users can earn tokens through engagement streaks and use these tokens to pay for their subscriptions. To maintain the token economy's integrity and prevent inflation, a burning mechanism is employed whereby tokens used for subscription payments are permanently removed from circulation.

### Subscription Tiers and Token Rewards

### Basic Tier

- **Cost**: $10/month or 10 Tokens
- **Engagement Incentive**: Earn tokens through weekly and monthly engagement.
- **Weekly Streak Bonus**: 0.23 tokens per week.
- **Monthly Streak Bonus**: 2 tokens for logging every day for the entire month.
- **Effective Cost**: $8/month after tokens earned back.
- **Features**: Users can make entries and view them in a simple format to track their mood over time.

### Silver Tier

- **Cost**: $15/month or 15 Tokens
- **Engagement Incentive**: Earn tokens through weekly and monthly engagement.
- **Weekly Streak Tokens**: 1 token per week.
- **Monthly Streak Bonus**: 5.67 tokens for logging every day of the month (accounting for the average number of weeks per month over a year).
- **Effective Cost**: $5/month after tokens earned back.
- **Features**: All app features, including advanced analytics and mood pattern insights.

### Gold Tier

- **Cost**: $25/month or 25 Tokens
- **Engagement Incentive**: Earn tokens through weekly, monthly, and 3-month engagement.
- **Weekly Streak Tokens**: 2 tokens per week.
- **Monthly Streak Bonus**: 16.33 tokens for logging every day of the month.
- **3-Month Streak Bonus**: 25 tokens for maintaining Gold status and logging every day for 3 consecutive months.
- **Effective Cost**: Potentially $0/month after tokens earned back for monthly streaks, with additional rewards for longer streaks.
- **Features**: All app features, including exclusive content and services.

### Mathematical Model and Probabilities

The model incorporates various probabilities to account for the likelihood that not all users will fulfill the engagement criteria to earn tokens:

- **P_B_weekly**: Probability of a Basic tier user not completing their weekly streak.
- **P_B_monthly**: Probability of a Basic tier user not completing their monthly streak.
- **P_S_weekly**: Probability of a Silver tier user not completing their weekly streak.
- **P_S_monthly**: Probability of a Silver tier user not completing their monthly streak.
- **P_G_weekly**: Probability of a Gold tier user not completing their weekly streak.
- **P_G_monthly**: Probability of a Gold tier user not completing their monthly streak.
- **P_G_3-month**: Probability of a Gold tier user not completing their 3-month streak.

For each tier, the expected token payout is calculated using the following formula:

```
Expected Payout = T_weekly * 4 * (1 - P_T_weekly) + T_monthly * (1 - P_T_monthly) + T_3-month * (1 - P_G_3-month)
```

Where:

- T_weekly, T_monthly, T_3-month are the tokens awarded for completing weekly, monthly, and 3-month streaks, respectively.
- P_T_weekly, P_T_monthly, P_G_3-month are the probabilities of a user in tier T not completing weekly, monthly, and 3-month streaks, respectively.
  Each tier (Basic, Silver, Gold) has its own set of probabilities and token rewards, reflecting the different engagement levels and incentives offered.

### User Distribution Ratios

The model takes into account the user distribution across tiers with the following ratios:

ratio_basic: Fraction of users in the Basic tier.
ratio_silver: Fraction of users in the Silver tier.
ratio_gold: Fraction of users in the Gold tier.

These ratios significantly affect the total expected token distribution and burn rate.

### Token Burn Mechanism

When users pay their subscription fees with tokens, those tokens are "burned," meaning they are permanently removed from the token supply. This mechanism is vital for maintaining the token's value by mitigating inflationary pressures.

### Balancing the Economy

The token economy's health is evaluated by comparing the total expected token burn (from subscription payments) against the total expected token payout (from engagement rewards). The aim is to maintain a balance where:

```
Total Expected Burn > Total Expected Payout
```

If this balance is sustained, the token economy is considered stable, ensuring the platform remains profitable while the tokens retain their value.

### Monitoring and Adjustments

The app requires continuous monitoring to align the actual user engagement with the model's assumptions. Adjustments to probabilities, tier ratios, or token values may be implemented in response to user behavior trends.

### Conclusion

The app's token economy is meticulously designed to be self-regulating, promoting user retention while protecting the platform's profitability and the token's market value. The balance between user engagement incentives and token supply control creates a sustainable ecosystem for the mood-tracking app.

## Model (ReScript)

```rescript
// Define user distribution ratios
let ratioBasic = 0.50
let ratioSilver = 0.30
let ratioGold = 0.20

// Define streak rewards
let basicWeeklyReward = 0.23
let basicMonthlyReward = 2.0
let silverWeeklyReward = 1.0
let silverMonthlyReward = 5.67
let goldWeeklyReward = 2.0
let goldMonthlyReward = 16.33
let goldThreeMonthReward = 25.0

// Define probabilities of not completing streaks
let probBasicWeeklyFail = 0.70
let probBasicMonthlyFail = 0.80
let probSilverWeeklyFail = 0.50
let probSilverMonthlyFail = 0.60
let probGoldWeeklyFail = 0.30
let probGoldMonthlyFail = 0.40
let probGoldThreeMonthFail = 0.50

// Calculate expected token payouts based on probabilities
let calculateExpectedPayout = (weeklyReward, monthlyReward, threeMonthReward=0.0, weeklyFail, monthlyFail, threeMonthFail=1.0) => {
  let weeklyPayout = weeklyReward *. 4.0 *. (1.0 -. weeklyFail)
  let monthlyPayout = monthlyReward *. (1.0 -. monthlyFail)
  let threeMonthPayout = threeMonthReward *. (1.0 -. threeMonthFail)
  weeklyPayout +. monthlyPayout +. threeMonthPayout
}

// Calculate total expected payout and burn across all tiers
let totalUsers = 1000
let expectedPayoutBasic = calculateExpectedPayout(basicWeeklyReward, basicMonthlyReward, 0.0, probBasicWeeklyFail, probBasicMonthlyFail) *. (float_of_int(totalUsers) *. ratioBasic)
let expectedPayoutSilver = calculateExpectedPayout(silverWeeklyReward, silverMonthlyReward, 0.0, probSilverWeeklyFail, probSilverMonthlyFail) *. (float_of_int(totalUsers) *. ratioSilver)
let expectedPayoutGold = calculateExpectedPayout(goldWeeklyReward, goldMonthlyReward, goldThreeMonthReward, probGoldWeeklyFail, probGoldMonthlyFail, probGoldThreeMonthFail) *. (float_of_int(totalUsers) *. ratioGold)

let totalExpectedPayout = expectedPayoutBasic +. expectedPayoutSilver +. expectedPayoutGold

// Assuming subscription fees are constant and known
let subscriptionFeeBasic = 10.0
let subscriptionFeeSilver = 15.0
let subscriptionFeeGold = 25.0

// Calculate total expected burn
let totalExpectedBurn = (subscriptionFeeBasic *. (float_of_int(totalUsers) *. ratioBasic)) +. (subscriptionFeeSilver *. (float_of_int(totalUsers) *. ratioSilver)) +. (subscriptionFeeGold *. (float_of_int(totalUsers) *. ratioGold))

// Check if the economy is balanced
let isEconomyBalanced = totalExpectedBurn >. totalExpectedPayout

```

## Model (TypeScript)

```typescript
// Define user distribution ratios
const ratioBasic: number = 0.5;
const ratioSilver: number = 0.3;
const ratioGold: number = 0.2;

// Define streak rewards
const basicWeeklyReward: number = 0.23;
const basicMonthlyReward: number = 2;
const silverWeeklyReward: number = 1;
const silverMonthlyReward: number = 5.67;
const goldWeeklyReward: number = 2;
const goldMonthlyReward: number = 16.33;
const goldThreeMonthReward: number = 25;

// Define probabilities of not completing streaks
const probBasicWeeklyFail: number = 0.7;
const probBasicMonthlyFail: number = 0.8;
const probSilverWeeklyFail: number = 0.5;
const probSilverMonthlyFail: number = 0.6;
const probGoldWeeklyFail: number = 0.3;
const probGoldMonthlyFail: number = 0.4;
const probGoldThreeMonthFail: number = 0.5;

// Calculate expected token payouts based on probabilities
const calculateExpectedPayout = (
  weeklyReward: number,
  monthlyReward: number,
  threeMonthReward: number = 0,
  weeklyFail: number,
  monthlyFail: number,
  threeMonthFail: number = 1
) => {
  const weeklyPayout = weeklyReward * 4 * (1 - weeklyFail);
  const monthlyPayout = monthlyReward * (1 - monthlyFail);
  const threeMonthPayout = threeMonthReward * (1 - threeMonthFail);
  return weeklyPayout + monthlyPayout + threeMonthPayout;
};

// Calculate total expected payout and burn across all tiers
const totalUsers: number = 1000;
const expectedPayoutBasic: number =
  calculateExpectedPayout(
    basicWeeklyReward,
    basicMonthlyReward,
    0,
    probBasicWeeklyFail,
    probBasicMonthlyFail
  ) *
  (totalUsers * ratioBasic);
const expectedPayoutSilver: number =
  calculateExpectedPayout(
    silverWeeklyReward,
    silverMonthlyReward,
    0,
    probSilverWeeklyFail,
    probSilverMonthlyFail
  ) *
  (totalUsers * ratioSilver);
const expectedPayoutGold: number =
  calculateExpectedPayout(
    goldWeeklyReward,
    goldMonthlyReward,
    goldThreeMonthReward,
    probGoldWeeklyFail,
    probGoldMonthlyFail,
    probGoldThreeMonthFail
  ) *
  (totalUsers * ratioGold);

const totalExpectedPayout: number =
  expectedPayoutBasic + expectedPayoutSilver + expectedPayoutGold;

// Assuming subscription fees are constant and known
const subscriptionFeeBasic: number = 10;
const subscriptionFeeSilver: number = 15;
const subscriptionFeeGold: number = 25;

// Calculate total expected burn
const totalExpectedBurn: number =
  subscriptionFeeBasic * (totalUsers * ratioBasic) +
  subscriptionFeeSilver * (totalUsers * ratioSilver) +
  subscriptionFeeGold * (totalUsers * ratioGold);

// Check if the economy is balanced
const isEconomyBalanced: boolean = totalExpectedBurn > totalExpectedPayout;
```
