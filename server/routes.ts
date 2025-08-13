import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertClientSchema, 
  insertCaseSchema, 
  insertTaskSchema, 
  insertDocumentSchema 
} from "@shared/schema";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document formats
    const allowedTypes = /\.(pdf|doc|docx|txt|jpg|jpeg|png)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "ليس لديك صلاحية" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Clients routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const { search } = req.query;
      const clients = search 
        ? await storage.searchClients(search as string)
        : await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب العملاء" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب العميل" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }
      
      const clientData = insertClientSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const client = await storage.createClient(clientData);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "client_created",
        tableName: "clients",
        recordId: client.id,
        newValues: JSON.stringify(client),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "بيانات العميل غير صحيحة" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const existingClient = await storage.getClient(req.params.id);
      if (!existingClient) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }

      const clientData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(req.params.id, clientData);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "client_updated",
        tableName: "clients",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingClient),
        newValues: JSON.stringify(updatedClient),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(updatedClient);
    } catch (error) {
      res.status(400).json({ message: "بيانات العميل غير صحيحة" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const existingClient = await storage.getClient(req.params.id);
      if (!existingClient) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }

      await storage.deleteClient(req.params.id);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "client_deleted",
        tableName: "clients",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingClient),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف العميل" });
    }
  });

  // Cases routes
  app.get("/api/cases", requireAuth, async (req, res) => {
    try {
      const { search, client, lawyer } = req.query;
      let cases;
      
      if (search) {
        cases = await storage.searchCases(search as string);
      } else if (client) {
        cases = await storage.getCasesByClient(client as string);
      } else if (lawyer) {
        cases = await storage.getCasesByLawyer(lawyer as string);
      } else {
        cases = await storage.getCases();
      }
      
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب القضايا" });
    }
  });

  app.get("/api/cases/:id", requireAuth, async (req, res) => {
    try {
      const caseData = await storage.getCase(req.params.id);
      if (!caseData) {
        return res.status(404).json({ message: "القضية غير موجودة" });
      }
      res.json(caseData);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب القضية" });
    }
  });

  app.post("/api/cases", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }
      
      const caseData = insertCaseSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const newCase = await storage.createCase(caseData);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "case_created",
        tableName: "cases",
        recordId: newCase.id,
        newValues: JSON.stringify(newCase),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(newCase);
    } catch (error) {
      res.status(400).json({ message: "بيانات القضية غير صحيحة" });
    }
  });

  app.put("/api/cases/:id", requireAuth, async (req, res) => {
    try {
      const existingCase = await storage.getCase(req.params.id);
      if (!existingCase) {
        return res.status(404).json({ message: "القضية غير موجودة" });
      }

      const caseData = insertCaseSchema.partial().parse(req.body);
      const updatedCase = await storage.updateCase(req.params.id, caseData);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "case_updated",
        tableName: "cases",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingCase),
        newValues: JSON.stringify(updatedCase),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(updatedCase);
    } catch (error) {
      res.status(400).json({ message: "بيانات القضية غير صحيحة" });
    }
  });

  app.delete("/api/cases/:id", requireAuth, async (req, res) => {
    try {
      const existingCase = await storage.getCase(req.params.id);
      if (!existingCase) {
        return res.status(404).json({ message: "القضية غير موجودة" });
      }

      await storage.deleteCase(req.params.id);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "case_deleted",
        tableName: "cases",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingCase),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف القضية" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const { caseId, userId } = req.query;
      let tasks;
      
      if (caseId) {
        tasks = await storage.getTasksByCase(caseId as string);
      } else if (userId) {
        tasks = await storage.getTasksByUser(userId as string);
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المهام" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const task = await storage.createTask(taskData);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "task_created",
        tableName: "tasks",
        recordId: task.id,
        newValues: JSON.stringify(task),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "بيانات المهمة غير صحيحة" });
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const existingTask = await storage.getTask(req.params.id);
      if (!existingTask) {
        return res.status(404).json({ message: "المهمة غير موجودة" });
      }

      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(req.params.id, taskData);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "task_updated",
        tableName: "tasks",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingTask),
        newValues: JSON.stringify(updatedTask),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "بيانات المهمة غير صحيحة" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const existingTask = await storage.getTask(req.params.id);
      if (!existingTask) {
        return res.status(404).json({ message: "المهمة غير موجودة" });
      }

      await storage.deleteTask(req.params.id);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "task_deleted",
        tableName: "tasks",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingTask),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المهمة" });
    }
  });

  // Documents routes
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const { caseId, clientId } = req.query;
      let documents;
      
      if (caseId) {
        documents = await storage.getDocumentsByCase(caseId as string);
      } else if (clientId) {
        documents = await storage.getDocumentsByClient(clientId as string);
      } else {
        documents = await storage.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المستندات" });
    }
  });

  app.post("/api/documents/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const { title, documentType, caseId, clientId } = req.body;
      
      const documentData = insertDocumentSchema.parse({
        title: title || req.file.originalname,
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
        documentType,
        caseId: caseId || null,
        clientId: clientId || null,
        uploadedBy: req.user?.id || '',
      });

      const document = await storage.createDocument(documentData);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "document_uploaded",
        tableName: "documents",
        recordId: document.id,
        newValues: JSON.stringify(document),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "خطأ في رفع المستند" });
    }
  });

  app.get("/api/documents/:id/download", requireAuth, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "المستند غير موجود" });
      }

      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ message: "الملف غير موجود" });
      }

      res.download(document.filePath, document.filename);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحميل المستند" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "المستند غير موجود" });
      }

      // Delete file from filesystem
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      await storage.deleteDocument(req.params.id);
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "document_deleted",
        tableName: "documents",
        recordId: req.params.id,
        oldValues: JSON.stringify(document),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المستند" });
    }
  });

  // Users routes (admin only)
  app.get("/api/users", requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })));
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.put("/api/users/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const { fullName, role, isActive } = req.body;
      const existingUser = await storage.getUser(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const updatedUser = await storage.updateUser(req.params.id, {
        fullName,
        role,
        isActive,
      });
      
      if (!req.user) {
        return res.status(401).json({ message: "غير مخول" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "user_updated",
        tableName: "users",
        recordId: req.params.id,
        oldValues: JSON.stringify(existingUser),
        newValues: JSON.stringify(updatedUser),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    } catch (error) {
      res.status(400).json({ message: "بيانات المستخدم غير صحيحة" });
    }
  });

  // Audit logs routes (admin only)
  app.get("/api/audit-logs", requireRole(["admin"]), async (req, res) => {
    try {
      const { userId } = req.query;
      const logs = userId 
        ? await storage.getAuditLogsByUser(userId as string)
        : await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب سجل الأنشطة" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
