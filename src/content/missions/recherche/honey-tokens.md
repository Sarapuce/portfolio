---
titre: "Détecter une intrusion avec des honey tokens"
badge: "AWS"
resume: "Des clés d'accès sans le moindre droit, semées dans l'infrastructure. Le jour où l'une d'elles est utilisée, quelqu'un est déjà entré."
constats:
  - "Une clé sans aucun droit : aucun risque à la semer, presque aucun faux positif"
  - "Le placement est tout le travail, pas le déploiement"
  - "Un token distinct par dépôt, sinon l'alerte ne dit pas ce qui a fuité"
conclusion: "Six minutes entre la publication d'une clé sur GitHub et la première tentative de connexion."
tags: ["Honey tokens", "GGCanary", "Terraform", "Detection", "CI/CD"]
ordre: 2
date: "2023-10"
perimetre: "Comptes AWS"
duree: "Blog Theodo Cloud"
dureeDetail: "octobre 2023"
verdict: "Premier bot en 6 minutes"
verdictDetail: "sur une clé publiée sur GitHub"
---

## Le principe

Un honey token, sur AWS, est une clé d'accès rattachée à un profil dépourvu de toute
autorisation. Il s'en génère autant que nécessaire, disséminées dans l'infrastructure.

Quiconque met la main dessus cherche à en évaluer la valeur. Le premier réflexe est un
`aws sts get-caller-identity`. Ce premier appel d'API déclenche l'alerte.

Trois propriétés en découlent :

- la clé ne donne accès à rien, la semer ne crée aucun risque
- personne n'a de raison légitime de l'utiliser, donc presque aucun faux positif
- une clé d'accès AWS est une cible évidente, et rien ne la distingue d'une vraie tant
  qu'elle n'est pas utilisée

Il s'agit d'un moyen de détection précoce, pas d'un système de détection complet. Il signale
qu'une intrusion a eu lieu, pas par où. Des logs et GuardDuty restent nécessaires pour
répondre à la seconde question.

## Déployer avec GGCanary

Le module [GGCanary](https://github.com/GitGuardian/ggcanary) de GitGuardian fait le travail.
Sa mise en place Terraform est documentée par GitGuardian et n'est pas reprise ici ; elle a
nécessité une adaptation pour Terragrunt.

Le fichier qui compte est `ggcanaries.auto.tfvars`, où se déclarent les tokens :

```hcl
users = {
  token1 = {
    tag_1  = "Tag1"
    source = "email"
  }
  token2 = {
    tag_1  = "Tag1"
    tag_2  = "Tag2"
    source = "VCS"
  }
}
```

Chaque token peut être décrit aussi finement que voulu, dans la limite de 30 tags par token
et de 5000 tokens.

## Où les placer

C'est l'étape la plus délicate. L'objectif est de repérer un acteur déjà présent dans
l'infrastructure, pas de récolter des alertes parce qu'un curieux est tombé sur une clé
exposée publiquement. Le token doit rester accessible uniquement à qui dispose déjà d'un
premier accès.

Dans une kill chain cloud, l'escalade passe presque toujours par trois endroits : la CI/CD,
les workloads applicatifs, les postes de développeurs.

### CI/CD

Les pipelines ont besoin de credentials AWS pour déployer. Ces credentials se retrouvent en
clair, oubliés dans un historique Git, ou stockés proprement dans un Vault mais extractibles
par quiconque sait écrire un workflow.

L'approche GitOps augmente encore le besoin d'accès aux ressources AWS, et les développeurs
ont en général plus de droits que nécessaire. C'est donc le meilleur endroit pour détecter
un compte développeur compromis.

À éviter : un dépôt nommé `secret` contenant un `.env` avec deux valeurs dedans. Un attaquant
repère ce genre de leurre immédiatement. Mieux vaut des emplacements crédibles, historique
Git, secrets du dépôt, ou en dur dans une configuration de pipeline.

Reste la question du nombre. Elle dépend de la maturité de l'organisation, mais le principe
est simple : un token doit permettre de savoir quel actif a été compromis. Donc un token
distinct par dépôt. Sinon l'alerte signale l'intrusion sans en indiquer la source.

### Workloads applicatifs

Sur Kubernetes, Kyverno fait l'affaire. Sur EC2, user data ou Ansible.

Attention à un effet de bord : ces tokens seront aussi visibles depuis le pipeline qui
déploie l'application. Si l'alerte se déclenche, l'attaquant a peut-être seulement accès au
dépôt de déploiement, et pas une exécution de code sur la machine. Il peut aussi en
déclencher plusieurs d'un coup.

### Postes développeurs

Les développeurs devraient utiliser des credentials temporaires plutôt que des clés d'accès.
Déployer un token sur chaque poste de l'entreprise est théoriquement possible, mais coûteux
en logistique et difficile à exploiter : l'alerte indiquerait qu'un poste a été compromis,
sans préciser lequel.

## Test en conditions réelles

Une clé d'accès AWS a été poussée sur un dépôt GitHub public. Premier bot six minutes plus
tard.

Les outils en cause sont automatiques (TruffleHog et équivalents) et ratissent en continu. Ce
comportement, bruyant et facile à détecter, est précisément celui que le dispositif cherche à
piéger.

## Quand l'alerte sonne

Le token signale une présence. Il n'indique pas le vecteur d'entrée.

La première chose à faire est de remonter à la source de la compromission dans les logs, pour
identifier quel collaborateur ou quelle application a fuité. Ensuite, rotation immédiate de
ses credentials, puis la procédure d'incident habituelle.

Si le token vient d'une application, il faut d'abord l'isoler du reste de l'infrastructure
pour couper la possibilité de poser une porte dérobée. Puis chercher dans les logs la
vulnérabilité utilisée, et corriger.

## Après coup

Comme tout dispositif de détection, il se règle avec les retours. Un exercice red team est
l'occasion idéale : si les auditeurs ne sont pas tombés dans le piège, il faut leur demander
pourquoi. La réponse indique où déplacer le token, et sous quel nom.

---

Publié à l'origine sur le [blog sécurité de Theodo Cloud](https://security.theodo.com/en/blog/honey-tokens).
