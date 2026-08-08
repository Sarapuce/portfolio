---
titre: "Dataplatform GCP et couche legacy"
badge: "GCP"
resume: "Une organisation d'une quarantaine de projets, une dataplatform complète, et une architecture legacy que personne n'avait rouverte depuis la migration."
constats:
  - "Aucun engagement de consommation sur un socle pourtant stable depuis des mois"
  - "Instances PostgreSQL en fin de vie, facturées en support étendu"
  - "Workloads dimensionnés à l'intuition, sans rapport avec l'usage mesuré"
  - "Stockage jamais arbitré, ni sur BigQuery ni sur les buckets"
conclusion: "40% de la facture identifiés comme récupérables, 28% appliqués pendant la mission."
tags: ["GCP", "BigQuery", "GKE Autopilot", "Cloud SQL", "Composer", "Terraform"]
ordre: 1
perimetre: "~40 projets GCP"
duree: "2 semaines"
dureeDetail: "implémentation comprise"
verdict: "-28% appliqué"
verdictDetail: "constaté sur 2 mois"
---

## Périmètre

Une organisation GCP répartie sur une quarantaine de projets : une dataplatform complète,
de l'ingestion au stockage analytique, une landing zone applicative, et le socle réseau
partagé entre les deux.

L'analyse croise trois sources. L'export de facturation dans BigQuery, en version standard
et en version resource-level, pour attribuer un coût à une ressource précise plutôt qu'à un
service. L'API Cloud Monitoring, pour confronter ce qui est réservé à ce qui est réellement
consommé. Et le code Terraform, pour distinguer ce qui est géré en infrastructure as code
de ce qui a été posé à la main.

Hors périmètre : l'applicatif métier, hébergé sur Azure et un chantier sécurité mené en
parallèle, neutre financièrement.

## Constats

**Le premier gisement n'est pas technique.** Le socle Cloud SQL éligible à un engagement de
consommation pesait 11% de la facture mensuelle, facturé intégralement à la demande, sans
aucun engagement souscrit. À lui seul, le plus gros levier de la revue.

**Du support payé pour rien.** Plusieurs instances tournaient sur des versions PostgreSQL
en fin de vie et payaient donc le support étendu, environ 3% de la facture annuelle. Aucune
capacité en face, aucun service rendu, juste le prix du retard de migration.

**Un dimensionnement décorrélé de l'usage.** Les workloads réservaient plusieurs fois ce
qu'ils consommaient réellement. C'est coûteux partout, mais surtout sur GKE Autopilot, qui
facture les requests déclarées et non l'usage constaté : y poser des requests et des limits
réalistes, calées sur les métriques et différenciées par environnement, suffit à faire
baisser la facture sans toucher au code.

**Un stockage jamais arbitré.** L'arbitrage entre facturation logique et physique n'avait
jamais été fait sur BigQuery, alors que le taux de compression mesuré rendait la seconde
nettement plus intéressante. Et aucun bucket ne portait de règle de cycle de vie, donc rien
ne descendait vers les classes de stockage froides ni ne s'effaçait.

**Le legacy qui tourne encore.** Le déploiement Airbyte antérieur à la migration
fonctionnait toujours, avec une machine virtuelle à 4% de charge et une base en haute
disponibilité sur une version obsolète. Côté réseau : des tunnels VPN sans le moindre
paquet entrant depuis des mois, un load balancer de test, des passerelles orphelines.

## Recommandations

**Décommissionner avant d'optimiser.** Couper le legacy en premier évite de dimensionner
puis de s'engager sur de la capacité destinée à disparaître. C'est l'erreur classique, celle
qui verrouille une dépense qu'on s'apprêtait justement à supprimer.

**Redimensionner sur la mesure, pas sur l'intuition.** Chaque changement a été calé sur 7
jours de métriques réelles, en conservant volontairement les composants effectivement
chargés, et en documentant les contraintes de plateforme rencontrées : minimum de mémoire
imposé, ratios autorisés, risque de saturation au démarrage.

**Gouverner le stockage**, le point aveugle le plus rentable. Basculer BigQuery en
facturation physique, poser des expirations de partition sur les tables brutes qui n'ont
plus de valeur une fois la donnée typée, et des cycles de vie sur les buckets.

**N'engager le socle qu'une fois stable**, sur un montant volontairement inférieur au socle
permanent, et en excluant les ressources candidates à la suppression. Sinon l'engagement
devient une dépense contrainte.
