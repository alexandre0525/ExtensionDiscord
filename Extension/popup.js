document.addEventListener("DOMContentLoaded", async () => {
    const sendButton = document.getElementById("sendButton");
    const tagSelect = document.getElementById("tagSelect");
    const messageInput = document.getElementById("messageInput");
    const channelSelect = document.getElementById("channelSelect");


    // 1. Récupérer les salons depuis le serveur
    try {
        const response = await fetch("http://localhost:3000/getChannels");
        const channels = await response.json();

        // 2. Remplir la liste déroulante avec les salons récupérés
        channels.forEach(channel => {
            const option = document.createElement("option");
            option.value = channel.id;
            option.textContent = channel.name;
            channelSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des salons", error);
    }

    
    // Envoyer le lien vers Discord avec un tag et un message
    sendButton.addEventListener("click", async () => {
        const tag = tagSelect.value;
        const message = messageInput.value.trim() || "Voici un lien intéressant !"; // Si le champ est vide, message par défaut
        const channelId = channelSelect.value; // Récupère l'ID du salon sélectionné

        if (!tag) {
            alert("Veuillez sélectionner un tag !");
            return;
        }
        if (!channelId) {
            alert("Veuillez sélectionner un salon !");
            return;
        }

        // Récupérer le lien de l'onglet actif
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs.length === 0) return;
            const link = tabs[0].url;

            try {
                const response = await fetch("http://localhost:3000/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tag, message, link, channelId }) // Envoie le channelId avec les autres données
                });

                const result = await response.json();
                alert(result.message || "Lien envoyé !");
            } catch (error) {
                console.error("Erreur envoi lien :", error);
                alert("Erreur lors de l'envoi du lien.");
            }
        });
    });
});

