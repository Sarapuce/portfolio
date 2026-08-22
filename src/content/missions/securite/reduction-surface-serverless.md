---
titre: "Réduction de la surface d'attaque d'une infra serverless"
badge: "AWS"
resume: "L'infrastructure serverless d'une entreprise tech, ramenée à une exposition minimale : accès privatisés, flux entrants et sortants maîtrisés, chiffrement au repos repris."
constats:
  - "Bases de données joignables publiquement, protégées par du seul filtrage IP"
  - "Environnements de non-production exposés sans restriction d'accès"
  - "Flux sortants non maîtrisés, sans point de sortie unique pour les tracer"
  - "Chiffrement at rest incomplet, dont un bucket de 1 Po à rechiffrer"
conclusion: "Préserver les échanges nécessaires avec des partenaires externes sensibles, fermer le reste de l'exposition."
tags: ["Serverless", "Lambda", "API Gateway", "WAF", "KMS", "VPN", "Terraform"]
ordre: 2
perimetre: "1 compte AWS"
duree: "Quelques semaines"
verdict: "Réduction surface d'attaque"
verdictDetail: "accès privatisés, flux maîtrisés"
---

## Contexte

Infrastructure entièrement serverless sur AWS, API Gateway devant des fonctions Lambda,
échangeant des données avec des partenaires externes. La mission a porté sur la réduction de
la surface d'attaque, sans interrompre ces échanges.

## Couper les accès directs

**Liaisons VPN vers l'on-premise du client.** Les échanges avec le système d'information
interne du client empruntaient des accès trop ouverts. Des tunnels VPN dédiés ont été établis
vers son on-premise, pour faire passer ces flux par un chemin maîtrisé plutôt que par une
exposition publique.

**Bases de données repassées en privé.** Joignables depuis l'extérieur et protégées par du
seul filtrage IP, les bases ont été basculées en accès privé. Cela supprime l'entretien de
listes d'adresses et autorise des accès directs depuis l'intérieur du réseau, sans exposition
sur Internet.

**Filtrage IP sur les environnements de non-production.** Les environnements serverless hors
production n'avaient aucune restriction. Un filtrage IP a été ajouté au niveau d'API Gateway
pour en restreindre l'accès.

## Maîtriser les flux entrants et sortants

**WAF AWS industrialisé en Terraform.** AWS WAF a été déployé devant les applications, puis
outillé par un module Terraform dédié. Le module permet de whitelister une route ou une règle,
gardant les exceptions lisibles et versionnées plutôt que gérées à la main dans la console.

**Point de sortie unique.** Les flux sortants étaient dispersés et difficiles à suivre. Ils
convergent désormais vers un VPC central, relié au reste via une Transit Gateway, pour que
tout ce qui quitte l'infrastructure passe par un point unique, identifiable et journalisable.

## Reprendre le chiffrement at rest

**Clés KMS distinctes par environnement.** Le chiffrement au repos était incomplet et non
cloisonné. Il a été repris là où il manquait, avec une clé KMS par environnement, de sorte
qu'une clé ne déverrouille jamais les données d'un autre environnement.

**Bucket de 1 Po à rechiffrer.** Le poste le plus lourd de la mission. Le rechiffrement de
près d'un pétaoctet a été mené sans interruption de service, en tenant compte du coût que
représente le repassage d'un tel volume.

## Bilan

À l'issue de la mission, l'infrastructure n'expose plus que le nécessaire. Les accès aux bases
et au SI du client passent par des chemins privés, les entrées sont filtrées par le WAF, les
sorties convergent vers un point identifiable, et le chiffrement au repos est repris de bout
en bout.
