import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStoreSession = MemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fallback-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        if (!user.isActive) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, fullName, username, role = "secretary" } = req.body;
      
      if (!email || !password || !fullName || !username) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      const user = await storage.createUser({
        email,
        username,
        fullName,
        role: role as "admin" | "lawyer" | "secretary",
        password: await hashPassword(password),
        isActive: true,
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "user_registered",
        tableName: "users",
        recordId: user.id,
        newValues: JSON.stringify({ email: user.email, fullName: user.fullName, role: user.role }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: user.id, 
          email: user.email, 
          fullName: user.fullName, 
          username: user.username,
          role: user.role,
          isActive: user.isActive 
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    await storage.createAuditLog({
      userId: req.user!.id,
      action: "user_login",
      tableName: "users",
      recordId: req.user!.id,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      id: req.user!.id,
      email: req.user!.email,
      fullName: req.user!.fullName,
      username: req.user!.username,
      role: req.user!.role,
      isActive: req.user!.isActive,
    });
  });

  app.post("/api/logout", async (req, res, next) => {
    if (req.user) {
      await storage.createAuditLog({
        userId: req.user.id,
        action: "user_logout",
        tableName: "users",
        recordId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json({
      id: req.user!.id,
      email: req.user!.email,
      fullName: req.user!.fullName,
      username: req.user!.username,
      role: req.user!.role,
      isActive: req.user!.isActive,
    });
  });
}
