---
titre: "Du compte développeur aux bases de production"
badge: "AWS"
resume: "Un threat model EBIOS RM sur toute la chaîne de déploiement, du poste développeur jusqu'aux bases de production."
constats:
  - "Huit chemins de compromission de la CI/CD vers les bases de production"
  - "Élévation de privilège dans AWS via la création de ressources et l'attribution de rôles"
  - "Élévation de privilège dans les clusters via la déclaration libre de ressources ArgoCD"
  - "Aucun filtrage réseau entre les pods"
  - "Mots de passe développeurs stockés en clair sur les postes"
conclusion: "Le périmètre extérieur était bien tenu. À partir d'un compte de développeur, on atteignait la production."
tags: ["EBIOS RM", "GitLab CI", "ArgoCD", "Kubernetes", "IAM"]
ordre: 1
perimetre: "4 comptes AWS"
duree: "1 an"
dureeDetail: "threat model puis remédiation"
verdict: "20+ findings priorisés"
verdictDetail: "remédiés sur l'année"
---

## Périmètre

Quatre comptes AWS, les clusters Kubernetes et leurs relations entre environnements, GitLab
et sa CI/CD, ArgoCD.

L'audit s'est fait par la construction d'un threat model EBIOS RM plutôt que par un scan
d'outillage. Plus de vingt findings priorisés en sont sortis, et la remédiation a été menée
par l'équipe sur l'année.

## Constats

**Huit chemins vers les bases de production.** Tous partaient de la CI/CD. Assume role entre
environnements, évasion de conteneur depuis un runner privilégié, empoisonnement du registry
interne de la plateforme.

**Élévation de privilège dans AWS.** Certains rôles pouvaient créer une ressource et lui
attribuer un rôle IAM. De là, on remontait vers des droits qu'on n'avait pas au départ.

**Élévation de privilège dans les clusters.** ArgoCD laissait déclarer n'importe quelle
ressource, sans restriction sur ce qui pouvait être déployé ni où.

**Aucun filtrage réseau.** Tous les pods pouvaient se joindre, quel que soit leur namespace
ou leur niveau de sensibilité.

**Des secrets sur les postes.** Une CLI interne demandait aux développeurs de stocker leur
mot de passe en clair sur leur machine.

## Recommandations

**BuildKit à la place des runners privilégiés.** Les images se construisent sans conteneur
privilégié, ce qui ferme la voie d'évasion.

**Resserrage des droits AWS.** Suppression des assume role entre environnements, et retrait
du droit d'attribuer un rôle IAM à une ressource qu'on vient de créer.

**Cloisonnement des secrets GitLab.** Seuls les dépôts qui en ont l'usage y accèdent.

**ArgoCD repris via les Projects.** Les développeurs déploient dans un cadre défini au lieu
de déclarer ce qu'ils veulent.

**Network policies en self-service.** Un mécanisme de contrôle permet aux équipes de poser
leurs règles en autonomie, sans passer par la plateforme à chaque fois.

**Node pools dédiés**, pour isoler les charges selon leur niveau de sensibilité.

**SSO sur la CLI interne.** Plus de mot de passe sur les postes, et le confort d'usage est
resté le même.
