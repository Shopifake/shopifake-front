# 🛍️ Shopifake Front-End

Interface utilisateur moderne pour une plateforme e-commerce multi-tenant permettant de créer et gérer des boutiques en ligne personnalisées.

## 🎯 À propos de l'application

Shopifake est une application web complète construite avec **React**, **TypeScript** et **Vite** qui offre deux expériences distinctes :

### 🏪 Pour les propriétaires de boutiques

Un **tableau de bord complet** permettant de :
- **Créer et gérer plusieurs boutiques** en ligne via un système multi-tenant
- **Gérer les produits** : ajout, modification, suppression avec gestion des variantes
- **Suivre les stocks** : monitoring en temps réel des niveaux d'inventaire
- **Gérer les utilisateurs et équipes** : invitations et gestion des permissions
- **Configurer les sites** : personnalisation complète de l'apparence et des fonctionnalités
- **Prévisualiser en temps réel** : voir les changements avant publication
- **Consulter les logs d'audit** : traçabilité de toutes les actions
- **Analyser les performances** : vue d'ensemble des ventes et statistiques

### 🛒 Pour les clients finaux

Une **expérience de boutique en ligne** moderne avec :
- **Navigation fluide et intuitive** entre les produits
- **Interface responsive** adaptée à tous les appareils
- **Personnalisation complète** : chaque boutique a son propre design et identité
- **Système de sous-domaines** : chaque boutique dispose de son URL unique
- **Panier et paiements sécurisés**
- **Recherche et filtres** pour trouver facilement les produits

## ✨ Fonctionnalités principales

### Page d'accueil marketing
- **Section hero dynamique** avec effets de proximité sur le texte
- **Présentation des fonctionnalités** clés de la plateforme
- **Effets visuels interactifs** (BlobCursor) pour une expérience engageante
- **Appels à l'action** pour créer une boutique ou voir une démo

### Système d'authentification
- **Connexion et inscription** pour les propriétaires de boutiques
- **Gestion de session** sécurisée
- **Notifications toast** pour les feedbacks utilisateur

### Gestion multi-tenant
- **Création de sites illimitée** par propriétaire
- **Isolation complète** entre les boutiques
- **Configuration indépendante** pour chaque site
- **Gestion des statuts** : brouillon, actif, suspendu

### Architecture technique
- **Composants Radix UI** pour une interface accessible et moderne
- **Tailwind CSS** pour un design cohérent et responsive
- **React Hook Form** pour la gestion des formulaires
- **Recharts** pour les graphiques et analytics
- **Sonner** pour les notifications
- **Lucide React** pour les icônes

## 🎨 Design et expérience utilisateur

L'application met l'accent sur :
- **Une interface épurée et professionnelle**
- **Des animations fluides et subtiles**
- **Une navigation intuitive** avec un menu latéral pour le dashboard
- **Un thème cohérent** avec support du mode sombre
- **Des effets interactifs** qui enrichissent l'expérience sans être intrusifs

## 🏗️ Architecture de l'application

```
- Landing Page → Page d'accueil marketing
- Owner Dashboard → Interface de gestion complète
  ├── Overview → Vue d'ensemble et statistiques
  ├── Sites → Liste et gestion des boutiques
  ├── Products → Catalogue de produits
  ├── Stock → Gestion des inventaires
  ├── Users → Gestion d'équipe
  ├── Audit → Historique des actions
  └── Profile → Paramètres du compte
- Storefront → Boutique en ligne pour les clients
- Preview Mode → Prévisualisation avant publication
```

## 🌐 Système de sous-domaines

Chaque boutique créée dispose de son propre sous-domaine, permettant une expérience complètement personnalisée et isolée pour chaque commerçant.

## 📦 Technologies utilisées

- **React 18** - Bibliothèque UI moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Vite** - Build tool ultra-rapide
- **Radix UI** - Composants accessibles et personnalisables
- **Tailwind CSS** - Framework CSS utilitaire
- **Motion** - Animations fluides
- **Embla Carousel** - Carrousels performants

---

**Shopifake** - Créez votre boutique en ligne en quelques clics 🚀