import { PrismaClient, Team, Game } from '@prisma/client';

// Use a global variable to prevent multiple instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class TeamService {
    /**
     * Get a team by its slug/name
     */
    async getTeamBySlug(slug: string): Promise<Team | null> {
        // Normalizing slug back to potential name or query
        // This is simple for now, but might need better slug logic in DB
        const namePart = slug.split('-')[0];

        return await prisma.team.findFirst({
            where: {
                OR: [
                    { name: { contains: namePart } },
                    { school: { contains: namePart } }
                ]
            },
            include: {
                homeGames: true,
                awayGames: true
            }
        });
    }

    /**
     * Get all teams, optionally filtered by district
     */
    async getTeams(district?: string): Promise<Team[]> {
        if (district) {
            return await prisma.team.findMany({
                where: { district }
            });
        }
        return await prisma.team.findMany();
    }

    /**
     * Create or Update a team (Upsert)
     */
    async upsertTeam(data: Partial<Team> & { maxprepsUrl: string; name: string; school: string; district: string; classification: string }): Promise<Team> {
        return await prisma.team.upsert({
            where: { maxprepsUrl: data.maxprepsUrl },
            update: {
                ...data,
                lastScraped: new Date()
            },
            create: {
                ...data,
                city: data.city || 'Unknown', // Fallback
                lastScraped: new Date()
            }
        });
    }

    /**
     * Upsert a game record
     */
    async upsertGame(gameData: any): Promise<Game> {
        // Logic for game upsert would go here, 
        // likely matching on date + teams to avoid dupes
        // Placeholder for now
        throw new Error("Game upsert not implemented yet");
    }
}

export const teamService = new TeamService();
