// ==UserScript==
// @name        ruSO-WatchedTags
// @namespace   https://github.com/XelaNimed
// @version     0.6.1
// @description Various improvements for Russian-language StackOverflow.
// @author      Xela Nimed
// @match       https://ru.stackoverflow.com/*
// @match       https://ru.meta.stackoverflow.com/*
// @grant       none
// @updateURL   https://raw.githubusercontent.com/XelaNimed/ruSO/master/ruSO-WatchedTags.user.js
// @downloadURL https://raw.githubusercontent.com/XelaNimed/ruSO/master/ruSO-WatchedTags.user.js
// @iconURL     https://cdn.sstatic.net/Sites/ru/img/favicon.ico
// ==/UserScript==
const $ = window.jQuery;

window.addEventListener('load', function () {
	ruSO
	.initLocalStorage()
	.addButtons();
}, false);

var ruSO = {
    keys: {
        showMetasKey: "showMetaPosts"
    },
    strings: {
        watchedTagsText: "Отслеживаемые метки"
    },
	initLocalStorage: function initLocalStorage() {
		localStorage.getItem(this.keys.showMetasKey) || localStorage.setItem(this.keys.showMetasKey, true);
		return this;
	},
	$sidebar: $("#sidebar"),
	addButtons: function () {
		var self = this;
		var buttons = {
			addWatchedTags: function () {
				var tags = [], urlPrefix = window.location.origin + "/questions/tagged/";
				$(".js-watched-tag-list a.user-tag").each(function (idx, itm) {
					let url = itm.href;
					tags.push(url.substring(url.lastIndexOf("/") + 1));
				});
				if (tags.length) {
					let url = urlPrefix + tags.join("+or+");
					let spanArr = self.$sidebar.find("span:contains('" + self.strings.watchedTagsText + "')");
					self.$sidebar.find("span.grid--cell.mr4").hide();
					if (spanArr.length > 0) {
						spanArr[0].innerHTML = '<a class="post-tag user-tag" href="' + url + '">' + self.strings.watchedTagsText + '</a>';
					}
				}
				return this;
			},
			addMetaToggles: function () {
				let showHideMetas = function ($elem) {
					let isVisible = localStorage.getItem(self.keys.showMetasKey) === "true";
					$elem.parent().find("ul.s-sidebarwidget--content")[isVisible ? "show" : "hide"](300);
				};
				self
				.$sidebar
				.find("div.s-sidebarwidget:first div.s-sidebarwidget--header")
				.each(function (idx, itm) {
					var $itm = $(itm);
					$itm
					.attr("title", "Click to toggle")
					.css("cursor", "pointer")
					.on("click", function (e) {
						let isVisible = localStorage.getItem(self.keys.showMetasKey) === "true";
						localStorage.setItem(self.keys.showMetasKey, !isVisible);
						showHideMetas($(e.target));
					});
					showHideMetas($itm);
				});
				return this;
			}
		};
		buttons.addWatchedTags().addMetaToggles();
		return self;
	}
};
