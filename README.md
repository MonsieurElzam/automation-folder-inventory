# automation-folder-inventory

**Inventaire de dossier** — Volume par extension, plus gros fichiers et doublons détectés par empreinte SHA-256 : utile pour un audit de poste ou de partage.

> **EN** — *Folder inventory.* Size by extension, largest files and duplicates found by SHA-256 — handy for auditing a workstation or a share.

Node.js 18+, **aucune dépendance**, licence **MIT**. Aucune donnée n'est envoyée nulle part. Les messages affichés sont en français.

## Utilisation

```bash
node src/folder-inventory.mjs ./partage --dupes
```

Aide intégrée (`--help`) :

```text
Usage : node src/folder-inventory.mjs dossier [--dupes]
--dupes : cherche aussi les fichiers identiques (plus lent : calcule des empreintes).
Ignore node_modules, .git et les liens symboliques.
```

## Tests

```bash
npm test
```

## Limites

- Les exemples de `samples/` sont fictifs ; adaptez les en-têtes de colonnes à vos propres exports.
- Essayez d'abord sur une copie de vos données.
- Fourni tel quel, sans garantie (voir `LICENSE`).

## La série

Ce script fait partie d'une série de **scripts d'automatisation libres** (public : sécurité et sauvegarde, entre autres) : [présentation, guides et archive complète](https://monsieurelzam.com/scripts) · [tous les dépôts](https://github.com/MonsieurElzam?tab=repositories&q=automation-).

---

Par [Elzam MAMAH](https://monsieurelzam.com) — business analyst, optimisation de processus. Licence MIT.
