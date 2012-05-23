// On utilise une IIFE pour éviter la nuisance
(function () {

    'use strict'; // Strict mode

    // On déclare les variables utiles
    var urls = { bonPlans:"http://www.prixdunet.com/bon-plan.html?motcle=&type=0&order=nb_lectures&way=desc" };

    // On créé un objet général
    var PdN = {};

    // La fonction qui récupère les informations des bons plans depuis la requête de la page
    // Une fois la réponse obtenue, elle exécute le callback
    PdN.getBonsPlans = function (callback) {
        // On exécute une requête v2 pour récupérer le contenu de la page sous forme de DOM
        PCi.tools.executeAsyncRequestV2("GET", urls.bonPlans, "document", function (resultat) {

            // On créé un tableau qui contiendra les bons plans
            var result = {};
            var bpArray = [];

            // On définit les éléments utiles du document
            var bp = resultat.response.getElementById("list_bp").getElementsByClassName("bp_table");
            var titre = resultat.response.getElementById("list_bp").getElementsByClassName("bp_titre");

            // Pour chaque élément récupéré
            for (var i = 0; i < titre.length; i++) {

                // On créé un objet qui contiendra toutes les variables nécessaires
                var bonPlan = {
                    titre:titre[i].getElementsByTagName("a")[0].innerText,
                    date:titre[i].getElementsByTagName("span")[0].innerText,
                    categorie:{img:bp[i].getElementsByTagName("img")[0].src, url:bp[i].getElementsByTagName("a")[0].href},
                    url:titre[i].getElementsByTagName("a")[0].href
                };

                // On rajoute l'objet au tableau de sortie
                bpArray.push(bonPlan);

                result = {list:bpArray, lastUpdateDate:new Date().toString(), error:false};
            }

            callback(result);
        });
    };

    // On créé le raccourci vers la bibli
    if (!window.PdN) window.PdN = PdN;
})();