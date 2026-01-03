import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        // Simple query to verify DB connection
        await prisma.player.count();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ status: 'error', database: 'disconnected', error: String(error) });
    }
});

// --- Players ---
app.get('/api/players', async (req, res) => {
    const players = await prisma.player.findMany();
    res.json(players);
});

app.post('/api/players', async (req, res) => {
    const { id, name, skillLevel8Ball, skillLevel9Ball, avatarUrl } = req.body;
    const player = await prisma.player.create({
        data: { id, name, skillLevel8Ball, skillLevel9Ball, avatarUrl }
    });
    res.json(player);
});

app.delete('/api/players/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.player.delete({ where: { id } });
    res.json({ success: true });
});

// --- Matches ---
// Fix BigInt serialization for JSON
// @ts-ignore
BigInt.prototype.toJSON = function () { return Number(this) }

app.get('/api/matches', async (req, res) => {
    const matches = await prisma.match.findMany({
        include: { player1: true, player2: true }
    });
    res.json(matches);
});

app.post('/api/matches', async (req, res) => {
    const { id, type, player1Id, player2Id, startTime, scores, innings, status, winnerId, tournamentId } = req.body;
    const match = await prisma.match.create({
        data: {
            id,
            type,
            player1Id,
            player2Id,
            startTime: BigInt(startTime),
            scores,
            innings,
            status,
            winnerId,
            tournamentId
        },
        include: { player1: true, player2: true }
    });
    res.json(match);
});

app.put('/api/matches/:id', async (req, res) => {
    const { id } = req.params;
    const { scores, innings, status, winnerId, endTime } = req.body;
    const updateData: any = { scores, innings, status, winnerId };
    if (endTime) updateData.endTime = BigInt(endTime);

    const match = await prisma.match.update({
        where: { id },
        data: updateData,
        include: { player1: true, player2: true }
    });
    res.json(match);
});

// --- Tournaments ---
app.get('/api/tournaments', async (req, res) => {
    const tournaments = await prisma.tournament.findMany({
        include: { matches: { include: { player1: true, player2: true } } }
    });
    res.json(tournaments);
});

app.post('/api/tournaments', async (req, res) => {
    const { id, name, type, players, matches, status, dateCreated } = req.body;

    // Transactional create? Or simplified. 
    // Matches here are likely "Active" matches created by round robin logic.
    // We need to create the Tournament first, then the Matches attached to it?
    // Frontend sends the whole tree.
    // Prisma create with nested writes is powerful.

    // However, existing backend logic might be simpler if we just save the tournament meta
    // and let the matches be created separately or linked?
    // Let's try to do it in one go if possible, or matches loop.

    // For now, simple create. 
    // Matches inside 'req.body.matches' need to be converted to Prisma Create inputs.

    const matchesCreate = matches.map((m: any) => ({
        id: m.id,
        type: m.type,
        player1Id: m.player1.id,
        player2Id: m.player2.id,
        startTime: BigInt(m.startTime),
        scores: m.scores,
        innings: m.innings || [],
        status: m.status
    }));

    const tournament = await prisma.tournament.create({
        data: {
            id,
            name,
            type,
            status,
            dateCreated: BigInt(dateCreated),
            players, // JSON
            matches: {
                create: matchesCreate
            }
        },
        include: { matches: { include: { player1: true, player2: true } } }
    });

    res.json(tournament);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
