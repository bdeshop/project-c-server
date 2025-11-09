# Comprehensive Referral System Documentation

## System Overview

This referral system provides complete control over referral relationships, earnings, and user benefits. It's designed to be flexible, scalable, and easy to manage from both admin and user perspectives.

## How It Works

### Core Concept

When **User A** has referral settings configured, those settings control what happens when someone uses **User A's referral code**.

### Flow Breakdown

1. **User A** gets individual referral settings configured by admin
2. **User B** signs up using **User A's** referral code
3. **User A** gets the `signupBonus` immediately
4. **User B** gets the benefits defined in **User A's** settings:
   - `referralCommission`: Commission rate **User B** earns on activities
   - `referralDepositBonus`: Bonus **User B** gets on first deposit
   - `minWithdrawAmount`: Minimum **User B** can withdraw
   - `minTransferAmount`: Minimum **User B** can transfer
   - `maxCommissionLimit`: Maximum commission **User B** can earn

## Settings Breakdown

### For Referrer (User A)

```json
{
  "signupBonus": 343 // User A gets 343 when someone uses their code
}
```

### For Referred User (User B)

```json
{
  "referralCommission": 34, // User B earns 34% commission on activities
  "referralDepositBonus": 34, // User B gets 34 bonus on first deposit
  "minWithdrawAmount": 43, // User B needs minimum 43 to withdraw
  "minTransferAmount": 343, // User B needs minimum 343 to transfer
  "maxCommissionLimit": 4 // User B can earn maximum 4 in commissions
}
```

## API Endpoints

### Admin Endpoints

#### 1. System Overview

```
GET /api/referral/admin/system-overview
```

Returns complete system overview including:

- Global settings
- Users with individual settings
- System statistics
- How the system works explanation

#### 2. Set User Referral Settings

```
PUT /api/referral/admin/user-settings/:userId
```

Body:

```json
{
  "signupBonus": 343,
  "referralCommission": 34,
  "referralDepositBonus": 34,
  "minWithdrawAmount": 43,
  "minTransferAmount": 343,
  "maxCommissionLimit": 4,
  "useGlobalSettings": false
}
```

#### 3. Impact Analysis

```
GET /api/referral/admin/impact-analysis/:userId
```

Shows the impact of a user's referral settings:

- How many users they've referred
- Total earnings from referrals
- Current settings and their effects

### User Endpoints

#### 1. Login (Enhanced)

```
POST /api/users/login
```

Now returns referral settings based on who referred the user:

- If not referred: No referral settings
- If referred: Settings from their referrer

#### 2. Test Login Logic

```
POST /api/referral/test-login
```

Body: `{ "email": "user@example.com" }`
Shows what referral settings a user would see and why.

## Admin Control Features

### 1. Global Settings Management

- Set default values for all users
- Control system-wide referral behavior
- Override individual settings when needed

### 2. Individual User Control

- Set custom referral settings for specific users
- See impact of changes before applying
- View all users affected by changes

### 3. Monitoring & Analytics

- Track referral performance
- Monitor earnings and relationships
- Analyze system usage patterns

## User Experience

### For Referrers

1. Get individual settings configured by admin
2. Share referral code with others
3. Earn signup bonus when someone uses their code
4. Track their referrals and earnings

### For Referred Users

1. Sign up with referral code
2. Get benefits based on referrer's settings
3. See their commission rates and limits in login response
4. Can also become referrers themselves

### For Non-Referred Users

1. Sign up normally without referral code
2. No referral settings in login response
3. Can still become referrers by getting a referral code

## Example Scenarios

### Scenario 1: nayeem99 with Individual Settings

```json
{
  "signupBonus": 343,
  "referralCommission": 34,
  "referralDepositBonus": 34,
  "minWithdrawAmount": 43,
  "minTransferAmount": 343,
  "maxCommissionLimit": 4,
  "useGlobalSettings": false
}
```

**When someone signs up with nayeem99's code:**

- nayeem99 gets 343 signup bonus
- New user gets 34% commission rate
- New user gets 34 bonus on first deposit
- New user has 43 min withdraw, 343 min transfer, 4 max commission

### Scenario 2: Global Settings User

```json
{
  "useGlobalSettings": true
}
```

**When someone signs up with this user's code:**

- Uses global system settings for all values
- Consistent experience across all referrals

## Database Structure

### User Model Updates

```typescript
individualReferralSettings: {
  // PARENT EARNINGS
  signupBonus: number; // What THIS user gets when someone uses their code

  // REFERRED USER BENEFITS
  referralCommission: number; // Commission rate the NEW user will earn
  referralDepositBonus: number; // Bonus the NEW user gets on deposit
  minWithdrawAmount: number; // Min withdraw for NEW user
  minTransferAmount: number; // Min transfer for NEW user
  maxCommissionLimit: number; // Max commission for NEW user

  // CONTROL
  useGlobalSettings: boolean; // If true, ignore individual settings
}
```

## Benefits of This System

### 1. Complete Control

- Admins can customize referral experience per user
- Fine-grained control over all aspects of referrals
- Easy to modify and scale

### 2. Clear Separation

- Parent earnings vs referred user benefits are clearly separated
- No confusion about who gets what
- Easy to understand and explain

### 3. Flexibility

- Can use global settings or individual settings
- Easy to switch between modes
- Supports complex referral strategies

### 4. Monitoring

- Complete visibility into referral relationships
- Impact analysis for changes
- Performance tracking

### 5. User-Friendly

- Clear explanations in API responses
- Test endpoints for verification
- Comprehensive documentation

## Future Enhancements

1. **Tiered Referrals**: Multi-level referral systems
2. **Time-Based Settings**: Settings that change over time
3. **Conditional Settings**: Settings based on user behavior
4. **Automated Rules**: AI-driven referral optimization
5. **Advanced Analytics**: Detailed performance metrics

## Testing

Use the test endpoint to verify behavior:

```bash
curl -X POST http://localhost:8000/api/referral/test-login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

This will show:

- Whether user was referred
- What settings they see
- Source of those settings
- Explanation of the logic
