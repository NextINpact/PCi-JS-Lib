// On utilise une IIFE pour éviter la nuisance
(function () {

    // On déclare les variables utiles
    var urls = { bonPlans:"http://www.prixdunet.com/bon-plan.html?motcle=&type=0&order=nb_lectures&way=desc" };

    // On créé un objet général
    var PdN = new Object();

    // La fonction qui récupère les informations des bons plans depuis la requête de la page
    PdN.getBonsPlans = function () {
        PCi.tools.executeAsyncRequestV2("GET", urls.bonPlans, "document", function (request) {

            // On créé un tableau qui contiendra les bons plans
            var result;
            var bpArray = new Array();

            try {
                // On définit les éléments utiles du document
                var bp = request.response.getElementById("list_bp").getElementsByClassName("bp_table");
                var titre = request.response.getElementById("list_bp").getElementsByClassName("bp_titre");

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
            }
                // En cas de souci on renvoie un objet spécifique et on log l'erreur
            catch (e) {
                result = {error:true, message:e.message};
                PCi.tools.logMessage(e.message, true);
            }

            // On enregistre le résultat
            // TODO : Voir pour remplacer par un "message passing"
            localStorage["PdNBonsPlansLastCheck"] = JSON.stringify(result);
        });
    };

    // On créé le raccourci vers la bibli
    if (!window.PdN) window.PdN = PdN;
})();