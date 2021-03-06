// ==UserScript==
// @name        StackOverflow extended
// @namespace   https://github.com/XelaNimed
// @version     0.8.7
// @description Hiding and saving the state of the "Blog", "Meta" blocks by clicking; adding links to all questions of the author and all questions only with tags of the current question to the user's card; stretching and restoring page content for better reading of code listings; redirecting from localized versions of the site to an English-language domain with a search for the current question.
// @author      XelaNimed
// @copyright   2021, XelaNimed (https://github.com/XelaNimed)
// @match       https://*.stackoverflow.com/*
// @match       https://*.meta.stackoverflow.com/*
// @grant       none
// @updateURL   https://raw.githubusercontent.com/XelaNimed/ruSO/master/stackoverflow.user.js
// @downloadURL https://raw.githubusercontent.com/XelaNimed/ruSO/master/stackoverflow.user.js
// @homepageURL https://raw.githubusercontent.com/XelaNimed/ruSO
// @supportURL  https://github.com/XelaNimed/ruSO/issues
// @iconURL     https://raw.githubusercontent.com/XelaNimed/ruSO/master/stackoverflow.ico
// @license     MIT
// ==/UserScript==
const $ = window.jQuery;

window.addEventListener('load', function () {
	ruSO
	.initLocalStorage()
	.addButtons()
    .addAuthorQuestionsLinks();
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
				$elem.parent().children('li')[isVisible ? 'show' : 'hide'](ruSO.params.animationSpeed);
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
        addLinkToMeta = function(){
          if(window.location.host.includes('meta.')){
            return;
          }
          const host = 'meta.' + window.location.host;
          const elem = `<a href="https://${host}"
                           class="-logo"
                           style="flex: 0;width: 28px;height: 13px;padding: 17px;margin-right: 5px;background-repeat: no-repeat;background-position: center;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAANCAIAAAA15Zn9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDE0QkFBMEZBMUIzMTFFQkE4ODlEMUVFQkJBQjVEQzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDE0QkFBMTBBMUIzMTFFQkE4ODlEMUVFQkJBQjVEQzgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTRCQUEwREExQjMxMUVCQTg4OUQxRUVCQkFCNURDOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMTRCQUEwRUExQjMxMUVCQTg4OUQxRUVCQkFCNURDOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhtX650AAAFXSURBVHjaYvxzfdevg5P/vbjOQA3AKCDN7l7N+LXf7v/HZwzUA0wSmoxfGlQYqA1Y4CyO+CXMCubfJtgDHQ5hf18QDSTZHPLgan4dmITG/X1wMnf52b8PTv5YmYXFUAgA6vl9YR3QLGRBoGZGRkYg49/DU0BTWO1z/3948ufieiCXWd2ZgYOPWcOVkV8KHoxM6C43CGb3qMb00f/////cPwF0EdACkOkfngIZQC6rQTBUo4YrIlixhbQWpvOBCM35IMDOA3Tj3xu7gaazGATh9D4k1H6fmM9qkQgX/Nqoij1CwK5jhrmRSVzj38sbWFwKDDKgEX9u7EEW5K6/DUFoilktEhh+fAJq+X1yATjogtBd+ufiOmDAQ0Pw41OgUiAJiRlMi/99eAJk/L259zcwxi6sA4n++AwRBGUBWqRTJmBSoLKJ4hpM7B41QIpaJgKdCIxngAADAE/toRBBhVaYAAAAAElFTkSuQmCC');">
        <span></span>
    </a>`;
         let $container = $("div.-main.grid--cell");
            $(elem).insertBefore($container.first());
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
        },
        addRedirectToSO = function(){
                let localPrefix = "ru.";
                let isLocalSO = location.host.substr(0,3) === localPrefix;
                let btnText = isLocalSO ? "en" : "ru";
                let $btn = $(`<div class="print:d-none"><a href="#" class="s-btn s-btn__filled s-btn__xs s-btn__icon ws-nowrap">${btnText}</a></div>`);
                $btn.insertAfter($("#search"));
                $btn.on('click', function() {
                    location.host = isLocalSO
                        ? location.host.substr(localPrefix.length)
                        : localPrefix + location.host;
                });
            };
        addWatchedTags();
	    addMetaToggles();
        addLinkToMeta();
        addFullWidth();
        addRedirectToSO();
		return this;
	},
    addAuthorQuestionsLinks: function(){
        let $userDetails = $('div.owner > div.user-info > div.user-details');
        if($userDetails.length > 0){
            let $postTags = $('div.post-taglist').find('a.post-tag');
            let tags = [];
            for(let i = 0; i < $postTags.length; i++){
                tags.push('[' + $postTags[i].href.split('/').slice(-1).pop() + ']');
            }
            let tagsUrl = tags.join('+or+');
            for(let i = 0; i < $userDetails.length; i++){
                let $userDetail = $($userDetails[i]);
                let $userUrl = $userDetail.find('a');
                let userName = $userUrl.text();
                let userId = $userUrl[0].href.split('/')[4];
                let baseSearhcUrl = 'https://ru.stackoverflow.com/search?tab=newest&q=user%3A' + userId + '+is%3Aq';
                let elem = '<span>? <a href="' + baseSearhcUrl + '" title="Все вопросы ' + userName + '">все</a>';
                if(tags.length > 0){
                    elem += ', <a href="' + baseSearhcUrl + '+' + tagsUrl+ '" title="Вопросы ' + userName + ' с метками текущего вопроса">с такими-же метками</a>';
                }
                elem += '</span>';
                $(elem).insertAfter($userDetail);
            }
        }
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
