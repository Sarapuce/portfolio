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
perimetre: "Comptes AWS"
duree: "Blog Theodo Cloud"
dureeDetail: "octobre 2023"
verdict: "Premier bot en 6 minutes"
verdictDetail: "sur une clé publiée sur GitHub"
---

## Le principe

Un honey token, sur AWS, c'est une clé d'accès rattachée à un profil qui n'a strictement
aucune autorisation. On en génère autant qu'on veut et on les dissémine dans
l'infrastructure.

Quelqu'un qui met la main dessus va vouloir savoir ce qu'elle vaut. Son premier réflexe sera
un `aws sts get-caller-identity`. Le premier appel d'API déclenche l'alerte.

Trois propriétés en découlent :

- la clé ne donne accès à rien, la semer ne crée aucun risque
- personne n'a de raison légitime de l'utiliser, donc presque aucun faux positif
- une clé d'accès AWS est une cible évidente, et rien ne la distingue d'une vraie tant qu'on
  ne s'en sert pas

C'est un moyen de détection précoce, pas un système de détection. Il dit qu'on est entré, pas
par où. Il faut des logs et un GuardDuty à côté pour répondre à la deuxième question.

## Déployer avec GGCanary

Le module [GGCanary](https://github.com/GitGuardian/ggcanary) de GitGuardian fait le travail.
La mise en place Terraform est documentée chez eux, je ne la reprends pas ici. Il a fallu
l'adapter pour Terragrunt.

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

On en crée autant que nécessaire, en les décrivant aussi finement qu'on veut. La limite est
de 30 tags par token et de 5000 tokens.

## Où les placer

C'est l'étape difficile. L'objectif est de repérer quelqu'un qui est déjà dans
l'infrastructure, pas de récolter des alertes parce qu'un curieux est tombé sur une clé
exposée publiquement. Le token doit être accessible uniquement à quelqu'un qui a déjà un
premier accès.

Dans une kill chain cloud, l'escalade passe presque toujours par trois endroits : la CI/CD,
les workloads applicatifs, les postes de développeurs.

### CI/CD

Les pipelines ont besoin de credentials AWS pour déployer. On les trouve en clair, oubliés
dans un historique Git, ou stockés proprement dans un Vault mais extractibles par quelqu'un
qui sait écrire un workflow.

L'approche GitOps augmente encore le besoin d'accès aux ressources AWS, et les développeurs
ont en général plus de droits que nécessaire. C'est donc le meilleur endroit pour détecter
un compte développeur compromis.

À éviter : un dépôt nommé `secret` contenant un `.env` avec deux valeurs dedans. Un attaquant
repère ce genre de leurre immédiatement. Mieux vaut des emplacements crédibles, historique
Git, secrets du dépôt, ou en dur dans une configuration de pipeline.

Reste la question du nombre. Elle dépend de la maturité de l'organisation, mais le principe
est simple : un token doit permettre de savoir quel actif a été compromis. Donc un token
distinct par dépôt. Sinon l'alerte dit qu'on est entré, sans dire par où.

### Workloads applicatifs

Sur Kubernetes, Kyverno fait l'affaire. Sur EC2, user data ou Ansible.

Attention à un effet de bord : ces tokens seront aussi visibles depuis le pipeline qui
déploie l'application. Si l'alerte se déclenche, l'attaquant a peut-être seulement accès au
dépôt de déploiement, et pas une exécution de code sur la machine. Il peut aussi en
déclencher plusieurs d'un coup.

### Postes développeurs

Les développeurs devraient utiliser des credentials temporaires plutôt que des clés d'accès.
Déployer un token sur chaque poste de l'entreprise est théoriquement possible, mais coûteux
en logistique et difficile à exploiter : on saura qu'un poste a été compromis, pas lequel.

## Test en conditions réelles

J'ai poussé une clé d'accès AWS sur un dépôt GitHub public. Premier bot six minutes plus
tard.

Les outils utilisés sont automatiques, du TruffleHog et équivalents, et ils ratissent en
continu. C'est bruyant et facile à détecter, ce qui est exactement le comportement qu'on
cherche à piéger.

## Quand l'alerte sonne

Le token dit qu'il y a quelqu'un. Il ne dit pas comment il est entré.

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
