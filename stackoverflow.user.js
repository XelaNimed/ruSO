// ==UserScript==
// @name        StackOverflow extended
// @namespace   https://github.com/XelaNimed
// @version     0.9.5
// @description Copy code to clipboard; hiding and saving the state of the "Blog", "Meta" blocks by clicking; adding links to all questions of the author and all questions only with tags of the current question to the user's card; stretching and restoring page content for better reading of code listings; redirecting from localized versions of the site to an English-language domain with a search for the current question.
// @author      XelaNimed
// @copyright   2021, XelaNimed (https://github.com/XelaNimed)
// @match       https://*.stackoverflow.com/*
// @match       https://*.meta.stackoverflow.com/*
// @grant       none
// @updateURL   https://openuserjs.org/meta/XelaNimed/StackOverflow_extended.meta.js
// @downloadURL https://openuserjs.org/install/XelaNimed/StackOverflow_extended.min.user.js
// @homepageURL https://github.com/XelaNimed/ruSO
// @supportURL  https://github.com/XelaNimed/ruSO/issues
// @iconURL     https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=32
// @license     MIT
// ==/UserScript==
const $ = window.jQuery;

window.addEventListener('load', function () {
    ruSO
    .initLocalStorage()
    .addButtons()
    .addAuthorQuestionsLinks()
    .addCopyToClipboard();
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
        clickToToggle: 'Скрыть/показать',
        setFullWidth: 'Растянуть',
        resetFullWidth: 'Восстановить',
        copy: 'Копировать',
        copied: 'Скопировано',
        canNotCopy: 'Упс, ошибка',
        intoClipboard: 'В буфер'
    },
    initLocalStorage: function initLocalStorage() {

        if(localStorage.getItem(this.keys.showMetasKey) == null)
        {
            localStorage.setItem(this.keys.showMetasKey, true);
        }

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
                let $header = self.$sidebar.find(".js-tag-preferences-container > div").first().find("h2");
                if ($header.length > 0) {

                    $header[0].innerHTML = '<a class="post-tag user-tag" href="' + url + '">' + $header.text() + '</a>';
                }
            }
        },
        addMetaToggles = function () {
            let showHideMetas = function ($elem) {
                let isVisible = localStorage.getItem(self.keys.showMetasKey) === 'true';
                let $elems = $elem.parent().children('li.s-sidebarwidget--item');
                $elems.each(function(idx, itm){
                    let $itm = $(itm);
                    if(isVisible)
                    {
                        $itm.removeAttr('style');
                    } else {
                         $itm.attr('style', 'display: none !important');
                    }
                });
            };
            self.$sidebar
            .find('div.s-sidebarwidget li.s-sidebarwidget--header')
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
        addLinkToMeta = function () {            const isMeta = window.location.host.includes('meta.');
            const link = isMeta
                  ? window.location.host.split('.').filter(part => part !== 'meta').join('.')
                  : 'meta.' + window.location.host;
            const linkText = isMeta ? 'StackOverflow' : 'Meta'
            $('<li><ol class="nav-links"><a href="https://' + link + '" class="nav-links--link">' + linkText + '</a></ol></li>').insertAfter($('#left-sidebar nav > ol > li').last());
        },
        addFullWidth = function () {
            let $header = $('#question-header');
            self.$fullWidthBtn = $header.find('div').clone();
            self.$fullWidthBtn.attr('id', 'set-full-width-btn').find('a')
            .removeClass('s-btn__primary')
            .addClass('s-btn__filled')
            .attr('href', '#')
            .text(self.strings.setFullWidth)
            .on('click', function () {
                self[localStorage[self.keys.fooFullWidth]]();
            });
            $header.append(self.$fullWidthBtn);
        },
        addRedirectToSO = function () {
            let localPrefix = 'ru.';
            let isLocalSO = location.host.substr(0, 3) === localPrefix;
            let btnText = isLocalSO ? 'en' : 'ru';
            let $btn = $('<div class="print:d-none"><a href="#" class="s-btn s-btn__filled s-btn__xs s-btn__icon ws-nowrap">' + btnText + '</a></div>');
            $btn.insertAfter($('#search'));
            $btn.on('click', function () {
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
    addAuthorQuestionsLinks: function () {
        let $userDetails = $('div.owner > div.user-info > div.user-details');
        if ($userDetails.length > 0) {
            let $postTags = $('div.post-taglist').find('a.post-tag');
            let tags = [];
            for (let i = 0; i < $postTags.length; i++) {
                tags.push('[' + $postTags[i].href.split('/').slice(-1).pop() + ']');
            }
            let tagsUrl = tags.join('+or+');
            for (let i = 0; i < $userDetails.length; i++) {
                let $userDetail = $($userDetails[i]);
                let $userUrl = $userDetail.find('a');
                let userName = $userUrl.text();
                let userId = $userUrl[0].href.split('/')[4];
                let baseSearhcUrl = 'https://ru.stackoverflow.com/search?tab=newest&q=user%3A' + userId + '+is%3Aq';
                let elem = '<span>? <a href="' + baseSearhcUrl + '" title="Все вопросы ' + userName + '">все</a>';
                if (tags.length > 0) {
                    elem += ', <a href="' + baseSearhcUrl + '+' + tagsUrl + '" title="Вопросы ' + userName + ' с метками текущего вопроса">с такими-же метками</a>';
                }
                elem += '</span>';
                $(elem).insertAfter($userDetail);
            }
        }
        return this;
    },
    setFullWidth: function () {
        this.$container.add(this.$content).css({
            'max-width': 'none'
        });
        this.$fullWidthBtn.find('a').text(this.strings.resetFullWidth);
        localStorage[this.keys.fooFullWidth] = 'resetFullWidth';
        return this;
    },
    resetFullWidth: function () {
        this.$container.css({
            'max-width': localStorage[this.keys.containerMaxWidth]
        });
        this.$content.css({
            'max-width': localStorage[this.keys.contentMaxWidth]
        });
        this.$fullWidthBtn.find('a').text(this.strings.setFullWidth);
        localStorage[this.keys.fooFullWidth] = 'setFullWidth';
        return this;
    },
    selectElemText: function(elem) {
		let range = document.createRange();
        range.selectNodeContents(elem);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },
    getSelectedText: function() {
        let text = '';
        if (window.getSelection) {
            text = window.getSelection();
        } else if (document.getSelection) {
            text = document.getSelection();
        } else if (document.selection) {
            text = document.selection.createRange().text;
        }
        return text;
    },
    copyToClipboard: function(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            return window.clipboardData.setData("Text", text);
        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            let textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");
            } catch (ex) {
                console.warn("Copy to clipboard failed", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },
	addCopyToClipboard: function() {

		let self = this;

        let toClipboard = function($elems) {

        };

        $('.snippet-ctas').each(function() {
            let $el = $(this);
            let $availableBtn = $el.find('.copySnippet');
            let $snipBtn = $availableBtn.clone();
            $snipBtn.val(self.strings.intoClipboard);
            $snipBtn.click(function() {

                let code = "";

                $snipBtn.closest('.snippet-code').find('pre > code').each(function() {
                    let $this = $(this);
                    self.selectElemText(this);
                    let selectedText = self.getSelectedText();
                    code += selectedText + '\n';
                    window.getSelection().removeAllRanges();
                });

                if(self.copyToClipboard(code)) {
                    $snipBtn.val(self.strings.copied);
                } else {
                    $snipBtn.val(self.strings.canNotCopy);
                }

                setTimeout(function () {
                    $snipBtn.val(self.strings.intoClipboard);
                }, 2000);
            });
            $availableBtn.after($snipBtn);
        });

        $("pre").each(function () {

            let $pre = $(this);
            let $parent = $pre.parent();

            if($parent.hasClass('snippet-code')) {
                let padding = ($parent.innerWidth() - $parent.width()) / 2;
                $pre.wrapAll('<div style="position: relative; padding-bottom: ' + padding + 'px;"></div>');
            } else {
                $pre.wrapAll('<div style="position: relative;"></div>');
            }

            let $btn = $("<button class='copy-code-button s-btn s-btn__filled s-btn__xs'>" + self.strings.copy + "</button>");
            $btn.css({
                "position": "absolute",
                "top": "6px",
                "right": "12px",
                "display": "none"
            });
            $pre.append($btn);

            let $container = $btn.siblings("code");
            $pre.hover(function () {
                $btn.css("display", "block");
            }, function () {
                $btn.css("display", "none");
            });

            setTimeout(function () {
                if ($container.length == 0) {
                    $pre.contents().filter(function () {
                        return this.className !== "copy-code-button";
                    }).wrapAll('<code style= "overflow-x: auto; padding: 0px;"></code>');
                    $container = $btn.siblings("code").get(0);
                } else {
                    $container = $container.get(0);
                }
            }, 0);

            $btn.click(function () {
                self.selectElemText($container);
                let selectedText = self.getSelectedText();
                let buttonNewText = "";
                if (self.copyToClipboard(selectedText) == true) {
                    buttonNewText = self.strings.copied;
                } else {
                    buttonNewText = self.strings.canNotCopy;
                }
                window.getSelection().removeAllRanges();
                $(this).text(buttonNewText);
                let that = this;
                setTimeout(function () {
                    $(that).text(self.strings.copy);
                }, 400);
            });
        });
        return this;
    }
};
