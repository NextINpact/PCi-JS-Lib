// On utilise une IIFE pour éviter la nuisance
(function () {

    'use strict'; // Strict mode

    // On déclare les variables utiles
    var urls = {
        actus:"http://www.pcinpact.com/ReadApi/ListActu",
        emploi:"http://www.pcinpact.com/rss/emplois.xml",
        forum:"http://forum.pcinpact.com/",
        tshirt:"http://www.pcinpact.com/ReadApi/Teeshirt",
        user:"http://www.pcinpact.com/ReadApi/UserInfo"
    };

    // On déclare l'objet général
    var PCi = {};

    // La gestion des actualités
    PCi.actus = {

        // La fonction qui récupère les actualités
        get:function (redacteur, nb) {

            // Si les paramètres sont invalides, on lance une exception
            if (typeof (redacteur) != "string" || typeof (nb) != "number")
                throw "Impossible de rappatrier les actualités. Un des paramètres indiqué n'était pas valide";

            // On créé les paramètres qui seront passés dans la requête si nécessaire
            var form = false, parametersArray = new Array();
            if (redacteur != "" || nb > 0) {

                // On définit les paramètres à renvoyer
                if (redacteur != "") parametersArray.push("redacteur=", encodeURIComponent(redacteur), "&");
                if (nb > 0) parametersArray.push("nb_news=", nb);
                form = true;
            }

            // On effectue la requête permettant de récupérer les actualités
            var actus = JSON.parse(PCi.tools.executeSyncRequest("POST", urls.actus, parametersArray.join(""), form));

            // On remplace l'élément de date par un élément utilisable
            // On garde la valeur renvoyée au sein de PublishDate.old_format
            for (var key in actus.List) {
                var d = actus.List[key].PublishDate.dateFromDotNet();
                var dateFR = d.toFR(false);

                actus.List[key].PublishDate = {
                    "date":dateFR,
                    "time":d.toTimeString(":"),
                    old_format:actus.List[key].PublishDate};
            }

            // On rajoute la date de check et on précise que tout s'est bien passé
            actus.lastUpdateDate = new Date().toString();

            return actus;
        },

        // La fonction qui vérifie l'existence de nouvelles actualités
        check:function () {

            // La fonction qui permet de déterminer si un contenu est nouveau ou non
            function isItNew(contentToCheck, contentArray) {
                // Par défaut on renvoie true
                var result = true;

                // On parcourt le tableau de contenus
                for (var key in contentArray) {
                    // Si on trouve l'actu avec son ID et sa date identique, on renvoie false
                    if (contentArray[key].Id == contentToCheck.Id &&
                        contentArray[key].PublishDate.old_format == contentToCheck.PublishDate.old_format) {
                        result = false;
                        break;
                    }
                }

                return result;
            }

            // On récupère le JSON d'actus et on définit les variables utiles
            var actus = PCi.actus.get("", 0), lastCheckLocalVarName = "PCiActusLastCheck", result = {};

            // Si la variable locale existe, un premier check a déjà été effectué, il peut y avoir du nouveau
            if (localStorage[lastCheckLocalVarName]) {
                var lastCheckTemp = JSON.parse(localStorage[lastCheckLocalVarName]);

                /* === Zone de test === */
                //for(key in last_check.List){last_check.List[key].Id = 0;}
                //last_check.List[1].PublishDate = 0;

                // On définit le tableau de sortie
                var newActusArray = new Array();

                // Si le premier ID ou que le nombre total de news ont changé, il y a du nouveau
                if (actus.List[0].Id != lastCheckTemp.List[0].Id || actus.NbNews != lastCheckTemp.NbNews) {
                    // Pour chaque actu de la liste
                    for (var key in actus.List) {
                        // Si l'actu est nouvelle, on l'ajoute au tableau de sortie
                        if (isItNew(actus.List[key], lastCheckTemp.List)) newActusArray.push(actus.List[key]);
                    }
                }

                // On place le tableau de nouvelles actus dans la variable de sortie
                result = { List:newActusArray };

            }
            // Si l'on est dans le cas d'un premier check, on le précise dans le log
            else PCi.tools.logMessage("Première vérification des actualités", false);

            // On enregistre le JSON d'actus récupérées pour référence
            localStorage[lastCheckLocalVarName] = JSON.stringify(actus);

            // On rajoute la date de check et on précise que tout s'est bien passé
            result.lastUpdateDate = new Date().toString();

            // On renvoie le tableau contenant les nouvelles actualités
            return result;
        }
    };

    // La gestion de la section emploi
    PCi.emploi = {

        // La fonction qui permet de récupérer la liste des offres d'emploi
        get:function (callback) {

            // On exécute la requête sur le fichier XML
            PCi.tools.executeAsyncRequestV2("GET", urls.emploi, "document", function (requestResult) {

                // On récupère les champs "item" et on déclare le tableau et l'objet de sortie
                var offresXML = requestResult.response.getElementsByTagName("item"), offresArray = [], sortie = {};

                // On transforme chacun des éléments en un objet
                for (var i = 0; i < offresXML.length; i++) {
                    var o = {};
                    o.title = offresXML[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                    o.url = offresXML[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
                    o.description = offresXML[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;

                    // On rajoute l'objet au tableau de sortie
                    offresArray.push(o);
                }

                // On remplie l'objet de sortie
                sortie.list = offresArray;
                sortie.lastUpdateDate = new Date().toString();
                sortie.error = false;

                // On passe la main au callback
                callback(sortie);
            });
        }
    };

    // La gestion du forum
    PCi.forum = {

        // La fonction qui permet de récupérer les données du forum
        // Une fois la réponse obtenue, elle exécute le callback
        get:function (callback) {

            // On exécute la requête sur la page du forum
            PCi.tools.executeAsyncRequestV2("GET", urls.forum, "document", function (requestResult) {

                // On récupère les données de l'utilisateur et du gagnant du t-shirt
                var user = requestResult.response.getElementById("user_link");
                var gagnant = requestResult.response.getElementById("index_stats").getElementsByClassName("bbc_member")[0];

                // On intègre les éléments de base dans la variable de résultat
                var resultat = {};
                resultat.last_update_date = new Date().toString();

                if (gagnant) {
                    var gagnantLink = gagnant.href;
                    resultat.gagnant = {name:gagnant.innerText, url:gagnantLink};
                }

                // Si l'utilisateur est connecté, on obtiendra une valeur non nulle
                if (user != null) {

                    // On récupère les données concernant les messages et les notifications
                    var messages = requestResult.response.getElementById("inbox_link");
                    var notifications = requestResult.response.getElementById("notify_link");

                    // Si le contenu des balises est vide, on renvoie 0
                    if (encodeURIComponent(messages.innerText) == "%C2%A0") messages.innerText = "0";
                    if (encodeURIComponent(notifications.innerText) == "%C2%A0") notifications.innerText = "0";

                    var messagesLink = messages.href;
                    var notificationsLink = notifications.href;

                    resultat.messages = {count:parseInt(messages.innerText), url:messagesLink};
                    resultat.notifications = {count:parseInt(notifications.innerText), url:notificationsLink};
                    resultat.user = {name:user.innerText, url:user.href};
                    resultat.isLoggedIn = true;

                }
                // Si l'utilisateur n'est pas connecté, on enregistre un objet spécifique
                else resultat.isLoggedIn = false;

                callback(resultat);
            })

        }
    };

// La gestion des utilisateurs
    PCi.user = {

        getInfos:function () {

            // On récupère les informations de l'utilisateur
            // On rajoute la date de check et on précise que tout s'est bien passé
            var result = JSON.parse(PCi.tools.executeSyncRequest("POST", urls.user, "", false));
            result.lastUpdateDate = new Date().toString();

            return result;
        }
    };

// On créé le raccourci vers la bibli
    if (!window.PCi) window.PCi = PCi;
})();