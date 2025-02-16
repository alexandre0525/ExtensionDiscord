const axios = require("axios");
const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

// Initialisation du serveur Express
const app = express();
app.use(cors());
app.use(express.json());

// Configuration du bot Discord
const TOKEN = "";
const GUILD_ID = "1044223869436821575";
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);

    // Vérifier les salons de la guilde
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        console.log(`Guilde avec ID ${GUILD_ID} introuvable.`);
        return;
    }

    console.log(`Guilde récupérée : ${guild.name}, ID : ${guild.id}`);
    
    // Vérifier les salons et les permissions
    guild.channels.cache.forEach(channel => {
        console.log(`Vérification du salon: ${channel.name}, ID: ${channel.id}, Type: ${channel.type}`);
        if (channel.type === 'GUILD_TEXT') {
            console.log(`Salon Textuel: ${channel.name}, ID: ${channel.id}`);
        }
    });
});

// Route API pour récupérer les salons du serveur
app.get('/getChannels', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(GUILD_ID); 
        if (!guild) {
            return res.status(404).json({ error: "Guilde introuvable" });
        }

        // Filtrer uniquement les salons textuels (type 0 qui sont uniquement les salons textuels)
        const channels = guild.channels.cache
            .filter(channel => channel.type === 0) // Type 0 = (salons textuels)
            .map(channel => ({
                id: channel.id,
                name: channel.name
            }));

        console.log("Salons récupérés:", channels);

        // Retourner les salons sous forme de réponse
        res.json(channels);
    } catch (error) {
        console.error("Erreur lors de la récupération des salons:", error);
        res.status(500).json({ error: "Échec de la récupération des salons" });
    }
});


// Route API pour envoyer un message dans un salon choisi par l'utilisateur
app.post("/send", async (req, res) => {
    const { tag, message, link, channelId } = req.body; // Récupère le channelId depuis l'extension

    // Messages de tags prédéfinis
    const tagMessages = {
        cool: "🔥 Un lien cool à découvrir !",
        shitpost: "😂 Attention, shitpost en approche !",
        work: "💼 Ressource utile pour le travail."
    };

    // Message final formaté
    const tagMessage = tagMessages[tag] || "📌 Nouveau lien partagé :";
    const finalMessage = `${tagMessage}\n${message}\n🔗 ${link}`;

    try {
        // Récupérer le salon par son ID
        const channel = await client.channels.fetch(channelId);

        // Vérifier si le salon est valide et de type textuel
        if (channel && channel.isTextBased()) {
            await channel.send(finalMessage); // Envoie le message dans le salon choisi
            res.json({ success: true, message: "Lien envoyé avec succès !" });
        } else {
            res.status(400).json({ error: "Salon invalide ou non textuel" });
        }
    } catch (error) {
        console.error("Erreur envoi message :", error.response?.data || error.message);
        res.status(500).json({ error: "Échec de l'envoi du lien" });
    }
});


// Démarrer le bot et le serveur
client.login(TOKEN);

app.get("/", (req, res) => {
    res.send("🚀 Serveur Express pour le bot Discord fonctionne !");
});

app.listen(3000, () => {
    console.log("🚀 Serveur Express lancé sur http://localhost:3000");
});
