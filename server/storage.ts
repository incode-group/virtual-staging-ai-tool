import { type StagingProject, type InsertStagingProject, stagingProjects } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createStagingProject(project: InsertStagingProject): Promise<StagingProject>;
  getStagingProject(id: number): Promise<StagingProject | undefined>;
  getAllStagingProjects(): Promise<StagingProject[]>;
  updateStagingProject(id: number, data: Partial<StagingProject>): Promise<StagingProject | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createStagingProject(project: InsertStagingProject): Promise<StagingProject> {
    const [result] = await db.insert(stagingProjects).values(project).returning();
    return result;
  }

  async getStagingProject(id: number): Promise<StagingProject | undefined> {
    const [result] = await db.select().from(stagingProjects).where(eq(stagingProjects.id, id));
    return result;
  }

  async getAllStagingProjects(): Promise<StagingProject[]> {
    return db.select().from(stagingProjects).orderBy(desc(stagingProjects.createdAt));
  }

  async updateStagingProject(id: number, data: Partial<StagingProject>): Promise<StagingProject | undefined> {
    const [result] = await db.update(stagingProjects).set(data).where(eq(stagingProjects.id, id)).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
