import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/database";
import config from "./config/config";
import userRoutes from "./routes/userRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import sliderRoutes from "./routes/sliderRoutes";
import topWinnerRoutes from "./routes/topWinnerRoutes";
import upcomingMatchRoutes from "./routes/upcomingMatchRoutes";
import bannerTextRoutes from "./routes/bannerTextRoutes";
import promoSectionRoutes from "./routes/promoSectionRoutes";
import themeConfigRoutes from "./routes/themeConfigRoutes";
import referralRoutes from "./routes/referralRoutes";
import paymentMethodRoutes from "./routes/paymentMethodRoutes";
import promotionRoutes from "./routes/promotionRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import contactRoutes from "./routes/contactRoutes";
import apkRoutes from "./routes/apkRoutes";
import withdrawalMethodRoutes from "./routes/withdrawalMethodRoutes";
import { handleMulterError } from "./middleware/multer";

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const server = createServer(app);

// Get frontend URLs from environment or use defaults
const getFrontendUrls = (): string[] => {
  const urlsString =
    process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173,http://localhost:3000,http://localhost:8080";
  return urlsString.split(",").map((url) => url.trim());
};

const frontendUrls = getFrontendUrls();

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: frontendUrls,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration with more permissive settings for all routes
const corsOptions = {
  origin: frontendUrls,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// More permissive rate limiting to prevent "Too many requests" error
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Multer error handling middleware
app.use(handleMulterError);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/top-winners", topWinnerRoutes);
app.use("/api/upcoming-matches", upcomingMatchRoutes);
app.use("/api/banner-text", bannerTextRoutes);
app.use("/api/promo-section", promoSectionRoutes);
app.use("/api/theme-config", themeConfigRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/withdrawal-methods", withdrawalMethodRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/apk", apkRoutes);

// Enhanced static file serving with comprehensive CORS support
app.use(
  "/upload",
  (req, res, next) => {
    // Set CORS headers for static files
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Set cache headers for better performance
    res.header("Cache-Control", "public, max-age=31536000"); // 1 year cache
    res.header("Expires", new Date(Date.now() + 31536000000).toUTCString());

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }

    next();
  },
  cors(corsOptions),
  express.static("upload", {
    // Additional static file options
    maxAge: "1y", // Cache for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set content type based on file extension
      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (path.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (path.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      } else if (path.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      }
    },
  })
);

// Serve APK files statically (optional - for direct access)
app.use(
  "/apk",
  cors(corsOptions),
  express.static("apk", {
    setHeaders: (res, path) => {
      if (path.endsWith(".apk")) {
        res.setHeader(
          "Content-Type",
          "application/vnd.android.package-archive"
        );
      }
    },
  })
);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Betting Site Backend API",
    version: "1.0.0",
    status: "Running",
    port: config.port,
    cors: {
      allowedOrigins: frontendUrls,
      frontendConnected: true,
    },
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Example event handlers
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  // You can add more socket event handlers here
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO enabled with CORS for: ${frontendUrls.join(", ")}`);
});
