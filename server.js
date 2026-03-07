require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
// Add this right after mongoose.connect(process.env.MONGO_URI);
/*mongoose.connection.once('open', async () => {
    try {
        // This force-removes the ghost rule that is causing the 500 error
        await mongoose.connection.db.collection('accounts').dropIndex('accoundId_1');
        console.log("Successfully removed the ghost index 'accoundId_1'");
    } catch (err) {
        console.log("Index 'accoundId_1' was already removed or doesn't exist.");
    }
});*/
const express = require('express');
const multer = require('multer')
const fs = require('fs');      // Missing this!
const path = require('path');  // Missing this!
const app = express();
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');

// Use the library's internal property directly
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

const Account = require('./models/Account');
const Correspondence = require('./models/Correspondence');
const Debt = require('./models/Debt');
const Match = require('./models/Match');
const New = require('./models/New');
const Player = require('./models/Player');
const Team = require('./models/Team');
const Tournament = require('./models/Tournament');

function vigenere(text, key, encrypt = true) {
    let alphabet = " !#$'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~ñáéíóúäëïöü";
    let result = '';
    let keyIndex = 0;
    for (let i = 0; i < text.length; i++) {
        let textChar = text[i]; let keyChar = key[keyIndex]; let index; if (encrypt) { index = (alphabet.indexOf(textChar) + alphabet.indexOf(keyChar)) % alphabet.length; } else {
            index = (alphabet.indexOf(textChar) - alphabet.indexOf(keyChar) + alphabet.length) % alphabet.length;
        } let
            char = alphabet[index]; result += char; keyIndex = (keyIndex + 1) % key.length;
    } return result;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fetch all Accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await Account.find();
        const accountMap = {};
        accounts.forEach(a => accountMap[a.accountId] = a);
        res.json(accountMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
});

