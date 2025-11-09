import { body } from "express-validator";

export const signupValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Username must be between 1 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Country must be between 2 and 100 characters"),

  body("currency")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("Currency must be between 2 and 10 characters"),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("player_id").optional().trim(), // Make player_id optional since controller can generate it

  body("promoCode").optional().trim(),

  body("bonusSelection").optional().trim(),

  body("birthday").optional().trim(),
  
  // Referral code field
  body("referredBy").optional().trim(),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

export const updateUserValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Username must be between 1 and 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Country must be between 2 and 100 characters"),

  body("currency")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("Currency must be between 2 and 10 characters"),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("phoneNumberOTP")
    .optional()
    .isNumeric()
    .withMessage("Phone number OTP must be a number"),

  body("phoneNumberVerified")
    .optional()
    .isBoolean()
    .withMessage("Phone number verified must be a boolean value"),

  body("player_id").optional().trim(),

  body("promoCode").optional().trim(),

  body("isVerified")
    .optional()
    .isBoolean()
    .withMessage("isVerified must be a boolean value"),

  body("emailVerifyOTP")
    .optional()
    .isNumeric()
    .withMessage("Email verify OTP must be a number"),

  body("emailVerified")
    .optional()
    .isBoolean()
    .withMessage("Email verified must be a boolean value"),

  body("status")
    .optional()
    .isIn(["active", "banned", "deactivated"])
    .withMessage("Status must be 'active', 'banned', or 'deactivated'"),

  body("balance")
    .optional()
    .isNumeric()
    .withMessage("Balance must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Balance cannot be negative");
      }
      return true;
    }),

  body("deposit")
    .optional()
    .isNumeric()
    .withMessage("Deposit must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Deposit cannot be negative");
      }
      return true;
    }),

  body("withdraw")
    .optional()
    .isNumeric()
    .withMessage("Withdraw must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Withdraw cannot be negative");
      }
      return true;
    }),

  body("bonusSelection").optional().trim(),

  body("birthday").optional().trim(),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),

  body("profileImage").optional().trim(),
];

