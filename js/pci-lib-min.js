(function () {
    var f = {get_news:function (b, a, g) {
        if ("string" == typeof b && "string" == typeof a && "number" == typeof g) {
            var c = new XMLHttpRequest, e = "";
            c.open("POST", "http://www.pcinpact.com/ReadApi/ListActu", !1);
            if ("" != a || 0 < g)c.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), "" != a && (e += "redacteur=" + encodeURIComponent(a) + "&"), 0 < g && (e += "nb_news=" + g);
            c.send(e);
            var a = JSON.parse(c.responseText), d;
            for (d in a.List)c = json_to_Date(a.List[d].PublishDate), g = Date_to_fr(c, !1), c = Date_to_time(c, ":"), a.List[d].PublishDate =
            {date:g, time:c, old_format:a.List[d].PublishDate};
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
    }, get_qr_to_blob:function (b) {
        var a = new XMLHttpRequest;
        a.open("GET", b, !0);
        a.responseType = "arraybuffer";
        a.onload = function () {
            if (200 === a.status)try {
                var b = new FileReader, c = new WebKitBlobBuilder;
                c.append(this.response);
                b.readAsDataURL(c.getBlob("image/png"));
                b.onload = function (a) {
                    localStorage.qr_code_blob = a.target.result
                }
            } catch (e) {
                console.log("Erreur lors de la r\u00e9cup\u00e9ration du QR Code : " +
                    e.message)
            }
        };
        a.send()
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
                var a = this.response.getElementById("user_link"), c = this.response.getElementById("index_stats").getElementsByClassName("bbc_member")[0],
                    e = c.href;
                if (null != a) {
                    var d = this.response.getElementById("inbox_link"), h = this.response.getElementById("notify_link");
                    "%C2%A0" == encodeURIComponent(d.innerText) && (d.innerText = "0");
                    "%C2%A0" == encodeURIComponent(h.innerText) && (h.innerText = "0");
                    var f = d.href, i = h.href;
                    localStorage[b] = JSON.stringify({gagnant:{name:c.innerText, url:e}, messages:{count:parseInt(d.innerText), url:f}, notifications:{count:parseInt(h.innerText), url:i}, user:{name:a.innerText, url:a.href}, is_connected:!0, last_update_date:(new Date).toString()});
                    console.log("Informations du forum en cache - Utilisateur connect\u00e9")
                } else localStorage[b] = JSON.stringify({gagnant:{name:c.innerText, url:e}, is_connected:!1, last_update_date:(new Date).toString()}), console.log("Informations du forum en cache - Utilisateur d\u00e9connect\u00e9")
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
        if (b.List[0].Id != a.List[0].Id || b.NbNews != a.NbNews)for (var c in b.List) {
            var e = b.List[c], d = a.List, h = !0, f = void 0;
            for (f in d)if (d[f].Id == e.Id && d[f].PublishDate.old_format == e.PublishDate.old_format) {
                h =
                    !1;
                break
            }
            h && g.push(b.List[c])
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
                for (var a = [], c = this.response.getElementById("list_bp").getElementsByClassName("bp_table"), e = this.response.getElementById("list_bp").getElementsByClassName("bp_titre"), d = 0; d < e.length; d++) {
                    var f = {titre:e[d].getElementsByTagName("a")[0].innerText, date:e[d].getElementsByTagName("span")[0].innerText,
                        categorie:{img:c[d].getElementsByTagName("img")[0].src, url:c[d].getElementsByTagName("a")[0].href}, url:e[d].getElementsByTagName("a")[0].href, last_update_date:(new Date).toString()};
                    a.push(f)
                }
                localStorage[b] = JSON.stringify(a)
            }
        };
        a.send()
    }};
    window.PdN || (window.PdN = f)
})();
