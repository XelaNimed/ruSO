// ==UserScript==
// @name         ruSO-WatchedTags
// @namespace    https://github.com/XelaNimed
// @version      0.1
// @description  Various improvements for Russian-language StackOverflow.
// @author       Xela Nimed
// @match        https://ru.stackoverflow.com/*
// @grant        none
// @updateURL   https://raw.githubusercontent.com/XelaNimed/ruSO/master/ruSO-WatchedTags.user.js
// @downloadURL https://raw.githubusercontent.com/XelaNimed/ruSO/master/ruSO-WatchedTags.user.js
// ==/UserScript==
window.addEventListener('load', function() {

    var tags = [],
        urlPrefix = window.location.origin + "/questions/tagged/",
        spanText = "Отслеживаемые метки";

    $(".js-watched-tag-list a.user-tag").each(function (idx, itm) {
        var url = itm.href;
        tags.push(url.substring(url.lastIndexOf("/") + 1));
    });

    if (tags.length) {
        var url = urlPrefix + tags.join("+or+");
        var spanArr = $("#sidebar").find("span:contains('" + spanText + "')");
        if(spanArr.length > 0) {
            spanArr[0].innerHTML = '<a href="' + url + '">' + spanText + '</a>';
        }
    }

}, false);
