import { body } from "express-validator";

// Validation rules for theme configuration
export const themeConfigValidation = [
  // Site Info validation
  body("siteInfo.logo")
    .optional({ nullable: true })
    .isURL()
    .withMessage("Logo must be a valid URL"),
  body("siteInfo.favicon")
    .optional({ nullable: true })
    .isURL()
    .withMessage("Favicon must be a valid URL"),

  // Header validation
  body("header.bgColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Header background color must be a valid hex color"),
  body("header.textColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Header text color must be a valid hex color"),
  body("header.fontSize")
    .optional({ nullable: true })
    .matches(/^([0-9]+(px|em|rem|%))$/)
    .withMessage("Header font size must be a valid CSS size value"),
  body("header.logoWidth")
    .optional({ nullable: true })
    .matches(/^([0-9]+(px|em|rem|%))$/)
    .withMessage("Logo width must be a valid CSS size value"),
  body("header.loginButtonBg")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Login button background color must be a valid hex color"),
  body("header.loginButtonTextColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Login button text color must be a valid hex color"),
  body("header.signupButtonBg")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Signup button background color must be a valid hex color"),
  body("header.signupButtonTextColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Signup button text color must be a valid hex color"),

  // Web Menu validation
  body("webMenu.bgColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Web menu background color must be a valid hex color"),
  body("webMenu.textColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Web menu text color must be a valid hex color"),
  body("webMenu.fontSize")
    .optional({ nullable: true })
    .matches(/^([0-9]+(px|em|rem|%))$/)
    .withMessage("Web menu font size must be a valid CSS size value"),
  body("webMenu.hoverColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Web menu hover color must be a valid hex color"),
  body("webMenu.activeColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Web menu active color must be a valid hex color"),

  // Mobile Menu validation
  body("mobileMenu.bgColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Mobile menu background color must be a valid hex color"),
  body("mobileMenu.textColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Mobile menu text color must be a valid hex color"),
  body("mobileMenu.fontSize")
    .optional({ nullable: true })
    .matches(/^([0-9]+(px|em|rem|%))$/)
    .withMessage("Mobile menu font size must be a valid CSS size value"),
  body("mobileMenu.loginButtonBg")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Mobile menu login button background color must be a valid hex color"),
  body("mobileMenu.loginButtonTextColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Mobile menu login button text color must be a valid hex color"),
  body("mobileMenu.signupButtonBg")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Mobile menu signup button background color must be a valid hex color"),
  body("mobileMenu.signupButtonTextColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Mobile menu signup button text color must be a valid hex color"),

  // Font Settings validation
  body("fontSettings.globalFontFamily")
    .optional({ nullable: true })
    .isString()
    .withMessage("Global font family must be a string"),
  body("fontSettings.globalTextColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Global text color must be a valid hex color"),
  body("fontSettings.headingFontSize")
    .optional({ nullable: true })
    .matches(/^([0-9]+(px|em|rem|%))$/)
    .withMessage("Heading font size must be a valid CSS size value"),
  body("fontSettings.paragraphFontSize")
    .optional({ nullable: true })
    .matches(/^([0-9]+(px|em|rem|%))$/)
    .withMessage("Paragraph font size must be a valid CSS size value"),

  // Footer validation
  body("footer.bgColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Footer background color must be a valid hex color"),
  body("footer.textColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Footer text color must be a valid hex color"),
  body("footer.linkHoverColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Footer link hover color must be a valid hex color"),

  // Custom Sections validation
  body("customSections.topWinners.cardBgColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Top winners card background color must be a valid hex color"),
  body("customSections.topWinners.cardTextColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Top winners card text color must be a valid hex color"),
  body("customSections.upcomingMatches.cardBgColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Upcoming matches card background color must be a valid hex color"),
  body("customSections.upcomingMatches.borderColor")
    .optional({ nullable: true })
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Upcoming matches border color must be a valid hex color"),

  // isActive validation
  body("isActive")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];