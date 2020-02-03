// ==UserScript==
// @name        SO
// @namespace   https://github.com/XelaNimed
// @version     0.7.2
// @description Various improvements for StackOverflow.
// @author      XelaNimed
// @match       https://*.stackoverflow.com/*
// @match       https://*.meta.stackoverflow.com/*
// @grant       none
// @updateURL   https://raw.githubusercontent.com/XelaNimed/ruSO/master/stackoverflow.user.js
// @downloadURL https://raw.githubusercontent.com/XelaNimed/ruSO/master/stackoverflow.user.js
// @iconURL     https://cdn.sstatic.net/Sites/ru/img/favicon.ico
// ==/UserScript==
const $ = window.jQuery;

window.addEventListener('load', function () {
	ruSO
	.initLocalStorage()
	.addButtons();
}, false);

var ruSO = {
	$sidebar: $('#sidebar'),
	$content: $('#content'),
	$container: $('body>.container'),
    $fullWidthBtn: null,
	params: {
		animationSpeed: 250
	},
	keys: {
		showMetasKey: 'showMetaPosts',
        contentMaxWidth: 'contentMaxWidth',
        containerMaxWidth: 'containerMaxWidth',
        fooFullWidth: 'fooFullWidth'
	},
	strings: {
		watchedTagsText: 'Отслеживаемые метки',
		clickToToggle: 'Скрыть/показать',
		setFullWidth: 'Растянуть',
		resetFullWidth: 'Восстановить'
	},
	initLocalStorage: function initLocalStorage() {
		localStorage[this.keys.showMetasKey] || localStorage.setItem(this.keys.showMetasKey, true);
        localStorage[this.keys.containerMaxWidth] = this.$container.css('max-width');
        localStorage[this.keys.contentMaxWidth] = this.$content.css('max-width');
        localStorage[this.keys.fooFullWidth] = 'setFullWidth';
		return this;
	},
	addButtons: function () {
		var self = this,
		addWatchedTags = function () {
			let tags = [],
			urlPrefix = window.location.origin + '/questions/tagged/';
			$('.js-watched-tag-list a.user-tag').each(function (idx, itm) {
				let url = itm.href;
				tags.push(url.substring(url.lastIndexOf('/') + 1));
			});
			if (tags.length) {
				let url = urlPrefix + tags.join('+or+');
				let spanArr = self.$sidebar.find("span:contains('" + self.strings.watchedTagsText + "')");
				self.$sidebar.find('span.grid--cell.mr4').hide();
				if (spanArr.length > 0) {
					spanArr[0].innerHTML = '<a class="post-tag user-tag" href="' + url + '">' + self.strings.watchedTagsText + '</a>';
				}
			}
		},
		addMetaToggles = function () {
			let showHideMetas = function ($elem) {
				let isVisible = localStorage.getItem(self.keys.showMetasKey) === 'true';
				$elem.parent().find('ul.s-sidebarwidget--content')[isVisible ? 'show' : 'hide'](ruSO.params.animationSpeed);
			};
			self.$sidebar
			.find('div.s-sidebarwidget:first div.s-sidebarwidget--header, #how-to-format, #how-to-title')
			.each(function (idx, itm) {
				let $itm = $(itm);
				$itm
				.attr('title', ruSO.strings.clickToToggle)
				.css('cursor', 'pointer')
				.on('click', function (e) {
					let isVisible = localStorage.getItem(self.keys.showMetasKey) === 'true';
					localStorage.setItem(self.keys.showMetasKey, !isVisible);
					showHideMetas($(e.target));
				});
				showHideMetas($itm);
			});
		},
        addFullWidth = function() {
            let $header = $('#question-header');
            self.$fullWidthBtn = $header.find('div').clone();
            self.$fullWidthBtn.attr('id', 'set-full-width-btn').find('a')
            .removeClass('s-btn__primary')
            .addClass('s-btn__filled')
            .attr('href', '#')
            .text(self.strings.setFullWidth)
            .on('click', function() {
                self[localStorage[self.keys.fooFullWidth]]();
            });
            $header.append(self.$fullWidthBtn);
        };
		addWatchedTags();
		addMetaToggles();
        addFullWidth();
		return this;
	},
    setFullWidth: function() {
        this.$container.add(this.$content).css({'max-width':'none'});
        this.$fullWidthBtn.find('a').text(this.strings.resetFullWidth);
        localStorage[this.keys.fooFullWidth] = 'resetFullWidth';
        return this;
    },
    resetFullWidth: function() {
        this.$container.css({'max-width': localStorage[this.keys.containerMaxWidth]});
        this.$content.css({'max-width': localStorage[this.keys.contentMaxWidth]});
        this.$fullWidthBtn.find('a').text(this.strings.setFullWidth);
        localStorage[this.keys.fooFullWidth] = 'setFullWidth';
        return this;
    }
};
