# ⚡ Nettoyeur de Noms de Fichiers

[![PWA](https://img.shields.io/badge/PWA-ready-blue)](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)
[![Licence](https://img.shields.io/badge/licence-MIT-green)](LICENSE)
[![Author](https://img.shields.io/badge/Built%20with%20♥︎%20by%20septieme7-3677FF)](https://septieme7.github.io/CleanFiles-v2/)

**Nettoyeur de Noms de Fichiers** est une application web progressive (PWA) qui permet de nettoyer en lot les noms de fichiers en supprimant les caractères invalides (émoticônes, symboles spéciaux, ponctuation problématique) et en appliquant diverses transformations. Elle fonctionne **entièrement côté client** : aucun fichier n'est envoyé vers un serveur, garantissant ainsi la confidentialité de vos données.

Deux modes d'utilisation sont proposés :
- **📝 Mode Texte** – pour une liste de noms saisie manuellement.
- **📁 Mode Upload** – pour déposer jusqu'à 500 fichiers (2 Go max par fichier) et les renommer localement.

---

## ✨ Fonctionnalités

- 🧹 **Nettoyage intelligent** – suppression des caractères interdits (personnalisables) + gestion des extensions.
- 🔄 **Transformations courantes** :
  - Remplacer un caractère spécifique par un espace.
  - Remplacer tous les espaces par des underscores `_`.
  - Supprimer tous les espaces.
  - Convertir en minuscules / majuscules.
  - Ajouter un préfixe personnalisé.
- 🔢 **Gestion des doublons** – ajout automatique d'un suffixe numérique (`fichier.txt` → `fichier1.txt`), avec options pour numéroter dès le premier fichier ou utiliser uniquement le suffixe.
- 🎨 **Personnalisation avancée** – modification en direct de la liste des caractères interdits (sauvegardée dans `localStorage`).
- 🌗 **Thème clair/sombre** – persistance du choix.
- ⬆️ **Bouton retour en haut** – discret et efficace.
- 📱 **Responsive & SEO** – adapté à tous les écrans, balises meta optimisées.

---

## 🛠️ Technologies utilisées

- **HTML5** – structure sémantique.
- **CSS3** – Flexbox/Grid, variables, transitions, design moderne.
- **JavaScript ES6+** – logique applicative, manipulation du DOM, File API.
- **localStorage** – persistance du thème et de la liste des caractères interdits.
- **JSZip** (pour le mode Upload) – création d'archives ZIP côté client.
- **PWA** – manifeste et icônes pour une installation sur mobile/desktop.

Aucune dépendance serveur – **100% client-side**.

---

## 🚀 Installation et déploiement

1. **Cloner le dépôt**  
   ```bash
   git clone https://github.com/Septieme7/CleanFiles-v2.git
   cd CleanFiles-v2