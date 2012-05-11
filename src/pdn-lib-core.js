// On place la bibli dans une fonction anonyme
(function () {
    // L'objet contenant les fonctions permettant de récupérer des infos depuis PdN
    var PdN =
    {
        // La fonction qui récupère les infos relatives aux bons plans
        get_bp:function (local_var_to_set) {
            var xhr = new XMLHttpRequest();

            // TODO : Changer l'URL en fonction de certains paramètres : mots clefs, type de tri, filtres...
            // On effectue une requête XHR2 afin de récupérer une page en tant que document DOM
            xhr.open('GET', 'http://www.prixdunet.com/bon-plan.html?motcle=&type=0&order=nb_lectures&way=desc', true);
            xhr.responseType = 'document';

            // Lorsque la requête est lancée, si le statut HTTP est bien 200
            xhr.onload = function (e) {
                if (this.status == 200) {
                    // On créé un tableau qui contiendra les résultats
                    var result = new Array();

                    // On définit les éléments utiles du document
                    var bp = this.response.getElementById("list_bp").getElementsByClassName("bp_table");
                    var titre = this.response.getElementById("list_bp").getElementsByClassName("bp_titre");

                    // Pour chaque élément récupéré
                    for (var i = 0; i < titre.length; i++) {

                        // On créé un objet qui contiendra toutes les variables nécessaires
                        var bon_plan = {
                            titre:titre[i].getElementsByTagName("a")[0].innerText,
                            date:titre[i].getElementsByTagName("span")[0].innerText,
                            categorie:{img:bp[i].getElementsByTagName("img")[0].src, url:bp[i].getElementsByTagName("a")[0].href},
                            url:titre[i].getElementsByTagName("a")[0].href,
                            // On rajoute la dernière date de vérification
                            // Comme cela ne peut être rajouté au tableau global, on le rajouté dans chaque élément
                            // TODO : améliorer cette solution
                            last_update_date:new Date().toString()
                        };

                        // On rajoute l'objet au tableau de sortie
                        result.push(bon_plan);
                    }

                    // TODO : Voir pour remplacer ce fonctionnement par l'utilisation d'une méthode de callback
                    // On stocke le tableau au sein d'une variable locale
                    localStorage[local_var_to_set] = JSON.stringify(result);
                }
            };
            xhr.send();
        }
    };

    // On créé le raccourci vers la bibli
    if (!window.PdN) {
        window.PdN = PdN;
    }
})();