// On utilise une IIFE pour éviter la nuisance
(function () {

    // On définit des tableaux contenant la liste des jours et des mois
    var days = new Array();
    var months = new Array();

    days[0] = "Dimanche";
    days[1] = "Lundi";
    days[2] = "Mardi";
    days[3] = "Mercredi";
    days[4] = "Jeudi";
    days[5] = "Vendredi";
    days[6] = "Samedi";

    months[0] = "janvier";
    months[1] = "février";
    months[2] = "mars";
    months[3] = "avril";
    months[4] = "mai";
    months[5] = "juin";
    months[6] = "juillet";
    months[7] = "août";
    months[8] = "septembre";
    months[9] = "octobre";
    months[10] = "novembre";
    months[11] = "décembre";

    // On les rajoute aux objets de Date via leur prototype
    Date.prototype.daysArray = days;
    Date.prototype.monthsArray = months;

    // La fonction qui créé une date à partir d'une version .Net
    String.prototype.dateFromDotNet = function () {
        var indexFin = (this.length - 2);		// On récupère l'index de fin qui servira à l'extraction du Timestamp
        var timeStamp = this.substring(6, indexFin);	// On récupère le Timestamp sous forme d'une string
        return new Date(parseInt(timeStamp));   		// On créé la date depuis le Timestamp (string) via entier
    };

    // La fonction qui récupère l'heure depuis un élément Date
    Date.prototype.toTimeString = function (separateur) {

        // On rajoute un "0" pour les valeurs inférieures à 10
        var h = (this.getHours() < 10) ? "0" + this.getHours() : this.getHours();
        var m = (this.getMinutes() < 10) ? "0" + this.getMinutes() : this.getMinutes();

        var resultArray = new Array(h, m);
        return resultArray.join(separateur);
    };

    // La fonction qui transforme une Date en phrase FR
    Date.prototype.toFR = function (returnHour) {

        // On met en forme la date retournée
        var resultArray = new Array("Le", this.daysArray[this.getDay()],
            this.getDate(),
            this.monthsArray[this.getMonth()],
            this.getFullYear());

        // Si l'heure est demandée, on la rajoute
        if (returnHour) {
            var heure = this.toTimeString(":");
            resultArray.push("à", heure);
        }

        // On met en forme le résultat, et on le renvoie
        return resultArray.join(" ");
    };

    // La fonction qui met en forme une Date en tant que phrase FR indiquant le temps écoulé
    Date.prototype.toIlya = function () {
        // On calcule le temps écoulé entre maintenant et la date indiquée
        var now = new Date();
        var delai = now - this;

        ////////////////////////////
        // Règle de fonctionnement :
        ////////////////////////////
        //
        // Si le délai est de moins d'1 minute : "il y a quelques secondes"
        // Si le délai est de moins d'1 heure : "il y a XX minutes"
        // Si le délai est de moins de 2 heures : "il y a environ une heure"
        // Si le délai est de moins de 24 heures : "hier, à XX"
        // Si le délai est de moins d'une semaine : "XX, à XX"
        // Dans les autres cas, on renvoie une date normale
        //
        ////////////////////////////

        // On initialise la variable de sortie / utiles
        var resultArray = new Array();

        if (delai < 60 * 1000)
            resultArray.push("Il y a quelques secondes");

        else if (delai < 60 * 60 * 1000) {
            var minutes = Math.round(delai / 1000.00 / 60.00);
            resultArray.push("Il y a", value);

            // On gère le cas du pluriel
            resultArray.push((minutes > 1) ? "minutes" : "minute");
        }
        else if (delai < 2 * 60 * 60 * 1000)
            resultArray.push("Il y a environ une heure");

        else if (delai < 24 * 60 * 60 * 1000) {
            // On transforme la date en Français, et on récupère l'index de la lettre "à"
            var dateFR = this.toFR(true);
            var index = dateFR.indexOf("à");

            // On remplace le début de la date récupéré par "Hier,"
            resultArray.push("Hier,", dateFR.substr(index));
        }
        else if (delai < 7 * 24 * 60 * 60 * 1000) {

            var dateFR = this.toFR(true);                      // On récupère la date en français
            var index = dateFR.indexOf("à");                   // On récupère l'index du "à"
            var jour = new Array(dateFR.split(" ")[1], ",");    // On découpe la date et on met en forme : "jour,"

            resultArray.push(jour.join(""), dateFR.substr(index));
        }
        else resultArray.push(this.toFR(true));

        return resultArray.join(" ");
    };
})();