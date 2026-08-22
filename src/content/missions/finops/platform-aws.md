---
titre: "Plateforme interne de développement AWS"
badge: "AWS"
resume: "Une vingtaine de microservices sur un socle Kubernetes mutualisé, et toute l'infrastructure autour pour le faire tourner."
constats:
  - "Un socle x86 figé depuis la construction, alors que l'écosystème ARM était devenu mature entre-temps"
  - "Aucune charge en Spot, faute d'avoir jamais classé ce qui tolère l'interruption"
  - "Un autoscaling resté sur le scaler Kubernetes natif, bien moins efficace que Karpenter"
  - "Les environnements hors production allumés la nuit et le week-end"
  - "Des logs collectés intégralement, et des règles WAF dupliquées d'un Web ACL à l'autre"
conclusion: "Cinq leviers passés en production et tenus sur un an, du socle de calcul jusqu'aux logs de sécurité."
tags: ["AWS", "EKS", "Karpenter", "GitLab", "Datadog", "Terraform"]
ordre: 2
perimetre: "~20 microservices"
duree: "1 an"
dureeDetail: "volet FinOps d'une mission de sécurisation"
verdict: "5 leviers appliqués"
verdictDetail: "tenus sur 12 mois"
---

## Périmètre

Une landing zone AWS hébergeant les API de la digital factory du groupe : quatre
environnements, trois clusters EKS, des bases managées, et une API Gateway doublée d'un ALB
pour l'exposition. Une vingtaine de microservices au total, déployés par les équipes en
autonomie.

Le volet FinOps a été mené en parallèle d'une mission de sécurisation, sur le même
périmètre et sur la même année. Les deux se sont nourris l'un l'autre : plusieurs constats
de sécurité, notamment sur les logs et sur le WAF, avaient un coût directement mesurable.

Hors périmètre : tout ce qui sortait de la digital factory.

## Constats

**Un socle x86 figé.** À la construction, l'écosystème ARM n'était pas prêt, une partie des
agents et des images de base n'existaient qu'en x86. L'écosystème a évolué depuis, sans que le
socle soit réévalué.

**Aucune charge en Spot.** Les services capables d'encaisser la perte d'un nœud n'avaient
jamais été identifiés.

**Un autoscaling qui suivait mal.** Le cluster tournait sur l'autoscaler Kubernetes natif,
qui ne sait que gonfler des node groups déjà déclarés. Karpenter, qui choisit le type
d'instance à la demande, n'est passé en version stable qu'en 2024.

**Des environnements hors production allumés en continu.** Développement et recette
tournaient la nuit et le week-end, pour des équipes présentes en journée.

**Des logs et un WAF non arbitrés.** Tout était collecté, sans filtrage. Et les mêmes règles
WAF étaient dupliquées sur plusieurs Web ACL, chacune facturée séparément.

## Recommandations

**Bascule en ARM.** Images reconstruites pour Graviton, service par service, en commençant
par les moins critiques. 10 à 20% de moins sur le prix instance, à performance équivalente.

**Spot sur ce qui l'encaisse.** Les services sans état sont passés en Spot, les composants
critiques sont restés en capacité garantie. 70 à 90% de moins que l'On-Demand sur cette part.

**Karpenter à la place de l'autoscaler natif.** Le provisionnement suit ce qui attend d'être
schedulé et choisit l'instance en conséquence, au lieu de gonfler des groupes prédéfinis.
Le Spot devient utilisable au quotidien.

**Extinction du hors-production.** Une semaine fait 168 heures, une équipe en utilise une
cinquantaine. Extinction la nuit et le week-end, redémarrage automatique le matin. Environ
60% de moins sur ces environnements, une fois retiré ce qui doit rester allumé.

**Logs filtrés, Web ACL mutualisées.** Les règles WAF sont facturées par ACL, donc dix ACL
identiques coûtent dix fois. Prod et hors-prod sont restées séparées, pour ne pas risquer
de propager une mauvaise règle partout.

**Suivi mensuel.** Les cinq leviers étaient toujours en place douze mois après.
