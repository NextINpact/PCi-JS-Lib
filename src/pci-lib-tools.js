// On utilise une IIFE pour éviter la nuisance
(function () {

    // On déclare les variables utiles
    var urls = {
        qrcode:"http://api.qrserver.com/v1/create-qr-code/?size=100x100&data=",
        social:{
            facebook:"https://graph.facebook.com/?ids=",
            twitter:"http://urls.api.twitter.com/1/urls/count.json?url="
        }
    };

    // On déclare l'objet général
    var PCi = new Object();

    // La boîte à outils
    PCi.tools = {

        // La fonction qui renvoie l'URL d'un QR Code depuis une URL à transformer
        getQRCodeURL:function (url) {
            return urls.qrcode + encodeURI(url);
        },

        // La fonction qui récupère le nombre de partages sociaux d'une URL
        getSocialCount:function (url) {

            // On effectue les requêtes permettant de récupérer les données de l'url indiquée
            var fb = JSON.parse(PCi.tools.executeSyncRequest("GET", urls.social.facebook + url, false)).shares;
            var tw = JSON.parse(PCi.tools.executeSyncRequest("GET", urls.social.twitter + url, false)).count;
            var total = PCi.tools.stringToInt(fb) + PCi.tools.stringToInt(tw);

            // On met en forme le résultat
            return {
                facebook:fb,
                twitter:tw,
                total:total
            };
        },

        // La fonction qui permet de gérer l'exécution d'une requête
        executeSyncRequest:function (type, url, parameters, form) {

            // On déclare la requête et les variables utiles
            var xhr = new XMLHttpRequest();
            var formHeader = "Content-Type', 'application/x-www-form-urlencoded";

            // Si l'on demande un traitement de type "formulaire" on déclare le header adéquat
            if (form) xmlhttp.setRequestHeader(formHeader);

            // On envoie la requête et on renvoie le résultat, fonctionnement synchrone
            xhr.open(type, url, false);
            xhr.send(parameters);
            return xhr.responseText;
        },

        // La fonction qui permet de gérer l'exécution d'une requête XHR2
        executeAsyncRequestV2:function (type, url, responseType, callback) {

            // On déclare la requête avec ses paramètres
            // Le fonctionnement de type asynchrone est imposé
            var xhr = new XMLHttpRequest();
            xhr.open(type, url, true);

            // On déclare un type de réponse, puisqu'il s'agit d'une requête XHR2
            xhr.responseType = responseType;

            // Lorsque la requête est validée, on exécute le callback en passant le résultat en paramètre
            xhr.onload = function () {
                if (this.status == 200) {
                    callback(this);
                }
            };
            xhr.send(null);
        },

        // La fonction qui effectue un log
        logMessage:function (message, error) {

            // On n'exécute la commande que si la variable nécessaire est disponible dans le localStorage
            // Actif aussi dans le cas de la notification d'une erreur
            if (localStorage["PCiEnableLog"] || error) {
                // On déclare un tableau qui sert à mettre en forme le message
                var messageArray = new Array();

                if (error) messageArray.push("### Erreur ###");
                messageArray.push(new Date().toFR(true), "-", message);

                // On affiche le message dans le log
                console.log(messageArray.join(" "));
            }
        },

        // La fonction qui transforme un champ texte en entier
        stringToInt:function (value) {
            var result = 0;
            if (value) result = parseInt(value);
            return result;
        },

        // La fonction qui récupère une image via son URL pour la placer dans un string/blob local
        urlToLocalBlob:function (url) {

            PCi.tools.executeAsyncRequestV2("GET", url, "arraybuffer", function (request) {
                // On place le tout dans un try / catch pour remonter les éventuelles erreurs
                try {
                    // On définit les FileReader et BlobBuilder (spécifique à Webkit pour le moment)
                    var fr = new FileReader();
                    var bb = new WebKitBlobBuilder();

                    // On créé le blob et on lit ses données via un FileReader
                    // On stocke le résultat dans le localStorage
                    bb.append(request.response);
                    fr.readAsDataURL(bb.getBlob("image/png"));
                    fr.onload = function (e) {
                        localStorage["qrCodeBlob"] = e.target.result;
                    };
                }
                catch (e) {
                    PCi.tools.logMessage(e.message, true);
                }
            })
        }
    };

    // On créé le raccourci vers la bibli
    if (window.PCi && !window.PCi.tools) window.PCi.tools = PCi.tools;
})();