// Frontend Integration Example for Referral System
// This shows how to integrate the referral system in your frontend

// 1. SIGNUP WITH REFERRAL CODE
async function signupWithReferral(userData, referralCode = null) {
  try {
    const signupData = {
      ...userData,
      referredBy: referralCode, // Include referral code in signup
    };

    const response = await fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();

    if (result.success) {
      console.log(
        "✅ User registered successfully with referral:",
        result.data
      );
      return result;
    } else {
      console.error("❌ Signup failed:", result.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Signup error:", error);
    return null;
  }
}

// 2. VALIDATE REFERRAL CODE (before signup)
async function validateReferralCode(code) {
  try {
    const response = await fetch(`/api/referral/validate-code/${code}`);
    const result = await response.json();

    if (result.success) {
      console.log("✅ Valid referral code from:", result.data.referrerName);
      return result.data;
    } else {
      console.log("❌ Invalid referral code");
      return null;
    }
  } catch (error) {
    console.error("❌ Validation error:", error);
    return null;
  }
}

// 3. GENERATE REFERRAL CODE (for logged-in users)
async function generateReferralCode(token) {
  try {
    const response = await fetch("/api/referral/generate-code", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Referral code generated:", result.data);
      return result.data;
    } else {
      console.error("❌ Failed to generate code:", result.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Generation error:", error);
    return null;
  }
}

// 4. GET USER'S REFERRAL STATS
async function getReferralStats(token) {
  try {
    const response = await fetch("/api/referral/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Referral stats:", result.data);
      return result.data;
    } else {
      console.error("❌ Failed to get stats:", result.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Stats error:", error);
    return null;
  }
}

// 5. ADMIN: GET ALL REFERRAL DATA
async function getAllReferralData(token, page = 1, limit = 10) {
  try {
    const response = await fetch(
      `/api/referral/admin/all?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ All referral data:", result.data);
      return result.data;
    } else {
      console.error("❌ Failed to get referral data:", result.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Admin data error:", error);
    return null;
  }
}

// 6. EXAMPLE USAGE IN SIGNUP FORM
function handleSignupForm() {
  // Get referral code from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get("ref");

  if (referralCode) {
    // Validate the referral code first
    validateReferralCode(referralCode).then((referrerData) => {
      if (referrerData) {
        // Show referral info to user
        document.getElementById(
          "referral-info"
        ).innerHTML = `🎉 You were referred by ${referrerData.referrerName}!`;
        document.getElementById("referral-code-input").value = referralCode;
      }
    });
  }
}

// 7. EXAMPLE USAGE IN USER DASHBOARD
async function loadUserReferralDashboard(token) {
  const stats = await getReferralStats(token);

  if (stats) {
    // Update UI with referral stats
    document.getElementById("referral-code").textContent =
      stats.referralCode || "Not generated";
    document.getElementById("total-referrals").textContent =
      stats.totalReferrals;
    document.getElementById(
      "total-earnings"
    ).textContent = `$${stats.totalEarnings}`;
    document.getElementById("share-url").value = stats.referralCode
      ? `${window.location.origin}/signup?ref=${stats.referralCode}`
      : "";
  }
}

// 8. EXAMPLE USAGE IN ADMIN PANEL
async function loadAdminReferralPanel(token) {
  const data = await getAllReferralData(token);

  if (data) {
    // Display summary stats
    document.getElementById("total-users-with-codes").textContent =
      data.summary.totalUsersWithReferralCodes;
    document.getElementById("total-referrals").textContent =
      data.summary.totalReferrals;
    document.getElementById(
      "total-earnings"
    ).textContent = `$${data.summary.totalEarnings}`;

    // Display users table
    const tableBody = document.getElementById("referral-users-table");
    tableBody.innerHTML = "";

    data.users.forEach((user) => {
      const row = `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.referralCode}</td>
          <td>${user.referredUsers.length}</td>
          <td>$${user.referralEarnings}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  }
}

// Export functions for use in your application
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    signupWithReferral,
    validateReferralCode,
    generateReferralCode,
    getReferralStats,
    getAllReferralData,
    handleSignupForm,
    loadUserReferralDashboard,
    loadAdminReferralPanel,
  };
}
