#README

##Qu'est-ce que la pci-js-lib ?

Librairie Javascript exploitée au sein des extensions Chrome de [PC INpact](http://www.pcinpact.com) / [Prix du Net](http://www.prixdunet.com). Celle-ci a été pensée uniquement pour Chrome, et pourrait ne pas être compatible avec d'autres navigateurs, notamment IE. Elle est INdépendante de toute librairie externe.

* /src : les différents modules de la librairie
* /js  : la version compilée / minifiée

Application utilisée pour la compilation et la minification : [Google Closure Compiler](https://developers.google.com/closure/compiler/)

##Utilisation :

Pour utiliser la librairie, il vous suffit de placer le fichier `pci-lib-min.js` au sein de votre arborescence, par exemple au sein du répertoire `/js/`, puis de l'intégrer de la sorte au sein de votre cotre HTML : 

    <script type="text/javascript" src="/js/pci-lib-min.js"></script>

##Auteurs :

* [LEGRAND David](https://github.com/davidpci) (david@pcinpact.com)