// On place la bibli dans une fonction anonyme
(function () {
    // L'objet contenant les fonctions permettant de récupérer des infos depuis PCi
    var PCi =
    {
        // La fonction qui récupère les infos relatives aux actualités / brèves
        get_news:function (action, redacteur, nb) {
            // On vérifie la validité des paramètes
            if (typeof (action) == "string" && typeof (redacteur) == "string" && typeof (nb) == "number") {

                // On définit l'URL du fichier source
                var url = "http://www.pcinpact.com/ReadApi/ListActu";

                // On lance la requête en POST
                // Méthode imposée par l'API
                // On effectue une requête synchrone pour ne renvoyer le résultat que lorsqu'on l'a obtenu
                var xmlhttp = new XMLHttpRequest();
                var parameters = "";
                xmlhttp.open("POST", url, false);

                // Si l'on indique un rédacteur ou un nombre de news
                if (redacteur != "" || nb > 0) {
                    // On indique dans le header que l'on va renvoyer des informations avec la requete
                    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                    // On définit les paramètres à renvoyer
                    if (redacteur != "")
                        parameters += "redacteur=" + encodeURIComponent(redacteur) + "&";
                    if (nb > 0)
                        parameters += "nb_news=" + nb;
                }

                // On exécute la requête
                xmlhttp.send(parameters);

                // On récupère la réponse de la requête comme un objet JSON
                var news = JSON.parse(xmlhttp.responseText);

                // On remplace l'élément de date par un élément utilisable
                // On garde la valeur renvoyée au sein de PublishDate.old_format
                for (var key in news.List) {
                    var d = json_to_Date(news.List[key].PublishDate);
                    var date_fr = Date_to_fr(d, false);
                    var hour = Date_to_time(d, ":");
                    var old_format = news.List[key].PublishDate;
                    news.List[key].PublishDate = {"date":date_fr, "time":hour, old_format:old_format};
                }

                // En fonction de l'action demandée, on renvoie un objet différent
                // TODO : Rajouter une gestion d'un traitement différencié des actus / brèves
                var result;
                switch (action) {
                    // Uniquement la liste de news
                    case "List":
                        result = news.List;
                        break;

                    // Le nombre de news et l'ID de la dernière publiée
                    case "Check":
                        result =
                        {
                            NbNews:news.NbNews,
                            LastIdNews:news.List[0].Id
                        };
                        break;

                    // L'objet JSON complet
                    default:
                        result = news;
                        break;
                }

                // On rajoute la date de vérification dans l'objet renvoyé
                result.last_update_date = new Date().toString();

                return result;
            }
        },
        // La fonction qui récupère les infos relatives à l'utilisateur
        get_user_infos:function (action) {
            // On vérifie la validité des paramètes
            if (typeof (action) == "string") {
                // On définit l'URL du fichier source
                var url = "http://www.pcinpact.com/ReadApi/UserInfo";

                // On lance la requête en POST
                // Méthode imposée par l'API
                // On effectue une requête synchrone pour ne renvoyer le résultat que lorsqu'on l'a obtenu
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("POST", url, false);
                xmlhttp.send("");
                var user = JSON.parse(xmlhttp.responseText);

                // En fonction de l'action, on renvoie l'info demandée
                switch (action) {
                    case "IsRegistered":
                    case "IsPremium":
                    case "Login":
                    case "Id":
                    case "NbPostsForum":
                    case "NbComments":
                        return user[action];
                        break;

                    case "Pm_Expiration":
                    case "Pm_UrlRss":
                    case "Pm_UrlQr":
                        return user["PremiumInfo"][action];
                        break;

                    case "Pm_Infos":
                        return user["PremiumInfo"];
                        break;

                    // Dans tous les autres cas, on renvoie l'objet user complet
                    default:
                        return user;
                        break;
                }
            }
        },
        // La fonction qui stock le QR Code comme un blob dans le localStorage
        get_qr_to_blob:function (url) {

            // On définit la requête XHR2
            // On utilise une réponse de type Arraybuffer puisque blob ne fonctionne pas encore
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";

            // Lorsque la requête s'exécute et que le code HTTP renvoyé est 200
            xhr.onload = function (e) {
                if (xhr.status === 200) {
                    try {
                        // On définit les FileReader et BlobBuilder (spécifique à Webkit pour le moment)
                        var fr = new FileReader();
                        var bb = new WebKitBlobBuilder();

                        // On créé le blob et on lit ses données via un FileReader
                        // On stocke le résultat dans le localStorage
                        bb.append(this.response);
                        fr.readAsDataURL(bb.getBlob('image/png'));
                        fr.onload = function (e) {
                            localStorage["qr_code_blob"] = e.target.result;
                        };
                    }
                    catch (e) {
                        console.log("Erreur lors de la récupération du QR Code : " + e.message);
                    }
                }
            };
            // Send XHR
            xhr.send();
        },
        // La fonction qui récupère les infos relatives au t-shirt du jour
        get_tshirt_winner_infos:function () {
            // On définit l'URL du fichier source
            var url = "http://www.pcinpact.com/ReadApi/Teeshirt";

            // On lance la requête en POST
            // Méthode imposée par l'API
            // On effectue une requête synchrone pour ne renvoyer le résultat que lorsqu'on l'a obtenu
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", url, false);
            xmlhttp.send("");

            // On renvoie directement l'objet JSON
            return JSON.parse(xmlhttp.responseText);
        },
        // La fonction qui récupère les infos du forum
        get_forum_infos:function (local_var_to_set) {

            // On effectue une requête XHR2 afin de récupérer une page en tant que document DOM
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://forum.pcinpact.com/', true);
            xhr.responseType = 'document';

            // Lorsque la requête est lancée, si le statut HTTP est bien 200
            xhr.onload = function (e) {
                if (this.status == 200) {

                    console.log("Contenu du forum récupéré");

                    // On récupère les données de l'utilisateur et du gagnant du t-shirt
                    var user = this.response.getElementById("user_link");
                    var gagnant = this.response.getElementById("index_stats").getElementsByClassName("bbc_member")[0];
                    var gagnant_link = gagnant.href;

                    // Si l'utilisateur est connecté, on obtiendra une valeur non nulle
                    if (user != null) {
                        // On récupère les données concernant les messages et les notifications
                        var messages = this.response.getElementById("inbox_link");
                        var notifications = this.response.getElementById("notify_link");

                        // Si le contenu des balises est vide, on renvoie 0
                        if (encodeURIComponent(messages.innerText) == "%C2%A0") messages.innerText = "0";
                        if (encodeURIComponent(notifications.innerText) == "%C2%A0") notifications.innerText = "0";

                        var messages_link = messages.href;
                        var notifications_link = notifications.href;

                        // On enregistre l'objet final dans le localStorage
                        // TODO : utiliser plutôt une fonction de callback
                        localStorage[local_var_to_set] = JSON.stringify({
                            gagnant:{name:gagnant.innerText, url:gagnant_link},
                            messages:{count:parseInt(messages.innerText), url:messages_link},
                            notifications:{count:parseInt(notifications.innerText), url:notifications_link},
                            user:{name:user.innerText, url:user.href},
                            is_connected:true,
                            last_update_date:new Date().toString()
                        });

                        console.log("Informations du forum en cache - Utilisateur connecté");
                    }
                    else {
                        // Si l'utilisateur n'est pas connecté, on enregistre un objet spécifique
                        localStorage[local_var_to_set] = JSON.stringify({
                            gagnant:{name:gagnant.innerText, url:gagnant_link},
                            is_connected:false,
                            last_update_date:new Date().toString()
                        });
                        console.log("Informations du forum en cache - Utilisateur déconnecté");
                    }
                }
            };

            xhr.send();
        }
    };

    // On créé le raccourci vers la bibli
    if (!window.PCi) {
        window.PCi = PCi;
    }
})();