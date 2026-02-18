import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openai } from "./replit_integrations/image/client";
import { toFile } from "openai";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(express.json({ limit: "50mb" }));

  app.get("/api/staging", async (_req, res) => {
    try {
      const projects = await storage.getAllStagingProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching staging projects:", error);
      res.status(500).json({ error: "Failed to fetch staging projects" });
    }
  });

  app.get("/api/staging/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getStagingProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching staging project:", error);
      res.status(500).json({ error: "Failed to fetch staging project" });
    }
  });

  app.post("/api/staging", async (req, res) => {
    try {
      const { image, roomType, style } = req.body;

      if (!image || typeof image !== "string") {
        return res.status(400).json({ error: "A valid base64 image is required" });
      }
      if (!roomType || typeof roomType !== "string") {
        return res.status(400).json({ error: "Room type is required" });
      }
      if (!style || typeof style !== "string") {
        return res.status(400).json({ error: "Design style is required" });
      }

      const maxBase64Size = 15 * 1024 * 1024;
      if (image.length > maxBase64Size) {
        return res.status(400).json({ error: "Image is too large. Please use an image under 10MB." });
      }

      const project = await storage.createStagingProject({
        originalImage: image,
        roomType,
        style,
      });

      await storage.updateStagingProject(project.id, { status: "processing" });

      try {
        const prompt = `You are a professional interior designer. Take this photo of an empty ${roomType.toLowerCase()} and add beautiful, realistic ${style.toLowerCase()} style furniture and decor. Include appropriate furniture like ${getFurnitureForRoom(roomType)}, all in a cohesive ${style.toLowerCase()} aesthetic. The furniture should look naturally placed and the lighting should match the room. Make it look like a real professionally staged room, photorealistic quality.`;

        const imageBuffer = Buffer.from(image, "base64");
        const uploadableImage = await toFile(imageBuffer, "room.png", { type: "image/png" });

        const response = await openai.images.edit({
          model: "gpt-image-1",
          image: [uploadableImage],
          prompt,
          size: "1024x1024",
        });

        const stagedImageBase64 = response.data?.[0]?.b64_json ?? "";

        if (!stagedImageBase64) {
          await storage.updateStagingProject(project.id, { status: "failed" });
          return res.status(500).json({ error: "AI returned empty result. Please try again." });
        }

        const updatedProject = await storage.updateStagingProject(project.id, {
          stagedImage: stagedImageBase64,
          status: "completed",
        });

        if (!updatedProject) {
          return res.status(500).json({ error: "Failed to save staged result." });
        }

        res.json(updatedProject);
      } catch (aiError: any) {
        console.error("AI staging error:", aiError);
        await storage.updateStagingProject(project.id, { status: "failed" });
        const errorMessage = aiError?.error?.message || aiError?.message || "AI staging failed. Please try again.";
        const userMessage = errorMessage.includes("Invalid image")
          ? "The image format is not supported. Please upload a valid JPEG or PNG photo."
          : "AI staging failed. Please try again.";
        res.status(500).json({ error: userMessage });
      }
    } catch (error) {
      console.error("Error creating staging project:", error);
      res.status(500).json({ error: "Failed to create staging project" });
    }
  });

  return httpServer;
}

function getFurnitureForRoom(roomType: string): string {
  const furniture: Record<string, string> = {
    "Living Room": "a sofa, coffee table, side tables, area rug, floor lamp, and decorative accessories",
    "Bedroom": "a bed with bedding, nightstands, dresser, area rug, and bedside lamps",
    "Kitchen": "bar stools, pendant lights, kitchen accessories, and decorative items on counters",
    "Dining Room": "a dining table with chairs, centerpiece, chandelier, and a sideboard or buffet",
    "Bathroom": "towels, bathroom accessories, a bath mat, and decorative items",
    "Home Office": "a desk, office chair, bookshelf, desk lamp, and organizational accessories",
  };
  return furniture[roomType] || "appropriate furniture and decor";
}
