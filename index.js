// Importer discord.js et clipboardy
import { Client, GatewayIntentBits } from 'discord.js';
import clipboardy from 'clipboardy'; // Importer clipboardy pour copier dans le presse-papiers
import readline from 'readline'; // Importer readline pour gérer l'entrée utilisateur
import config from './config.json' assert { type: 'json' }; // Charger le fichier config.json
import msgConfig from './msg.json' assert { type: 'json' }; // Charger le fichier msg.json

// Créer une nouvelle instance du client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

// ASCII art
const asciiArt = `
$$$$$$$\\  $$\\      $$\\        $$$$$$\\  $$\\       $$\\       
$$  __$$\\ $$$\\    $$$ |      $$  __$$\\ $$ |      $$ |      
$$ |  $$ |$$$$\\  $$$$ |      $$ /  $$ |$$ |      $$ |      
$$ |  $$ |$$\\$$\\$$ $$ |      $$$$$$$$ |$$ |      $$ |      
$$ |  $$ |$$ \\$$$  $$ |      $$  __$$ |$$ |      $$ |      
$$ |  $$ |$$ |\\$  /$$ |      $$ |  $$ |$$ |      $$ |      
$$$$$$$  |$$ | \\_/ $$ |      $$ |  $$ |$$$$$$$$\\ $$$$$$$$\\ 
\\_______/ \\__|     \\__|      \\__|  \\__|\\________|\\________|`;

// Affichage de l'ASCII art et du message d'options
client.once('ready', () => {
    console.clear(); // Effacer la console
    console.log(asciiArt); // Afficher l'ASCII art
    console.log('Veuillez choisir une option :');
    console.log('1. Scrape des membres');
    console.log('2. DM à tous les membres');
    console.log('3. Copier l\'URL d\'invitation');
    
    // Créer une interface readline pour récupérer l'entrée utilisateur
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Gérer le choix de l'utilisateur
    rl.question('Entrez votre choix : ', (answer) => {
        if (answer === '1') {
            scrapeMembers();
        } else if (answer === '2') {
            rl.question('Entrez l\'ID du serveur où vous voulez envoyer des DM : ', (guildId) => {
                dmAllMembers(guildId);
                rl.close();
            });
        } else if (answer === '3') {
            copyInviteLink();
        } else {
            console.log('Choix invalide. Veuillez redémarrer et entrer 1, 2 ou 3.');
            rl.close();
        }
    });
});

// Fonction pour scraper les membres de tous les serveurs
function scrapeMembers() {
    let totalMembers = 0; // Initialiser un compteur pour le nombre total de membres

    // Parcourt tous les serveurs (guildes) où le bot est présent
    client.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            console.log(`Serveur: ${guild.name}, Membres: ${members.size}`);
            totalMembers += members.size; // Ajouter le nombre de membres de ce serveur au total

            // Afficher le nombre total de membres lorsque tous les serveurs ont été comptabilisés
            if (guild.id === client.guilds.cache.last().id) { // Si c'est le dernier serveur
                console.log(`Nombre total de membres sur tous les serveurs: ${totalMembers}`);
            }
        }).catch(err => {
            console.error(`Erreur lors de la récupération des membres du serveur ${guild.name} :`, err);
        });
    });
}

// Fonction pour envoyer des DM à tous les membres d'un serveur spécifié
async function dmAllMembers(guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.log('Serveur introuvable. Vérifiez l\'ID du serveur et réessayez.');
        return;
    }

    try {
        const members = await guild.members.fetch(); // Récupérer tous les membres du serveur
        const message = msgConfig.message; // Récupérer le message à envoyer

        console.log(`Envoi du message à ${members.size} membres du serveur ${guild.name}...`);
        members.forEach(member => {
            if (!member.user.bot) { // Ne pas envoyer de DM aux bots
                member.send(message).catch(err => {
                    console.error(`Erreur lors de l'envoi du DM à ${member.user.tag}:`, err);
                });
            }
        });
        console.log('Messages envoyés !');
    } catch (err) {
        console.error('Erreur lors de l\'envoi des DM :', err);
    }
}

// Fonction pour copier l'URL d'invitation dans le presse-papiers
function copyInviteLink() {
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${config.botId}&permissions=0&scope=bot`;
    clipboardy.writeSync(inviteLink); // Copier l'URL dans le presse-papiers
    console.log('Lien d\'invitation copié dans le presse-papiers')
}

// Se connecter au bot avec le token depuis config.json
client.login(config.token);
