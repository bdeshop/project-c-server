// Admin Guide for Referral System Management
const axios = require("axios");

const BASE_URL = "http://localhost:8000/api";

// Example admin token - replace with real admin token
const ADMIN_TOKEN = "your-admin-jwt-token-here";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ADMIN_TOKEN}`,
};

async function adminReferralGuide() {
  console.log("🎯 Admin Referral System Management Guide\n");

  console.log("📋 Available Admin Operations:\n");

  // 1. Get System Overview
  console.log("1️⃣ GET SYSTEM OVERVIEW");
  console.log("   Endpoint: GET /api/referral/admin/system-overview");
  console.log(
    "   Purpose: See global settings, users with individual settings, statistics"
  );
  console.log("   Example:");
  console.log(
    '   curl -X GET "http://localhost:8000/api/referral/admin/system-overview" \\'
  );
  console.log('        -H "Authorization: Bearer YOUR_ADMIN_TOKEN"\n');

  // 2. Set Individual User Settings
  console.log("2️⃣ SET INDIVIDUAL USER SETTINGS");
  console.log("   Endpoint: PUT /api/referral/admin/user-settings/:userId");
  console.log(
    "   Purpose: Configure custom referral settings for specific users"
  );
  console.log("   Example for nayeem99:");
  console.log(
    '   curl -X PUT "http://localhost:8000/api/referral/admin/user-settings/USER_ID" \\'
  );
  console.log('        -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log("        -d '{");
  console.log('          "signupBonus": 343,');
  console.log('          "referralCommission": 34,');
  console.log('          "referralDepositBonus": 34,');
  console.log('          "minWithdrawAmount": 43,');
  console.log('          "minTransferAmount": 343,');
  console.log('          "maxCommissionLimit": 4,');
  console.log('          "useGlobalSettings": false');
  console.log("        }'\n");

  // 3. Get Impact Analysis
  console.log("3️⃣ GET IMPACT ANALYSIS");
  console.log("   Endpoint: GET /api/referral/admin/impact-analysis/:userId");
  console.log("   Purpose: See how a user's settings affect their referrals");
  console.log("   Example:");
  console.log(
    '   curl -X GET "http://localhost:8000/api/referral/admin/impact-analysis/USER_ID" \\'
  );
  console.log('        -H "Authorization: Bearer YOUR_ADMIN_TOKEN"\n');

  // 4. Update Global Settings
  console.log("4️⃣ UPDATE GLOBAL SETTINGS");
  console.log("   Endpoint: PUT /api/referral/settings");
  console.log("   Purpose: Set default values for all users");
  console.log("   Example:");
  console.log(
    '   curl -X PUT "http://localhost:8000/api/referral/settings" \\'
  );
  console.log('        -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log("        -d '{");
  console.log('          "signupBonus": 100,');
  console.log('          "referralCommission": 25,');
  console.log('          "referralDepositBonus": 50,');
  console.log('          "minWithdrawAmount": 100,');
  console.log('          "minTransferAmount": 50,');
  console.log('          "maxCommissionLimit": 1000');
  console.log("        }'\n");

  console.log("🎯 How Settings Work:\n");
  console.log("📊 REFERRER BENEFITS (What the referrer gets):");
  console.log(
    "   • signupBonus: Amount referrer earns when someone uses their code"
  );
  console.log("");
  console.log("👤 REFERRED USER BENEFITS (What new users get):");
  console.log(
    "   • referralCommission: Commission rate new user earns on activities"
  );
  console.log(
    "   • referralDepositBonus: Bonus new user gets on first deposit"
  );
  console.log("   • minWithdrawAmount: Minimum amount new user can withdraw");
  console.log("   • minTransferAmount: Minimum amount new user can transfer");
  console.log("   • maxCommissionLimit: Maximum commission new user can earn");
  console.log("");
  console.log("⚙️ CONTROL SETTING:");
  console.log(
    "   • useGlobalSettings: true = use global settings, false = use individual settings"
  );

  console.log("\n🔄 Typical Admin Workflow:\n");
  console.log("1. Check system overview to see current state");
  console.log("2. Identify users who need custom settings");
  console.log("3. Set individual settings for those users");
  console.log("4. Monitor impact using impact analysis");
  console.log("5. Adjust global settings as needed");

  console.log("\n✅ Example: Setting up nayeem99 as a premium referrer:\n");
  console.log(
    "Goal: nayeem99 gets higher signup bonus, referred users get better rates"
  );
  console.log("Settings:");
  console.log("  - signupBonus: 343 (nayeem99 gets 343 per referral)");
  console.log("  - referralCommission: 34 (referred users get 34% commission)");
  console.log(
    "  - referralDepositBonus: 34 (referred users get 34 deposit bonus)"
  );
  console.log("  - Higher limits for referred users");
  console.log("  - useGlobalSettings: false (use these custom settings)");

  console.log("\n🧪 Testing:\n");
  console.log("Use the test endpoint to verify settings:");
  console.log(
    'curl -X POST "http://localhost:8000/api/referral/test-login" \\'
  );
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email": "referred-user@example.com"}\'');
}

// Run the guide
adminReferralGuide();
