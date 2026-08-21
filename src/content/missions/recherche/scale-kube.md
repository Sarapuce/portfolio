---
titre: "Kube, Scale Me One More Time"
badge: "Kubernetes"
resume: "À partir d'un seul nœud compromis, prendre le contrôle d'un cluster entier en détournant son autoscaler. Présenté au SSTIC 2025, avec Paul Viossat."
constats:
  - "Le providerID est censé être immuable, mais le kubelet peut le redéfinir en supprimant puis recréant son nœud"
  - "Les identifiants d'un nœud restent valides après sa suppression, jusqu'à un an sur GKE"
  - "L'autoscaler devient une primitive de suppression de n'importe quelle machine du cluster"
conclusion: "Un runner CI/CD compromis suffit à récupérer le service account cluster-admin, sans avoir à compromettre le nœud qui le porte."
tags: ["Kubernetes", "GKE", "EKS", "Autoscaling", "IDOR", "SSTIC"]
ordre: 1
perimetre: "GKE & EKS"
duree: "SSTIC 2025"
dureeDetail: "avec Paul Viossat"
verdict: "Compromission totale du cluster"
verdictDetail: "d'un seul nœud vers cluster-admin"
etiquette: "SSTIC 2025"
---

Recherche menée avec Paul Viossat et présentée au SSTIC 2025. Elle prolonge notre travail de
l'année précédente sur l'isolation des nœuds. Cette fois on s'est intéressés aux clusters
dynamiques, ceux dont les nœuds s'allument et s'éteignent tout seuls selon la charge.

## Le point de départ

La plupart des recherches sur l'isolation Kubernetes partent d'un cluster figé, nœuds déjà
démarrés. En prod, sur du cloud, ça ne se passe pas comme ça : l'autoscaler crée et supprime
des nœuds en continu pour coller à la demande. Personne n'avait vraiment regardé cette
mécanique du point de vue d'un attaquant.

Notre objectif de départ tenait en une ligne. Partir d'un seul nœud compromis, souvent un
runner CI/CD mal configuré, et remonter jusqu'au cluster entier.

## La faille

Chaque nœud porte un attribut `providerID` qui pointe vers la machine correspondante chez le
fournisseur cloud. C'est ce champ que le `cloud-controller-manager` et l'autoscaler
consultent pour savoir quelle VM démarrer ou supprimer.

Deux comportements anodins pris séparément, mais qui peuvent être exploités ensemble.

Au démarrage, le kubelet crée lui-même son objet nœud, et personne ne l'empêche d'y écrire le
`providerID` de son choix. Le champ est réputé immuable une fois posé, mais supprimer le nœud
puis le recréer suffit à le changer.

Deuxième point, quand un nœud disparaît, ses identifiants ne sont pas révoqués. Ils restent
valides quatorze minutes sur AWS, jusqu'à un an sur GKE. On peut donc ressusciter un nœud avec
les mêmes identifiants et des caractéristiques différentes.

Mis bout à bout, ça donne un IDOR de second ordre. L'autoscaler agit sur une vraie VM à
partir d'un identifiant d'un ancien noeud que l'attaquant contrôlait.

## Ce qu'on en fait

De là, trois primitives.

**Recréer un nœud avec les attributs qu'on veut.** On passe par l'autoscaler pour qu'il
supprime notre propre nœud, puis on le recrée avec les labels et les taints qui nous
arrangent. Pour empêcher l'API de nettoyer ce faux nœud, un petit émulateur maison,
[`kne.py`](https://github.com/Sarapuce/kne), le maintient en vie.

**Supprimer n'importe quel nœud du cluster.** Il suffit de donner à son nœud le `providerID`
d'un autre : c'est cet autre nœud que l'autoscaler ira supprimer. La machine cible tombe, on
n'y a jamais mis les pieds.

**Attirer un pod sensible.** On combine les deux. On recrée un nœud qui imite la cible d'un
pod privilégié, on supprime le nœud légitime, et le pod se retrouve reprogrammé chez nous.

Le scénario complet enchaîne tout ça. Il part d'un runner CI/CD compromis dans un pool isolé
et se termine sur le nœud admin, dont l'isolation était pourtant bien configurée. Une fois le
pod admin reprogrammé sur un nœud qu'on contrôle, on émet un token pour son service account,
et on est `cluster-admin`.

## S'en protéger

Le correctif tient en une phrase. Le `providerID` est censé être posé par le
`cloud-controller-manager`, pas par le kubelet. Une policy d'admission (OPA ou Kyverno) qui
interdit au kubelet de renseigner son propre `providerID` referme la porte dans la plupart des
cas.

Reste le problème de fond, plus coriace. Tant que les identifiants d'un nœud survivent à sa
suppression, la surface d'attaque existe. Le corriger supposerait que les fournisseurs cloud
revoient leur génération d'identifiants. On leur a remonté le sujet. Ce n'est visiblement pas
une priorité, et vu la rareté du scénario ça se comprend. Le vrai enseignement est ailleurs.
Quand l'isolation compte vraiment, mieux vaut séparer les charges dans plusieurs clusters que
parier sur l'isolation entre nœuds d'un même cluster.

---

Article et support disponibles sur le [site du SSTIC](https://www.sstic.org/2025/).
L'émulateur `kne.py` est publié sur [GitHub](https://github.com/Sarapuce/kne).
