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

Recherche menée avec Paul Viossat, présentée au SSTIC 2025. Elle prolonge un travail de
l'année précédente sur l'isolation des nœuds, cette fois appliqué aux clusters dynamiques,
dont les nœuds démarrent et s'arrêtent automatiquement selon la charge.

## Contexte

La plupart des recherches sur l'isolation Kubernetes partent d'un cluster figé, aux nœuds
déjà démarrés. En production sur le cloud, l'autoscaler crée et supprime des nœuds en continu
pour suivre la demande. Cette mécanique n'avait pas été étudiée du point de vue d'un
attaquant.

L'objectif était de partir d'un seul nœud compromis, typiquement un runner CI/CD mal
configuré, et de remonter jusqu'au contrôle du cluster entier.

## La faille

Chaque nœud porte un attribut `providerID` qui identifie la machine correspondante chez le
fournisseur cloud. Le `cloud-controller-manager` et l'autoscaler s'appuient sur ce champ pour
déterminer quelle VM démarrer ou supprimer.

Deux comportements, anodins isolément, deviennent exploitables une fois combinés.

Au démarrage, le kubelet crée lui-même son objet nœud et rien ne l'empêche d'y inscrire le
`providerID` de son choix. Le champ est réputé immuable une fois posé, mais le supprimer puis
recréer le nœud suffit à le modifier.

Second point, les identifiants d'un nœud ne sont pas révoqués à sa suppression. Ils restent
valides quatorze minutes sur AWS, jusqu'à un an sur GKE. Un nœud supprimé peut donc être
recréé avec les mêmes identifiants et des caractéristiques différentes.

Combinés, ces deux comportements constituent un IDOR de second ordre : l'autoscaler agit sur
une VM réelle à partir d'un identifiant contrôlé par l'attaquant.

## Primitives d'exploitation

Trois primitives en découlent.

**Recréer un nœud avec des attributs arbitraires.** L'autoscaler est utilisé pour supprimer
le nœud compromis, qui est ensuite recréé avec les labels et les taints souhaités. Un
émulateur dédié, [`kne.py`](https://github.com/Sarapuce/kne), maintient ce nœud côté API pour
éviter qu'il soit nettoyé.

**Supprimer n'importe quel nœud du cluster.** En attribuant au nœud contrôlé le `providerID`
d'un autre nœud, c'est ce dernier que l'autoscaler supprime. La machine cible est détruite
sans avoir été compromise.

**Attirer un pod sensible.** Les deux primitives combinées permettent de recréer un nœud
imitant la cible d'un pod privilégié, de supprimer le nœud légitime, et de faire reprogrammer
le pod sur le nœud contrôlé.

Le scénario complet part d'un runner CI/CD compromis dans un pool isolé et aboutit au nœud
admin, dont l'isolation était pourtant correctement configurée. Une fois le pod admin
reprogrammé sur un nœud contrôlé, un token est émis pour son service account, donnant les
droits `cluster-admin`.

## Contre-mesures

Le correctif principal est simple. Le `providerID` doit être posé par le
`cloud-controller-manager`, pas par le kubelet. Une policy d'admission (OPA ou Kyverno)
interdisant au kubelet de renseigner son propre `providerID` referme la voie dans la plupart
des cas.

Le problème de fond est plus difficile. Tant que les identifiants d'un nœud survivent à sa
suppression, la surface d'attaque demeure. Le corriger supposerait une révision de la
génération d'identifiants par les fournisseurs cloud ; la vulnérabilité leur a été remontée,
sans être traitée comme prioritaire compte tenu de la rareté du scénario. En pratique, lorsque
l'isolation est critique, la séparation des charges dans plusieurs clusters reste plus robuste
que l'isolation entre nœuds d'un même cluster.

---

Article et support disponibles sur le [site du SSTIC](https://www.sstic.org/2025/).
L'émulateur `kne.py` est publié sur [GitHub](https://github.com/Sarapuce/kne).
