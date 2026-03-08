import { useState } from "react";

export default function WelcomeCard() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Pour le bouton de chargement

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche la page de se recharger

    if (!name.trim()) return; // On ne fait rien si le champ est vide

    setIsLoading(true);

    try {
      // 1. On va chercher l'URL sécurisée dans la barre d'adresse
      const searchParams = new URLSearchParams(window.location.search);
      const apiUrl = searchParams.get("api_url");

      if (!apiUrl) {
        alert(
          "Lien invalide. Veuillez scanner le QR Code présent sur votre table.",
        );
        setIsLoading(false);
        return;
      }

      // 2. On envoie la requête au Backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ nickname: name }),
      });

      const data = await response.json();

      // 3. On vérifie si le serveur a accepté
      if (response.ok) {
        // C'est un succès ! On sauvegarde le token dans la mémoire du navigateur
        localStorage.setItem("momento_token", data.token);
        alert(`Bienvenue ${data.guest.nickname} ! 🎉`);

        // La prochaine étape sera de cacher cette carte et d'afficher la galerie !
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      alert("Impossible de joindre le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <h1 className="text-3xl font-bold text-black mb-2">Momento</h1>
      <p className="text-black/70 mb-8">
        Entrez votre prénom pour rejoindre la galerie.
      </p>

      <input
        type="text"
        placeholder="Ex: Tonton Gégé"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border-2 border-gray-200 rounded-lg p-4 mb-4 focus:border-momento focus:outline-none transition-colors"
        required
      />

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full bg-momento text-white font-bold rounded-lg p-4 active:scale-95 transition-transform disabled:opacity-50"
      >
        {isLoading ? "Connexion..." : "Rejoindre la table"}
      </button>
    </form>
  );
}
