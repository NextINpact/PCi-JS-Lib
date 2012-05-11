(function () {
    var f = {get_news:function (b, a, g) {
        if ("string" == typeof b && "string" == typeof a && "number" == typeof g) {
            var d = new XMLHttpRequest, e = "";
            d.open("POST", "http://www.pcinpact.com/ReadApi/ListActu", !1);
            if ("" != a || 0 < g)d.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), "" != a && (e += "redacteur=" + encodeURIComponent(a) + "&"), 0 < g && (e += "nb_news=" + g);
            d.send(e);
            var a = JSON.parse(d.responseText), c;
            for (c in a.List)d = json_to_Date(a.List[c].PublishDate), g = Date_to_fr(d, !1), d = Date_to_time(d, ":"), a.List[c].PublishDate =
            {date:g, time:d, old_format:a.List[c].PublishDate};
            switch (b) {
                case "List":
                    b = a.List;
                    break;
                case "Check":
                    b = {NbNews:a.NbNews, LastIdNews:a.List[0].Id};
                    break;
                default:
                    b = a
            }
            b.last_update_date = (new Date).toString();
            return b
        }
    }, get_user_infos:function (b) {
        if ("string" == typeof b) {
            var a = new XMLHttpRequest;
            a.open("POST", "http://www.pcinpact.com/ReadApi/UserInfo", !1);
            a.send("");
            a = JSON.parse(a.responseText);
            switch (b) {
                case "IsRegistered":
                case "IsPremium":
                case "Login":
                case "Id":
                case "NbPostsForum":
                case "NbComments":
                    return a[b];
                case "Pm_Expiration":
                case "Pm_UrlRss":
                case "Pm_UrlQr":
                    return a.PremiumInfo[b];
                case "Pm_Infos":
                    return a.PremiumInfo;
                default:
                    return a
            }
        }
    }, get_tshirt_winner_infos:function () {
        var b = new XMLHttpRequest;
        b.open("POST", "http://www.pcinpact.com/ReadApi/Teeshirt", !1);
        b.send("");
        return JSON.parse(b.responseText)
    }, get_forum_infos:function (b) {
        var a = new XMLHttpRequest;
        a.open("GET", "http://forum.pcinpact.com/", !0);
        a.responseType = "document";
        a.onload = function () {
            if (200 == this.status) {
                console.log("Contenu du forum r\u00e9cup\u00e9r\u00e9");
                var a = this.response.getElementById("user_link"), d = this.response.getElementById("index_stats").getElementsByClassName("bbc_member")[0], e = d.href;
                if (null != a) {
                    var c = this.response.getElementById("inbox_link"), h = this.response.getElementById("notify_link");
                    "%C2%A0" == encodeURIComponent(c.innerText) && (c.innerText = "0");
                    "%C2%A0" == encodeURIComponent(h.innerText) && (h.innerText = "0");
                    var f = c.href, i = h.href;
                    localStorage[b] = JSON.stringify({gagnant:{name:d.innerText, url:e}, messages:{count:parseInt(c.innerText), url:f},
                        notifications:{count:parseInt(h.innerText), url:i}, user:{name:a.innerText, url:a.href}, is_connected:!0, last_update_date:(new Date).toString()});
                    console.log("Informations du forum en cache - Utilisateur connect\u00e9")
                } else localStorage[b] = JSON.stringify({gagnant:{name:d.innerText, url:e}, is_connected:!1, last_update_date:(new Date).toString()}), console.log("Informations du forum en cache - Utilisateur d\u00e9connect\u00e9")
            }
        };
        a.send()
    }};
    window.PCi || (window.PCi = f)
})();
(function () {
    var f = {Actus:function () {
        var b = PCi.get_news("", "", 0), a;
        console.log("Actualit\u00e9s r\u00e9cup\u00e9r\u00e9es");
        localStorage.pci_last_actu_check ? a = JSON.parse(localStorage.pci_last_actu_check) : (a = b, console.log("Les actualit\u00e9s n'avaient jamais \u00e9t\u00e9 v\u00e9rifi\u00e9es. Attribution : OK"));
        var g = [];
        if (b.List[0].Id != a.List[0].Id || b.NbNews != a.NbNews)for (var d in b.List) {
            var e = b.List[d], c = a.List, h = !0, f = void 0;
            for (f in c)if (c[f].Id == e.Id && c[f].PublishDate.old_format == e.PublishDate.old_format) {
                h =
                    !1;
                break
            }
            h && g.push(b.List[d])
        }
        console.log(g.length + " nouveau(x) contenu(s) d\u00e9tect\u00e9(s)");
        localStorage.pci_last_actu_check = JSON.stringify(b);
        return g
    }};
    window.PCi_Check || (window.PCi_Check = f)
})();
(function () {
    var f = {get_bp:function (b) {
        var a = new XMLHttpRequest;
        a.open("GET", "http://www.prixdunet.com/bon-plan.html?motcle=&type=0&order=nb_lectures&way=desc", !0);
        a.responseType = "document";
        a.onload = function () {
            if (200 == this.status) {
                for (var a = [], d = this.response.getElementById("list_bp").getElementsByClassName("bp_table"), e = this.response.getElementById("list_bp").getElementsByClassName("bp_titre"), c = 0; c < e.length; c++) {
                    var f = {titre:e[c].getElementsByTagName("a")[0].innerText, date:e[c].getElementsByTagName("span")[0].innerText,
                        categorie:{img:d[c].getElementsByTagName("img")[0].src, url:d[c].getElementsByTagName("a")[0].href}, url:e[c].getElementsByTagName("a")[0].href, last_update_date:(new Date).toString()};
                    a.push(f)
                }
                localStorage[b] = JSON.stringify(a)
            }
        };
        a.send()
    }};
    window.PdN || (window.PdN = f)
})();
