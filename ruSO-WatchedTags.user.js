// ==UserScript==
// @name         ruSO-WatchedTags
// @namespace    https://github.com/XelaNimed
// @version      0.5
// @description  Various improvements for Russian-language StackOverflow.
// @author       Xela Nimed
// @match        https://ru.stackoverflow.com/*
// @match        https://ru.meta.stackoverflow.com/*
// @grant        none
// @updateURL   https://raw.githubusercontent.com/XelaNimed/ruSO/master/ruSO-WatchedTags.user.js
// @downloadURL https://raw.githubusercontent.com/XelaNimed/ruSO/master/ruSO-WatchedTags.user.js
// ==/UserScript==
window.addEventListener('load', function() {

    initLocalStorage();

    var tags = [],
        urlPrefix = window.location.origin + "/questions/tagged/",
        watchedTagsText = "Отслеживаемые метки",
        importantOnMetaText = "Важное на Мете",
        $sidebar = $("#sidebar"),
        $impMeta = $sidebar.find("div.s-sidebarwidget--header:contains('" + importantOnMetaText + "')");

    $impMeta
    .attr("title", "Click to toggle")
    .css("cursor", "pointer")
    .on("click", function() {
        let isVisible = localStorage.getItem("showImportantMetaPosts") === "true";
        localStorage.setItem("showImportantMetaPosts", !isVisible);
        showHideMetaPosts($impMeta);
    });
    showHideMetaPosts($impMeta);

    $(".js-watched-tag-list a.user-tag").each(function (idx, itm) {
        var url = itm.href;
        tags.push(url.substring(url.lastIndexOf("/") + 1));
    });

    if (tags.length) {
        let url = urlPrefix + tags.join("+or+");
        let spanArr = $sidebar.find("span:contains('" + watchedTagsText + "')");
        $sidebar.find("span.grid--cell.mr4").hide();
        if(spanArr.length > 0) {
            spanArr[0].innerHTML = '<a class="post-tag user-tag" href="' + url + '">' + watchedTagsText + '</a>';
        }
    }

}, false);

function initLocalStorage() {
    localStorage.getItem("showImportantMetaPosts") || localStorage.setItem("showImportantMetaPosts", true);
}

function showHideMetaPosts($elem) {
    let isVisible = localStorage.getItem("showImportantMetaPosts") === "true";
    $elem.parent().find("ul.s-sidebarwidget--content, div:not(:first)")[isVisible ? "show" : "hide"]();
}
