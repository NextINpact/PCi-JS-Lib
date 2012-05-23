// On utilise une IIFE pour éviter la nuisance
(function () {

    'use strict'; // Strict mode

    // On déclare les variables utiles
    var urls = {
        actus:"http://www.pcinpact.com/ReadApi/ListActu",
        forum:"http://forum.pcinpact.com/",
        tshirt:"http://www.pcinpact.com/ReadApi/Teeshirt",
        user:"http://www.pcinpact.com/ReadApi/UserInfo"
    };

    // On déclare l'objet général
    var PCi = new Object();

    // La gestion des actualités
    PCi.actus = {

        // La fonction qui récupère les actualités
        get:function (redacteur, nb) {

            // On définit la variable de sortie
            var actus = new Object();

            // On vérifie la validité des paramètes
            if (typeof (redacteur) == "string" && typeof (nb) == "number") {

                // On créé les paramètres qui seront passés dans la requête si nécessaire
                var form;
                var parametersArray = new Array();

                if (redacteur != "" || nb > 0) {
                    form = true;

                    // On définit les paramètres à renvoyer
                    if (redacteur != "") parametersArray.push("redacteur=", encodeURIComponent(redacteur), "&");
                    if (nb > 0) parametersArray.push("nb_news=", nb);
                }

                // On place les éléments dans un try/catch pour récupérer une erreur éventuelle
                try {
                    // On effectue la requête permettant de récupérer les actualités
                    actus = JSON.parse(PCi.tools.executeSyncRequest("POST", urls.actus, parametersArray.join(""), form));

                    PCi.tools.logMessage("Actualités récupérées");

                    // On remplace l'élément de date par un élément utilisable
                    // On garde la valeur renvoyée au sein de PublishDate.old_format
                    // On rajoute les décomptes issus des réseaux sociaux
                    for (var key in actus.List) {
                        var d = actus.List[key].PublishDate.dateFromDotNet();
                        var dateFR = d.toFR(false);
                        actus.List[key].PublishDate = {
                            "date":dateFR,
                            "time":d.toTimeString(":"),
                            old_format:actus.List[key].PublishDate};

                        //actus.List[key].socialCount = PCi.tools.getSocialCount(actus.List[key].AbsoluteUrl);

                    }

                    PCi.tools.logMessage("Mise en forme de la date et compteurs sociaux : OK");

                    // On rajoute la date de check et on précise que tout s'est bien passé
                    actus.lastUpdateDate = new Date().toString();
                    actus.error = false;
                }
                    // En cas d'erreur, on effectue un log et on renvoie un objet spécifique
                catch (e) {
                    actus = {error:true, message:e.message};
                    PCi.tools.logMessage(e.message, true);
                }

            }
            else actus = {error:true, message:"Un des paramètres indiqué n'était pas valide"};

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

            // On indique que l'on a lancé la vérification des actualités
            PCi.tools.logMessage("Vérification des actualités en cours", false);

            // On récupère le JSON d'actus et on définit les variables utiles
            var actus = PCi.actus.get("", 0);
            var lastCheckLocalVarName = "PCiActusLastCheck";
            var result = new Object();

            // Si tout s'est bien passé avec la récupération des actus
            if (!actus.error) {
                // Si la variable locale existe, un premier check a déjà été effectué, il peut y avoir du nouveau
                if (localStorage[lastCheckLocalVarName]) {
                    var lastCheckTemp = JSON.parse(localStorage[lastCheckLocalVarName]);

                    /* === Zone de test === */
                    //for(key in last_check.List){last_check.List[key].Id = 0;}
                    //last_check.List[1].PublishDate = 0;

                    // On définit le tableau de sortie
                    var newActusArray = new Array();

                    // Si le premier ID a changé, ou que le nombre total de news à changé, il y a du nouveau
                    if (actus.List[0].Id != lastCheckTemp.List[0].Id || actus.NbNews != lastCheckTemp.NbNews) {
                        // Pour chaque actu de la liste
                        for (var key in actus.List) {
                            // Si l'actu est nouvelle, on l'ajoute au tableau de sortie
                            if (isItNew(actus.List[key], lastCheckTemp.List)) newActusArray.push(actus.List[key]);
                        }
                    }

                    // On place la liste dans la variable de sortie
                    result = { list:newActusArray };

                    // Si de nouvelles actus ont été trouvées on affiche un message dans le log
                    if (newActusArray.length > 0)
                        PCi.tools.logMessage(newActusArray.length + " nouveau(x) contenu(s) détecté(s)", false);
                }
                // Si l'on est dans le cas d'un premier check, on le précise dans le log
                else PCi.tools.logMessage("Première vérification des actualités", false);

                // On enregistre le JSON d'actus récupérées pour référence
                localStorage[lastCheckLocalVarName] = JSON.stringify(actus);

                // On rajoute la date de check et on précise que tout s'est bien passé
                result.lastUpdateDate = new Date().toString();
                result.error = false;
            }
            else {
                result = { error:true, message:"Une erreur est intervenue durant la vérification des actualités" };
                PCi.tools.logMessage(result.message, result.error);
            }

            // On renvoie le tableau contenant les nouvelles actualités
            return result;
        } };

    // La gestion du forum
    PCi.forum = {

        get:function (localVarToSet) {

            // On place le tout dans un try / catch pour remonter d'éventuelles erreurs
            try {
                // On exécute la requête sur la page du forum
                PCi.tools.executeAsyncRequestV2("GET", urls.forum, "document", function (request) {

                    PCi.tools.logMessage("Contenu du forum récupéré", false);

                    // On récupère les données de l'utilisateur et du gagnant du t-shirt
                    var user = request.response.getElementById("user_link");
                    var gagnant = request.response.getElementById("index_stats").getElementsByClassName("bbc_member")[0];
                    var gagnantLink = gagnant.href;

                    // Si l'utilisateur est connecté, on obtiendra une valeur non nulle
                    if (user != null) {
                        // On récupère les données concernant les messages et les notifications
                        var messages = request.response.getElementById("inbox_link");
                        var notifications = request.response.getElementById("notify_link");

                        // Si le contenu des balises est vide, on renvoie 0
                        if (encodeURIComponent(messages.innerText) == "%C2%A0") messages.innerText = "0";
                        if (encodeURIComponent(notifications.innerText) == "%C2%A0") notifications.innerText = "0";

                        var messagesLink = messages.href;
                        var notificationsLink = notifications.href;

                        // On enregistre l'objet final dans le localStorage
                        localStorage[localVarToSet] = JSON.stringify({
                            gagnant:{name:gagnant.innerText, url:gagnantLink},
                            messages:{count:parseInt(messages.innerText), url:messagesLink},
                            notifications:{count:parseInt(notifications.innerText), url:notificationsLink},
                            user:{name:user.innerText, url:user.href},
                            is_connected:true,
                            last_update_date:new Date().toString()
                        });

                        PCi.tools.logMessage("Informations du forum en cache - Utilisateur connecté", false);
                    }
                    // Si l'utilisateur n'est pas connecté, on enregistre un objet spécifique
                    else {
                        localStorage[localVarToSet] = JSON.stringify({
                            gagnant:{name:gagnant.innerText, url:gagnantLink},
                            is_connected:false,
                            last_update_date:new Date().toString()
                        });

                        PCi.tools.logMessage("Informations du forum en cache - Utilisateur déconnecté", false);
                    }
                })
            }
            catch (e) {
                PCi.tools.logMessage(e.message, true)
            }
        }
    };

    // La gestion des utilisateurs
    PCi.user = {

        get:function () {

            // On définit la variable de sortie
            var result = new Object();

            // On place l'action dans un try / catch pour récupérer d'éventuelles erreurs
            try {
                // On récupère les informations de l'utilisateur
                result = JSON.parse(PCi.tools.executeSyncRequest("POST", urls.user, "", false));

                // On rajoute la date de check et on précise que tout s'est bien passé
                result.lastUpdateDate = new Date().toString();
                result.error = false;
            }
            catch (e) {
                result = {error:true, message:e.message};
                PCi.tools.logMessage(e.message, true);
            }
            return result;
        }
    };

    // On créé le raccourci vers la bibli
    if (!window.PCi) window.PCi = PCi;
})();