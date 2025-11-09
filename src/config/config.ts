interface DatabaseOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

interface MongoDBConfig {
  uri: string;
  options: DatabaseOptions;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface SecurityConfig {
  bcryptRounds: number;
}

interface BettingConfig {
  minBetAmount: number;
  maxBetAmount: number;
  defaultUserBalance: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface Config {
  port: number;
  mongodb: MongoDBConfig;
  jwt: JWTConfig;
  email: EmailConfig;
  security: SecurityConfig;
  betting: BettingConfig;
  rateLimit: RateLimitConfig;
}

const config: { [key: string]: Config } = {
  development: {
    port: parseInt(process.env.PORT || "8000"),
    mongodb: {
      uri:
        process.env.MONGODB_URI ||
        "mongodb+srv://Nayeem:8WQWMk-vvbr4adt@cluster0.qwxgjf9.mongodb.net/betDashboard?retryWrites=true&w=majority",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET || "fallback-secret-key",
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
    email: {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
    },
    betting: {
      minBetAmount: parseFloat(process.env.MIN_BET_AMOUNT || "1"),
      maxBetAmount: parseFloat(process.env.MAX_BET_AMOUNT || "10000"),
      defaultUserBalance: parseFloat(process.env.DEFAULT_USER_BALANCE || "100"),
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    },
  },
  production: {
    port: parseInt(process.env.PORT || "8000"),
    mongodb: {
      uri: process.env.MONGODB_URI || "mongodb://localhost:27017/betting-site",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET || "production-secret-key",
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
    email: {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
    },
    betting: {
      minBetAmount: parseFloat(process.env.MIN_BET_AMOUNT || "1"),
      maxBetAmount: parseFloat(process.env.MAX_BET_AMOUNT || "10000"),
      defaultUserBalance: parseFloat(process.env.DEFAULT_USER_BALANCE || "100"),
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    },
  },
};

const env: string = process.env.NODE_ENV || "development";

export default config[env];