// Add validation for change password
export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 6 })
    .withMessage("Current password must be at least 6 characters"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

// Settings validation
export const updateSettingsValidation = [
  body("organizationName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Organization name must be between 1 and 100 characters"),

  body("organizationImage")
    .optional()
    .trim()
    .matches(
      /^(https?:\/\/.*(?:\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/
    )
    .withMessage("Please provide a valid image URL or base64 data URL"),

  body("themeColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code (e.g., #FF5733)"),

  body("primaryColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("secondaryColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("accentColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("logoUrl")
    .optional()
    .trim()
    .matches(
      /^(https?:\/\/.*(?:\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/
    )
    .withMessage("Please provide a valid logo URL or base64 data URL"),

  body("faviconUrl")
    .optional()
    .trim()
    .matches(
      /^(https?:\/\/.*(?:\.(?:ico|png|jpg|jpeg|gif|svg)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/
    )
    .withMessage("Please provide a valid favicon URL or base64 data URL"),

  body("supportEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid support email address")
    .normalizeEmail(),

  body("supportPhone")
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),

  body("websiteUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid website URL"),

  body("socialLinks.facebook")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?facebook\.com\/.+/)
    .withMessage("Please provide a valid Facebook URL"),

  body("socialLinks.twitter")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/)
    .withMessage("Please provide a valid Twitter/X URL"),

  body("socialLinks.instagram")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?instagram\.com\/.+/)
    .withMessage("Please provide a valid Instagram URL"),

  body("socialLinks.linkedin")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.+/)
    .withMessage("Please provide a valid LinkedIn URL"),

  body("maintenanceMode")
    .optional()
    .isBoolean()
    .withMessage("Maintenance mode must be a boolean value"),

  body("registrationEnabled")
    .optional()
    .isBoolean()
    .withMessage("Registration enabled must be a boolean value"),

  body("emailVerificationRequired")
    .optional()
    .isBoolean()
    .withMessage("Email verification required must be a boolean value"),

  body("twoFactorEnabled")
    .optional()
    .isBoolean()
    .withMessage("Two factor enabled must be a boolean value"),

  body("maxLoginAttempts")
    .optional()
    .isInt({ min: 3, max: 10 })
    .withMessage("Max login attempts must be between 3 and 10"),

  body("sessionTimeout")
    .optional()
    .isInt({ min: 15, max: 1440 })
    .withMessage("Session timeout must be between 15 and 1440 minutes"),
];

export const updateThemeValidation = [
  body("themeColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code (e.g., #FF5733)"),

  body("primaryColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("secondaryColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("accentColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),
];

export const updateOrganizationValidation = [
  body("organizationName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Organization name must be between 1 and 100 characters"),

  body("organizationImage")
    .optional()
    .trim()
    .matches(
      /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp)|data:image\/[a-z]+;base64,)/
    )
    .withMessage("Please provide a valid image URL or base64 data URL"),

  body("logoUrl")
    .optional()
    .trim()
    .matches(
      /^(https?:\/\/.*(?:\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/
    )
    .withMessage("Please provide a valid logo URL or base64 data URL"),

  body("faviconUrl")
    .optional()
    .trim()
    .matches(
      /^(https?:\/\/.*(?:\.(?:ico|png|jpg|jpeg|gif|svg)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/
    )
    .withMessage("Please provide a valid favicon URL or base64 data URL"),

  body("supportEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid support email address")
    .normalizeEmail(),

  body("supportPhone")
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),

  body("websiteUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid website URL"),
];

// UI Settings validation
export const updateUISettingsValidation = [
  body("headerColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("headerLoginSignupButtonBgColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("headerLoginSignupButtonTextColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("webMenuBgColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("webMenuTextColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("webMenuFontSize")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Font size cannot exceed 20 characters"),

  body("webMenuHoverColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("mobileMenuLoginSignupButtonBgColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("mobileMenuLoginSignupButtonTextColor")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Please provide a valid hex color code"),

  body("mobileMenuFontSize")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Font size cannot exceed 20 characters"),

  body("footerText")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Footer text cannot exceed 500 characters"),

  body("footerSocialLinks.facebook")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?facebook\.com\/.+/)
    .withMessage("Please provide a valid Facebook URL"),

  body("footerSocialLinks.twitter")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/)
    .withMessage("Please provide a valid Twitter/X URL"),

  body("footerSocialLinks.instagram")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?instagram\.com\/.+/)
    .withMessage("Please provide a valid Instagram URL"),

  body("footerSocialLinks.linkedin")
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.+/)
    .withMessage("Please provide a valid LinkedIn URL"),
];

// Landing Page Navigation Items validation
export const updateNavigationItemsValidation = [
  body("navigationItems")
    .optional()
    .isArray()
    .withMessage("Navigation items must be an array"),

  body("navigationItems.*.id")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Navigation item ID is required"),

  body("navigationItems.*.label")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Navigation item label is required")
    .isLength({ max: 50 })
    .withMessage("Navigation item label cannot exceed 50 characters"),

  body("navigationItems.*.url")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Navigation item URL is required"),

  body("navigationItems.*.order")
    .optional()
    .isInt()
    .withMessage("Navigation item order must be a number"),

  // Submenu validation
  body("navigationItems.*.submenu")
    .optional()
    .isArray()
    .withMessage("Submenu must be an array"),

  body("navigationItems.*.submenu.*.id")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Submenu item ID is required"),

  body("navigationItems.*.submenu.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Submenu item name is required")
    .isLength({ max: 50 })
    .withMessage("Submenu item name cannot exceed 50 characters"),

  body("navigationItems.*.submenu.*.path")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Submenu item path is required"),

  body("navigationItems.*.submenu.*.icon")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Submenu item icon cannot exceed 200 characters"),
];