// Fetch all Correspondence
app.get('/api/correspondence', async (req, res) => {
    try {
        const correspondence = await Correspondence.find();
        const correspondenceMap = {};
        correspondence.forEach(c => correspondenceMap[c.mailId] = c);
        res.json(correspondenceMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch correspondence" });
    }
});

// Fetch all Debt
app.get('/api/debt', async (req, res) => {
    try {
        const debt = await Debt.find();
        const debtMap = {};
        debt.forEach(p => debtMap[p.debtId] = p);
        res.json(debtMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch debt" });
    }
});

// Fetch all Matches
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find();
        const matchMap = {};
        matches.forEach(p => matchMap[p.matchId] = p);
        res.json(matchMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

// Fetch all News
app.get('/api/news', async (req, res) => {
    try {
        const news = await New.find();
        const newMap = {};
        news.forEach(p => newMap[p.newId] = p);
        res.json(newMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// Fetch all Tournaments
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        const tournamentMap = {};
        tournaments.forEach(p => tournamentMap[p.tournamentId] = p);
        res.json(tournamentMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tournaments" });
    }
});

// Fetch all Teams
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find();
        const teamMap = {};
        teams.forEach(t => teamMap[t.teamId] = t);
        res.json(teamMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teams" });
    }
});

// Fetch all Players
app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find();
        const playerMap = {};
        players.forEach(p => playerMap[p.playerId] = p);
        res.json(playerMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch players" });
    }
});

// 1. Define API Routes FIRST
app.post('/api/add-message', async (req, res) => {
    try {
        const { serverId, messageId, messageData } = req.body;

        // We include userId (the old serverId) so we know who the mail belongs to
        await Correspondence.findOneAndUpdate(
            { mailId: messageId },
            {
                ...messageData,
                userId: serverId,
                mailId: messageId
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, messageId: messageId });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to save message" });
    }
});

app.post('/api/update-team', async (req, res) => {
    try {
        const { teamId, teamPlayers } = req.body;

        await Team.findOneAndUpdate(
            { teamId: teamId },
            { $set: { players: teamPlayers } },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update team players" });
    }
});
app.post('/api/update-whole-team', async (req, res) => {
    try {
        const { teamId, teamData } = req.body;

        // This replaces or creates the entire team entry with the new data
        await Team.findOneAndUpdate(
            { teamId: teamId },
            teamData,
            { upsert: true, new: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update whole team" });
    }
});

app.post('/api/change-player-team', async (req, res) => {
    try {
        const { playerId, newTeam } = req.body;

        // Find the player by ID and update their team
        await Player.findOneAndUpdate(
            { playerId: playerId },
            { $set: { team: newTeam } }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update player team" });
    }
});

app.post('/api/remove-mail', async (req, res) => {
    try {
        const { mailId } = req.body;

        // Delete the specific mail document
        await Correspondence.deleteOne({ mailId: mailId });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to remove mail" });
    }
});

app.post('/api/change-mail-click', async (req, res) => {
    try {
        const { mailId } = req.body;

        // Update the 'clicked' status to true
        await Correspondence.findOneAndUpdate(
            { mailId: mailId },
            { $set: { clicked: true } }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update mail status" });
    }
});

app.post('/api/add-debt', async (req, res) => {
    try {
        const { teamId, amount } = req.body;

        // Increment the existing amount by the new amount
        // upsert: true creates the record if the team has no debt yet
        await Debt.findOneAndUpdate(
            { teamId: teamId },
            { $inc: { amount: amount } },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update debt" });
    }
});

app.post('/api/pay-debt-money', async (req, res) => {
    try {
        const { teamId, amount, password } = req.body;

        // Find the specific team
        const team = await Team.findOne({ teamId: teamId });
        if (!team) return res.status(404).json({ error: "Team not found" });

        // Decrypt, update wealth, and re-encrypt
        let decryptedWealth = vigenere(team.wealth, password, false);
        let newWealthNum = Number(decryptedWealth) + (1000000 * amount);
        team.wealth = vigenere(newWealthNum.toString(), password);

        // Save the updated document back to MongoDB
        await team.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/add-match-event', async (req, res) => {
    try {
        const { matchId, eventExists, eventArray } = req.body;
        const match = await Match.findOne({ matchId: matchId });
        if (!match) return res.status(404).json({ error: "Match not found" });

        // Increment minute
        match.minute = (match.minute || 0) + 1;

        if (eventExists) {
            match.events.push(eventArray);

            // Goal logic
            if (eventArray[1] === "goal" || eventArray[1] === "pens") {
                const teamIdx = (eventArray[2] === match.homeTeam) ? 0 : 1;
                match.score[teamIdx] += 1;
                // Important: tell Mongoose the array was updated
                match.markModified('score');
            }
        }

        await match.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Start Match: Reset minute to 0
app.post('/api/start-match', async (req, res) => {
    try {
        await Match.findOneAndUpdate(
            { matchId: req.body.matchId },
            { $set: { minute: 0 } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// End Match: Set end status to true
app.post('/api/end-match', async (req, res) => {
    try {
        await Match.findOneAndUpdate(
            { matchId: req.body.matchId },
            { $set: { end: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/update-tour-after-match', async (req, res) => {
    try {
        const { tourId, homeTeam, awayTeam, score, events } = req.body;
        const tour = await Tournament.findOne({ tournamentId: tourId });
        if (!tour) return res.status(404).json({ error: "Tournament not found" });

        // Helper to find team index in the table array
        const findTeamIdx = (name) => tour.table.findIndex(row => row[0] === name);
        const hIdx = findTeamIdx(homeTeam);
        const aIdx = findTeamIdx(awayTeam);

        if (hIdx === -1 || aIdx === -1) return res.status(400).json({ error: "Teams not in table" });

        // Update Games Played
        tour.table[hIdx][1] += 1;
        tour.table[aIdx][1] += 1;

        // Points and W/D/L Logic
        if (score[0] > score[1]) {
            tour.table[hIdx][7] += 3; tour.table[hIdx][2] += 1; // Home Win
            tour.table[aIdx][4] += 1; // Away Loss
        } else if (score[0] === score[1]) {
            tour.table[hIdx][7] += 1; tour.table[aIdx][7] += 1; // Draw
            tour.table[hIdx][3] += 1; tour.table[aIdx][3] += 1;
        } else {
            tour.table[aIdx][7] += 3; tour.table[aIdx][2] += 1; // Away Win
            tour.table[hIdx][4] += 1; // Home Loss
        }

        // Goals For and Against
        tour.table[hIdx][5] += score[0]; tour.table[hIdx][6] += score[1];
        tour.table[aIdx][5] += score[1]; tour.table[aIdx][6] += score[0];

        // Player Stats (Goals/Cards) using Maps
        events.forEach(ev => {
            const type = ev[1];
            const pId = ev[3];
            const mapName = type === "goal" ? "goals" : type === "redc" ? "redCards" : "yellowCards";
            const increment = type === "yere" ? 2 : 1;

            const current = tour.stats[mapName][pId] || 0;
            tour.stats[mapName][pId] = current + increment;
        });

        tour.markModified('table');
        tour.markModified('stats');
        await tour.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/update-players-value', async (req, res) => {
    try {
        const { events } = req.body;

        for (const ev of events) {
            const type = ev[1];
            const pId = ev[3];
            let multiplier = 1.0;

            if (type === "goal") multiplier = 1.1;
            else if (type === "yell") multiplier = 0.96;
            else if (type === "redc") multiplier = 0.9;
            else if (type === "yere") multiplier = 0.89;

            await Player.findOneAndUpdate(
                { playerId: pId },
                { $mul: { marketvalue: multiplier } }
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Add Lineup
app.post('/api/add-lineup', async (req, res) => {
    try {
        const { matchId, teamNum, lineUp } = req.body;
        const match = await Match.findOne({ matchId });

        match.lineups[teamNum] = lineUp;
        match.markModified('lineups');

        await match.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change Club Name
app.post('/api/change-club-name', async (req, res) => {
    try {
        const { clubId, newName } = req.body;
        await Team.findOneAndUpdate({ teamId: clubId }, { name: newName });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/add-account', async (req, res) => {
    try {
        const { name, password } = req.body;

        // findOneAndUpdate with upsert:true means: 
        // "Find the account with this username. If it exists, update the password. 
        // If it doesn't exist, create a new document."
        await Account.findOneAndUpdate(
            { accountId: name }, // Your model uses 'accountId'
            { passwordId: password },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("CRITICAL DATABASE ERROR:", err);
        res.status(500).json({ error: "Failed to save account" });
    }
});
app.post('/api/add-team', async (req, res) => {
    try {
        const { teamId, teamData } = req.body;

        await Team.findOneAndUpdate(
            { teamId: teamId },
            teamData,
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to add team" });
    }
});
app.post('/api/add-new', async (req, res) => {
    try {
        const { newId, newData } = req.body;

        await New.findOneAndUpdate(
            { newId: newId },
            newData,
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to post news" });
    }
});

// 2.1 Configure where and how to store the file

// Configure Cloudinary with your credentials (put these in your .env file!)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'team_photos',
            // Use the teamName (which holds the ID) from the form to overwrite
            public_id: req.body.teamName,
            format: 'png',
            overwrite: true, // This ensures the old image is replaced
            invalidate: true // This clears the CDN cache so the new image shows immediately
        };
    },
});

const upload = multer({ storage: storage });

app.post('/upload', async (req, res) => {
    try {
        console.log("Upload request received. req.body:", req.body);
        console.log("Uploaded file:", req.file);

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Create an update object
        const updateData = { logoUrl: req.file.path };

        // IF the user also changed the name in the text box, add it to the update
        if (req.body.about) {
            updateData.name = req.body.about;
        }

        // Perform ONE database operation instead of two
        await Team.findOneAndUpdate(
            { teamId: req.body.teamName },
            { $set: updateData },
            { new: true }
        );

        res.redirect('../?team=' + req.body.teamName);
    } catch (err) {
        console.error("UPLOAD ERROR:", err.message);
        if (!res.headersSent) {
            res.status(500).send("Upload failed: " + err.message);
        }
    }
});

app.post('/duplicate-default-team-photo', async (req, res) => {
    const { teamId } = req.body;
    const defaultPhotoUrl = "https://res.cloudinary.com/dccssnncr/image/upload/v1772572434/defaultTeamPhoto_dnwclq.png";

    try {
        console.log("Attempting to duplicate for teamId:", teamId); // Log to see if teamId is reaching the server

        const result = await cloudinary.uploader.upload(defaultPhotoUrl, {
            public_id: teamId,
            folder: 'team_photos',
            overwrite: true
        });

        const updatedTeam = await Team.findOneAndUpdate(
            { teamId: teamId },
            { logoUrl: result.secure_url },
            { new: true }
        );

        if (!updatedTeam) {
            console.log("Team not found in DB yet for ID:", teamId);
            return res.status(404).send("Team not found");
        }

        res.json({ success: true, url: result.secure_url });
    } catch (err) {
        console.error("DETAILED CLOUDINARY ERROR:", err.message); // This will tell you exactly why it's a 500 error
        res.status(500).send("Cloudinary Error: " + err.message);
    }
});
// 3. Serve Static Files THIRD
// This allows your index.html files to be found
app.use(express.static(__dirname));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));