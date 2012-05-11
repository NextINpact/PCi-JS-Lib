// La bibli de check
// Attention, celle-ci nécessite les bibli "core" pour fonctionner
(function () {

    // On déclare l'objet
    var PCi_Check =
    {
        // La fonction qui vérifie si de nouvelles actualités / brèves sont là
        // Elle enregistre les dernières actus dans le localStorage
        // Elle renvoie un objet contenant les nouvelles actualités / brèves uniquement
        Actus:function () {
            // On récupère le JSON d'actus et on définit les variables utiles
            var news = PCi.get_news("", "", 0);
            var last_check;

            console.log("Actualités récupérées");

            // Si les actus ont déjà été checkées, on récupère le résultat
            if (localStorage["pci_last_actu_check"])
                last_check = JSON.parse(localStorage["pci_last_actu_check"]);
            // Sinon, on initialise la valeur avec l'objet JSON récupéré
            else {
                last_check = news;
                console.log("Les actualités n'avaient jamais été vérifiées. Attribution : OK");
            }

            // La fonction qui vérifie qu'une actu est nouvelle ou non
            function is_new(actu, array) {
                // Par défaut on renvoie true
                var result = true;

                // On parcourt le tableau d'actus
                for (var sub_key in array) {
                    // Si on trouve l'actu avec son ID et sa date identique, on renvoie false et on passe
                    if (array[sub_key].Id == actu.Id && array[sub_key].PublishDate.old_format == actu.PublishDate.old_format) {
                        result = false;
                        break;
                    }
                }
                // Si aucune correspondance exacte n'a été trouvée, c'est true qui sera renvoyé
                return result;
            }

            ///////////////////////////////////
            // Zone de test
            ///////////////////////////////////
            //for(key in last_check.List){last_check.List[key].Id = 0;}
            //last_check.List[1].PublishDate = 0;
            ///////////////////////////////////

            // On définit le tableau de sortie
            var result = new Array();

            // Si le premier ID a changé, ou que le nombre total de news à changé, il y a du nouveau
            if (news.List[0].Id != last_check.List[0].Id || news.NbNews != last_check.NbNews) {
                // Pour chaque actu de la liste
                for (var key in news.List) {
                    // Si l'actu est nouvelle, on l'ajoute au tableau de sortie
                    if (is_new(news.List[key], last_check.List)) result.push(news.List[key]);
                }
            }

            console.log(result.length + " nouveau(x) contenu(s) détecté(s)");

            // On enregistre le JSON d'actus utilisé pour référence
            localStorage["pci_last_actu_check"] = JSON.stringify(news);

            // On renvoie le tableau contenant les nouvelles actualités
            return result;
        }
    };

    // On créé le raccourci vers la bibli
    if (!window.PCi_Check) {
        window.PCi_Check = PCi_Check;
    }
})();
