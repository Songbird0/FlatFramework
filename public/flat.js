class Flat {


    constructor(socket) {

        this.debug = true;

        if (this.debug) {
            this.showpacket = true;
            this.showequal = true;
        } else {
            this.showpacket = false;
            this.showequal = false;
        }


        if (typeof jQuery === 'undefined') {
            alert('Jquery is required');
            var imported = document.createElement('script');
            imported.src = 'https://code.jquery.com/jquery-3.2.1.min.js';
            document.head.appendChild(imported);
        }
        this.lastPage = window.location.href.toString().replace("http://", "").replace("https://", "");
        this.currentPage = document.location.href.toString();
        var obj = this;

        this.refreshTime = 1500;
        this.isConnected = true;


        this.socket_uri = socket;
        this.socket = false;
        this.connect(socket);
        this.spam = 0;
        this.updateNB = 0;


        Flat.prototype.onProgressLoading(0, true);
        $(document).on('click', '.get', function (e) {
            e.preventDefault();


            obj.onPageHit(e);

            setTimeout(function () {
                obj.onRefresh(obj);
            }, 50);


        });

        $(document).on('click', 'a', function (e) {
            e.preventDefault();

            if (!$(this).hasClass('ext') && !$(this).hasClass('get'))
                obj.onPageChange(e);
            setTimeout(function () {
                obj.onRefresh(obj);
            }, 50);


        });


        $(document).on('click', '.ext', function (e) {
            e.preventDefault();


            obj.onExternalPageChange(e);


        });

        $(document).on('submit', 'form', function (e) {

            if (!$(this).hasClass("local")) {
                if (e.currentTarget.action.toString().indexOf(obj.getLocation(obj.socket_uri).hostname) != -1 || e.currentTarget.action == "") {
                    e.preventDefault();
                    obj.onSubmitForm(e, this);
                    setTimeout(function () {
                        obj.onRefresh(obj);
                    }, 50);

                }
            }


        });


        setInterval(function () {
            obj.onTick(obj);
        }, 100);

        setInterval(function () {
            obj.onRefresh(obj);
        }, this.refreshTime);

    }

    getTimestamp() {
        return new Date().getTime();
    }

    connect(socket) {
        var obj = this;
        this.socket = new WebSocket(this.socket_uri);
        this.socket.onopen = function (e) {
            obj.onConnect(e);
        };

        this.socket.onmessage = function (e) {
            obj.onReceive(e);
        }
        this.socket.onclose = function (e) {
            obj.onDisconnect(e);
        }


        this.socket.onerror = function (e) {
            obj.onError(e);
        }
    }

    onReceive(e) {
        var packetSerializedJson = e.data.toString();
        if (packetSerializedJson === "")
            return;


        try {


            if (this.showpacket) {
                console.log('RECIVE:' + packetSerializedJson);
            }

            var packet = JSON.parse(packetSerializedJson);

            if (packet === null)
                return;
            var obj = this;


            packet.forEach(function (element) {
                setTimeout(function () {


                    switch (element.action) {
                        case 'update':
                            obj.fxUpdate(element);
                            Flat.prototype.onPageUpdate();
                            break;
                        case 'apprend':
                            obj.fxUpdateApprend(element);
                            Flat.prototype.onPageUpdate();
                            break;
                        case 'bgcolor':
                            obj.fxBGColot(element);
                            break;
                        case 'txcolor':
                            obj.fxTXTColot(element);
                            break;
                        case 'notify':
                            obj.fxNotify(element);
                            break;
                        case 'redirect':
                            obj.fxRedirect(element);
                            break;
                        case 'process':
                            eval(element.name + "();");
                            break;
                        case 'load':
                            obj.fxLoad(element.html, element.route);
                            Flat.prototype.onPageUpdate();
                            break;
                        case 'clearForm':
                            document.getElementById(element.id).reset();
                            break;
                        case 'setRefreshTime':
                            obj.refreshTime = element.time;
                            break;

                    }


                }, 0);

            });
        } catch (e) {
            console.log("Error packet processing:");
            console.log(e);
            console.log("PACKET" + packetSerializedJson);
        }


    }


    fxRedirect(element) {
        if (element.strict == false) {
            this.directSend("LOAD", element.uri, [], [], []);

        } else {
            window.location.href = element.uri;
        }


    }
    redirect(uri) {
        this.directSend("LOAD", uri, [], [], []);
    }


    fxNotify(html) {
        Flat.prototype.onToast(html.title, html.message, html.type);
    }

    fxTXTColot(html) {
        if (html.id.toString().includes(".")) {
            var res = html.id.toString().replace(".", "");
            var area = document.getElementsByClassName(res);
            area.style.color = html.color

        } else if (html.id.toString().includes("#")) {
            var res = html.id.toString().replace("#", "");
            var area = document.getElementById(res);
            area.style.color = html.color
        }
    }

    fxBGColot(html) {
        if (html.id.toString().includes(".")) {
            var res = html.id.toString().replace(".", "");
            var area = document.getElementsByClassName(res);
            area.style.backgroundColor = html.color

        } else if (html.id.toString().includes("#")) {
            var res = html.id.toString().replace("#", "");
            var area = document.getElementById(res);
            area.style.backgroundColor = html.color
        }
    }

    fxUpdateApprend(html) {
        if (html.id.toString().includes(".")) {
            var res = html.id.toString().replace(".", "");
            var area = document.getElementsByClassName(res);
            for (var i = 0; i < area.length; i++) {
                area[i].innerHTML = area[i].innerHTML + html.text;
            }

        } else if (html.id.toString().includes("#")) {
            var res = html.id.toString().replace("#", "");
            var area = document.getElementById(res);
            area.innerHTML = area.innerHTML + html.text;
        }
    }

    fxUpdate(html) {
        if (html.id.toString().includes(".")) {
            var res = html.id.toString().replace(".", "");
            var area = document.getElementsByClassName(res);

            for (var i = 0; i < area.length; i++) {

                if (!this.equal(area[i].innerHTML, html.text)) {
                    area[i].innerHTML = html.text;
                }

            }

        } else if (html.id.toString().includes("#")) {
            var res = html.id.toString().replace("#", "");
            var area = document.getElementById(res);
            if (area != null && area.length != 0) {


                if (!this.equal(area.innerHTML, html.text)) {
                    area.innerHTML = html.text;
                }
            }

        }
    }

    equal(html1, html2) {
        var newhtml1 = this.clearString(html1.toString());
        var newhtml2 = this.clearString(html2.toString());


        if (newhtml1 === newhtml2) {
            return true;
        }
        if (this.showequal) {
            console.log(newhtml1);
            console.log("######################");
            console.log(newhtml2);
        }


        return false;
    }

    clearString(string) {


        var string_s = string.toString();

        var doc = document.createElement("div");
        doc.innerHTML = string_s;


        string_s = doc.innerHTML.toString();
        string_s = string_s.replace(' selected', 'selected=""').replace('selected ', 'selected=""');
        string_s = string_s.replace(' disabled', 'disabled=""').replace('disabled ', 'disabled=""');
        string_s = string_s.replace('selected=""=""', 'selected=""').replace('disabled=""=""', 'disabled=""');
        string_s = string_s.replace(/class="active"/g, '');
        string_s = string_s.replace(/class="validatevalid"/g, '');
        string_s = string_s.replace(/class="validate"/g, '');
        string_s = string_s.replace(/required=""/g, 'required');
        string_s = string_s.replace(/class=""/g, '');

        string_s = string_s.replace(/\s/g, '').replace(/(\r\n|\n|\r)/gm, "");

        string_s = string_s.replace(/&quot;/g, '"'); // 34 22
        string_s = string_s.replace(/&amp;/g, '&'); // 38 26
        string_s = string_s.replace(/&#39;/g, "'"); // 39 27
        string_s = string_s.replace(/&lt;/g, '<'); // 60 3C
        string_s = string_s.replace(/&gt;/g, '>'); // 62 3E
        string_s = string_s.replace(/&circ;/g, '^'); // 94 5E
        string_s = string_s.replace(/&lsquo;/g, '‘'); // 145 91
        string_s = string_s.replace(/&rsquo;/g, '’'); // 146 92
        string_s = string_s.replace(/&ldquo;/g, '“'); // 147 93
        string_s = string_s.replace(/&rdquo;/g, '”'); // 148 94
        string_s = string_s.replace(/&bull;/g, '•'); // 149 95
        string_s = string_s.replace(/&ndash;/g, '–'); // 150 96
        string_s = string_s.replace(/&mdash;/g, '—'); // 151 97
        string_s = string_s.replace(/&tilde;/g, '˜'); // 152 98
        string_s = string_s.replace(/&trade;/g, '™'); // 153 99
        string_s = string_s.replace(/&scaron;/g, 'š'); // 154 9A
        string_s = string_s.replace(/&rsaquo;/g, '›'); // 155 9B
        string_s = string_s.replace(/&oelig;/g, 'œ'); // 156 9C
        string_s = string_s.replace(/&#357;/g, ''); // 157 9D
        string_s = string_s.replace(/&#382;/g, 'ž'); // 158 9E
        string_s = string_s.replace(/&Yuml;/g, 'Ÿ'); // 159 9F
        string_s = string_s.replace(/&nbsp;/g, ' '); // 160 A0
        string_s = string_s.replace(/&iexcl;/g, '¡'); // 161 A1
        string_s = string_s.replace(/&cent;/g, '¢'); // 162 A2
        string_s = string_s.replace(/&pound;/g, '£'); // 163 A3
        string_s = string_s.replace(/&curren;/g, ' '); // 164 A4
        string_s = string_s.replace(/&yen;/g, '¥'); // 165 A5
        string_s = string_s.replace(/&brvbar;/g, '¦'); // 166 A6
        string_s = string_s.replace(/&sect;/g, '§'); // 167 A7
        string_s = string_s.replace(/&uml;/g, '¨'); // 168 A8
        string_s = string_s.replace(/&copy;/g, '©'); // 169 A9
        string_s = string_s.replace(/&ordf;/g, 'ª'); // 170 AA
        string_s = string_s.replace(/&laquo;/g, '«'); // 171 AB
        string_s = string_s.replace(/&not;/g, '¬'); // 172 AC
        string_s = string_s.replace(/&shy;/g, '­'); // 173 AD
        string_s = string_s.replace(/&reg;/g, '®'); // 174 AE
        string_s = string_s.replace(/&macr;/g, '¯'); // 175 AF
        string_s = string_s.replace(/&deg;/g, '°'); // 176 B0
        string_s = string_s.replace(/&plusmn;/g, '±'); // 177 B1
        string_s = string_s.replace(/&sup2;/g, '²'); // 178 B2
        string_s = string_s.replace(/&sup3;/g, '³'); // 179 B3
        string_s = string_s.replace(/&acute;/g, '´'); // 180 B4
        string_s = string_s.replace(/&micro;/g, 'µ'); // 181 B5
        string_s = string_s.replace(/&para/g, '¶'); // 182 B6
        string_s = string_s.replace(/&middot;/g, '·'); // 183 B7
        string_s = string_s.replace(/&cedil;/g, '¸'); // 184 B8
        string_s = string_s.replace(/&sup1;/g, '¹'); // 185 B9
        string_s = string_s.replace(/&ordm;/g, 'º'); // 186 BA
        string_s = string_s.replace(/&raquo;/g, '»'); // 187 BB
        string_s = string_s.replace(/&frac14;/g, '¼'); // 188 BC
        string_s = string_s.replace(/&frac12;/g, '½'); // 189 BD
        string_s = string_s.replace(/&frac34;/g, '¾'); // 190 BE
        string_s = string_s.replace(/&iquest;/g, '¿'); // 191 BF
        string_s = string_s.replace(/&Agrave;/g, 'À'); // 192 C0
        string_s = string_s.replace(/&Aacute;/g, 'Á'); // 193 C1
        string_s = string_s.replace(/&Acirc;/g, 'Â'); // 194 C2
        string_s = string_s.replace(/&Atilde;/g, 'Ã'); // 195 C3
        string_s = string_s.replace(/&Auml;/g, 'Ä'); // 196 C4
        string_s = string_s.replace(/&Aring;/g, 'Å'); // 197 C5
        string_s = string_s.replace(/&AElig;/g, 'Æ'); // 198 C6
        string_s = string_s.replace(/&Ccedil;/g, 'Ç'); // 199 C7
        string_s = string_s.replace(/&Egrave;/g, 'È'); // 200 C8
        string_s = string_s.replace(/&Eacute;/g, 'É'); // 201 C9
        string_s = string_s.replace(/&Ecirc;/g, 'Ê'); // 202 CA
        string_s = string_s.replace(/&Euml;/g, 'Ë'); // 203 CB
        string_s = string_s.replace(/&Igrave;/g, 'Ì'); // 204 CC
        string_s = string_s.replace(/&Iacute;/g, 'Í'); // 205 CD
        string_s = string_s.replace(/&Icirc;/g, 'Î'); // 206 CE
        string_s = string_s.replace(/&Iuml;/g, 'Ï'); // 207 CF
        string_s = string_s.replace(/&ETH;/g, 'Ð'); // 208 D0
        string_s = string_s.replace(/&Ntilde;/g, 'Ñ'); // 209 D1
        string_s = string_s.replace(/&Ograve;/g, 'Ò'); // 210 D2
        string_s = string_s.replace(/&Oacute;/g, 'Ó'); // 211 D3
        string_s = string_s.replace(/&Ocirc;/g, 'Ô'); // 212 D4
        string_s = string_s.replace(/&Otilde;/g, 'Õ'); // 213 D5
        string_s = string_s.replace(/&Ouml;/g, 'Ö'); // 214 D6
        string_s = string_s.replace(/&times;/g, '×'); // 215 D7
        string_s = string_s.replace(/&Oslash;/g, 'Ø'); // 216 D8
        string_s = string_s.replace(/&Ugrave;/g, 'Ù'); // 217 D9
        string_s = string_s.replace(/&Uacute;/g, 'Ú'); // 218 DA
        string_s = string_s.replace(/&Ucirc;/g, 'Û'); // 219 DB
        string_s = string_s.replace(/&Uuml;/g, 'Ü'); // 220 DC
        string_s = string_s.replace(/&Yacute;/g, 'Ý'); // 221 DD
        string_s = string_s.replace(/&THORN;/g, 'Þ'); // 222 DE
        string_s = string_s.replace(/&szlig;/g, 'ß'); // 223 DF
        string_s = string_s.replace(/&agrave;/g, 'à'); // 224 E0
        string_s = string_s.replace(/&aacute;/g, 'á'); // 225 E1
        string_s = string_s.replace(/&acirc;/g, 'â'); // 226 E2
        string_s = string_s.replace(/&atilde;/g, 'ã'); // 227 E3
        string_s = string_s.replace(/&auml;/g, 'ä'); // 228 E4
        string_s = string_s.replace(/&aring;/g, 'å'); // 229 E5
        string_s = string_s.replace(/&aelig;/g, 'æ'); // 230 E6
        string_s = string_s.replace(/&ccedil;/g, 'ç'); // 231 E7
        string_s = string_s.replace(/&egrave;/g, 'è'); // 232 E8
        string_s = string_s.replace(/&eacute;/g, 'é'); // 233 E9
        string_s = string_s.replace(/&ecirc;/g, 'ê'); // 234 EA
        string_s = string_s.replace(/&euml;/g, 'ë'); // 235 EB
        string_s = string_s.replace(/&igrave;/g, 'ì'); // 236 EC
        string_s = string_s.replace(/&iacute;/g, 'í'); // 237 ED
        string_s = string_s.replace(/&icirc;/g, 'î'); // 238 EE
        string_s = string_s.replace(/&iuml;/g, 'ï'); // 239 EF
        string_s = string_s.replace(/&eth;/g, 'ð'); // 240 F0
        string_s = string_s.replace(/&ntilde;/g, 'ñ'); // 241 F1
        string_s = string_s.replace(/&ograve;/g, 'ò'); // 242 F2
        string_s = string_s.replace(/&oacute;/g, 'ó'); // 243 F3
        string_s = string_s.replace(/&ocirc;/g, 'ô'); // 244 F4
        string_s = string_s.replace(/&otilde;/g, 'õ'); // 245 F5
        string_s = string_s.replace(/&ouml;/g, 'ö'); // 246 F6
        string_s = string_s.replace(/&divide;/g, '÷'); // 247 F7
        string_s = string_s.replace(/&oslash;/g, 'ø'); // 248 F8
        string_s = string_s.replace(/&ugrave;/g, 'ù'); // 249 F9
        string_s = string_s.replace(/&uacute;/g, 'ú'); // 250 FA
        string_s = string_s.replace(/&ucirc;/g, 'û'); // 251 FB
        string_s = string_s.replace(/&uuml;/g, 'ü'); // 252 FC
        string_s = string_s.replace(/&yacute;/g, 'ý'); // 253 FD
        string_s = string_s.replace(/&thorn;/g, 'þ'); // 254 FE
        string_s = string_s.replace(/&yuml;/g, 'ÿ'); // 255 FF

        return string_s;
    }

    fxLoad(html, route) {
        Flat.prototype.onProgressLoading(30, false);
        this.lastPage = document.location.hostname + route;
        var elem = document.createElement('div');
        elem.innerHTML = html;
        Flat.prototype.onProgressLoading(40, false);
        this.update(elem, 'div');
        this.update(elem, 'header');
        Flat.prototype.onProgressLoading(60, false);
        var title = elem.getElementsByTagName("title")[0];
        Flat.prototype.onProgressLoading(80, false);
        window.history.pushState({}, "", route);
        this.currentPage = route;
        Flat.prototype.onProgressLoading(90, false);
        Flat.prototype.onPageLoad(route);
        Flat.prototype.onProgressLoading(100, true);
        document.body.scrollTop = 0;
        setTimeout(function () {
            Flat.prototype.onProgressLoading(0, true);
            document.body.scrollTop = 0;
        }, 50);
    }

    update(source, balise) {

        var divs = source.getElementsByTagName(balise);
        for (var i = 0; i < divs.length; i++) {
            if (divs[i].id != null) {
                if (divs[i] != null) {
                    var elemOnThis = document.getElementById(divs[i].id);
                    if (elemOnThis != null) {
                        if (elemOnThis.innerHTML != divs[i].innerHTML) {
                            elemOnThis.innerHTML = divs[i].innerHTML;
                        }
                    }
                }
            }
        }
    }

    onRefresh() {
        var json = JSON.stringify({
            action: 'update',
            path: window.location.href
        });
        this.send('UPDATE', window.location.href, [], [], [])
    }

    bindEvent(data, eventtype, event) {
        for (var i = 0; i < data.length; i++) {
            for (var i1 = 0; i1 < data[i].childNodes.length; i1++) {
                data[i].childNodes[i1].addEventListener(eventtype, event, true);
            }
            data[i].addEventListener(eventtype, event, true);
        }
    }

    //-----> Event System
    onConnect(e) {
        if (!this.isConnected) {
            if (this.debug) {
                //Flat.prototype.onToast('Informations', 'La connexion avec le système est rétablie', 'success');
            }
        }

        this.onRefresh();
        this.isConnected = true;

    }

    onDisconnect(e) {
        if (this.isConnected) {
            if (this.debug) {
                //Flat.prototype.onToast('Erreur', 'La connexion avec le systéme a été perdue', 'error');
            }

        }
        this.isConnected = false;

    }

    onError(e) {
        if (this.isConnected) {
            if (this.debug) {
                //Flat.prototype.onToast('Erreur', 'La connexion avec le systéme a été perdue', 'error');
            }

        }
        this.isConnected = false;

    }


    onTick(e) {

        if (this.lastPage != window.location.href.toString().replace("http://", "").replace("https://", "")) {

            if (this.getLocation(this.socket_uri).hostname == window.location.hostname) {
                document.location.href = window.location.href;
                this.lastPage = window.location.href.toString().replace("http://", "").replace("https://", "");
            }
        }


        if (e.socket.readyState == 3) {
            e.connect(e.socket);
        }

    }

    onPageChange(e) {
        var href = e.currentTarget.href;
        var sock = this.socket_uri;

        if (this.lastPage != href.toString().replace("http://", "").replace("https://", "")) {
            if (href != "" && href != null && href.toString().indexOf('#') == -1) {
                if (href.toString().indexOf(this.getLocation(sock).hostname) != -1) {
                    this.updateNB = 0;
                    this.send("LOAD", href, [], [], []);
                }
            }
        }
    }

    getLocation(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    onPageHit(e) {

        var href = $(e.currentTarget).attr('href');
        if (!$(this).hasClass("get") && !$(this).hasClass("ext")) {
            var sock = this.socket_uri;
            if (href != "" && href != null) {
                if (href.toString().indexOf(this.getLocation(sock).hostname)) {
                    this.send("GET", href, [], [], []);

                }
            }
        }

    }

    onExternalPageChange(e) {
        var href = $(e.currentTarget).attr('href');
        window.location.href = href;

    }

    onSubmitForm(e, obj) {
        var flat = this;
        var url = "";
        var file_packet = [];
        var file_n = 0;
        var t_file = 0;
        if (e.currentTarget.action == "") {
            url = window.location.href;
        } else {
            url = e.currentTarget.action;
        }
        if (e.target.encoding == "multipart/form-data") {
            var elements = e.target.querySelectorAll("input[type=\"file\"]");
            for (var i = 0; i < elements.length; ++i) {
                if ($(elements[i]).length != 0) {
                    var file = $(elements[i])[0].files
                    if ($(elements[i])[0].files.length != 0) {

                        var file_list_on_input = $(elements[i])[0].files;

                        for (var i1 = 0; i1 < file_list_on_input.length; i1++) {
                            var reader = new FileReader();
                            reader.identifier = $(elements[i]).attr('name');

                            reader.onloadend = function (e) {
                                file_packet[file_n] = {name: this.identifier, data: reader.result};
                                file_n++;
                                t_file--;
                                if (t_file == 0) {
                                    flat.send('POST', url, [], $(obj).serializeArray(), file_packet);
                                }
                            }
                            reader.readAsDataURL(file_list_on_input[i1]);
                            t_file++;
                        }


                    }
                }

            }
        } else {
            this.send('POST', url, [], $(obj).serializeArray(), []);
        }

    }

    toBase64(element) {

    }

    send(type, path, get, post, file) {
        if (this.showpacket) {
            console.log(type);
        }

        if (type == null || type == '') {
            return;
        }
        if (path == null || path == '') {
            return;
        }

        var allowed = false;


        if (type == "LOAD") {
            Flat.prototype.onProgressLoading(15, false);
        }

        this.directSend(type, path, get, post, file);
        if (type == "LOAD") {
            Flat.prototype.onProgressLoading(20, false);
        }


    }

    directSend(type, path, get, post, file) {

        if (this.socket.readyState == 1) {
            var json = JSON.stringify(
                {
                    type: type,
                    sessionID: document.cookie.match('PHPSESSID=([^;]*)')[1],
                    path: path,
                    get: get,
                    post: post,
                    file: file
                }
            );

            return this.socket.send(json);
        }
    }


    StringToBytes(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i).toString(2));
        }
        return result;
    }

    byteToString(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return result;
    }


    // window.onload = this.constructor();


    //<----- Event System

}


window.onbeforeunload = Flat.prototype.onBack;
window.onload = function () {
    Flat.prototype.onPageLoad(window.location.pathname)
};


