# FORGE Jules Enock — V1

FORGE est une PWA hors ligne expérimentale : l'utilisateur écrit « Sois... » et l'application adopte un rôle parmi les rôles réellement implémentés.

## Rôles V1
- Calculatrice
- Bloc reçu
- Cahier de préparation
- Générateur / éditeur de texte
- Professeur de mathématiques (opérations fondamentales)

## Installation GitHub mobile
Tous les fichiers nécessaires sont à la racine du projet :
index.html
style.css
app.js
manifest.json
sw.js
icon.svg

Il n'y a aucun dossier `icons/` à créer.

Pour GitHub Pages : activer Pages sur la branche contenant ces fichiers, puis ouvrir l'URL HTTPS de Pages dans Chrome. Le service worker permet le fonctionnement hors ligne après le premier chargement réussi.

## Limites honnêtes de V1
FORGE ne génère pas encore du code arbitraire à partir de n'importe quelle phrase. Il reconnaît les rôles implémentés et compose leurs interfaces. Une demande non prise en charge est signalée comme telle.

## Auteur
Créé par maître Jules Enock
Contact : +509 40409680
