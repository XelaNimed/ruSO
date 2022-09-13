// ==UserScript==
// @name        StackOverflow extended
// @namespace   https://github.com/XelaNimed
// @version     0.10.0
// @description Copy code to clipboard; hiding and saving the state of the "Blog", "Meta" blocks by clicking; adding links to all questions of the author and all questions only with tags of the current question to the user's card; stretching and restoring page content for better reading of code listings; redirecting from localized versions of the site to an English-language domain with a search for the current question.
// @author      XelaNimed
// @copyright   2021, XelaNimed (https://github.com/XelaNimed)
// @match       https://*.stackoverflow.com/*
// @match       https://*.meta.stackoverflow.com/*
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @updateURL   https://openuserjs.org/meta/XelaNimed/StackOverflow_extended.meta.js
// @downloadURL https://openuserjs.org/install/XelaNimed/StackOverflow_extended.min.user.js
// @homepageURL https://github.com/XelaNimed/ruSO
// @supportURL  https://github.com/XelaNimed/ruSO/issues
// @iconURL     https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=32
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.1/jquery.min.js#sha512-aVKKRRi/Q/YV+4mjoKBsE4x3H+BkegoM/em46NNlCqNTmUYADjBbeNefNxYV7giUp0VxICtqdrbqU7iVaeZNXA==
// @require     https://cdnjs.cloudflare.com/ajax/libs/izimodal/1.6.1/js/iziModal.min.js#sha512-lR/2z/m/AunQdfBTSR8gp9bwkrjwMq1cP0BYRIZu8zd4ycLcpRYJopB+WsBGPDjlkJUwC6VHCmuAXwwPHlacww==
// @resource    IZI_MODAL https://cdnjs.cloudflare.com/ajax/libs/izimodal/1.6.1/css/iziModal.min.css
// @license     MIT
// ==/UserScript==


var $ = window.jQuery;

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
        fooFullWidth: 'fooFullWidth',
        nativeLang: 'nativeLanguage',
        useSearchRedirectBtn: 'useSearchRedirectBtn',
        addLinkToMeta: 'addLinkToMeta',
        toggleMetaBlock: 'toggleMetaBlock'
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

    // local staorage access
    isUseSearchRedirectBtn: function() {
        return localStorage[this.keys.useSearchRedirectBtn] == 'true';
    },
    getNativeLang: function() {
        return localStorage[this.keys.nativeLang];
    },
    isNativeLang: function(lang) {
        return localStorage[this.keys.nativeLang] === lang;
    },
    addLinkToMeta: function() {
        return localStorage[this.keys.addLinkToMeta] == 'true';
    },
    toggleMetaBlock: function() {
        return localStorage[this.keys.toggleMetaBlock] == 'true';
    },

    init: function() {

        'use strict';

        let self = this;

        const langs = ['ru', 'es', 'pt', 'ja'];

        if(localStorage[self.keys.nativeLang] === undefined ||
           localStorage[self.keys.nativeLang] == null ||
           localStorage[self.keys.nativeLang] === '') {
            const lang = navigator.language || navigator.userLanguage;
            if(langs.includes(lang)) {
                localStorage[self.keys.nativeLang] = lang;
            } else {
                localStorage[self.keys.useSearchRedirectBtn] = false;
            }
        }
        if(localStorage[self.keys.useSearchRedirectBtn] === undefined ||
           localStorage[self.keys.useSearchRedirectBtn] == null ||
           localStorage[self.keys.useSearchRedirectBtn] === '') {
           localStorage[self.keys.useSearchRedirectBtn] = true;
        }
        if(localStorage[self.keys.toggleMetaBlock] === undefined ||
           localStorage[self.keys.toggleMetaBlock] == null ||
           localStorage[self.keys.toggleMetaBlock] === '') {
           localStorage[self.keys.toggleMetaBlock] = true;
        }

        $(document.body).append('<div id="iziModal" style="display: none;">' +

                                    '<div class="izi-content ba">' +

                                        '<div class="d-flex ai-center jc-space-between p16">' +
                                            '<label class="flex--item s-label p0" for="so-ex-search-btn-toggle">' +
                                                '<div class="d-flex ai-center">Use redirect to enSO</div>' +
                                                '<p class="s-description">When this option is enabled, a button redirecting the current search to the English-language StackOverflow site will be added at the end of the search field.</p>' +
                                            '</label>' +
                                            '<div class="flex--item s-toggle-switch">' +
                                                '<input id="so-ex-search-btn-toggle" type="checkbox" ' + (self.isUseSearchRedirectBtn() ? 'checked="checked"' : '') + '>' +
                                                '<div class="s-toggle-switch--indicator"></div>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div id="so-ext-native-language-block" class="d-flex ai-center jc-space-between p16' + (self.isUseSearchRedirectBtn() ? '' : ' o50 pe-none') + '">' +
                                            '<label class="s-label flex--item" for="so-ext-native-language">Native language' +
                                                '<p class="s-description">The two-letter code of your language, if it is different from English. Used when redirecting search queries from the localized site to the English version and back.</p>' +
                                            '</label>' +
                                            '<div class="d-flex">' +
                                                '<select id="so-ext-native-language" class="flex--item s-input" style="width: 75px;" autofocus="true">' +
                                                    (langs.flatMap(function(l) { return '<option value="' + l + '"' + (self.isNativeLang(l) ? ' selected="selected"' : '') + '>' + l + '</option>'; }).join('')) +
                                                '</select>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="d-flex ai-center jc-space-between p16">' +
                                            '<label class="flex--item s-label p0" for="so-ex-add-meta-link">' +
                                                '<div class="d-flex ai-center">Add link to Meta</div>' +
                                                '<p class="s-description">If this option is enabled, a link to Meta will be added to the side menu.</p>' +
                                            '</label>' +
                                            '<div class="flex--item s-toggle-switch">' +
                                                '<input id="so-ex-add-meta-link" type="checkbox" ' + (self.addLinkToMeta() ? 'checked="checked"' : '') + '>' +
                                                '<div class="s-toggle-switch--indicator"></div>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="d-flex ai-center jc-space-between p16">' +
                                            '<label class="flex--item s-label p0" for="so-ex-toggle-meta-block">' +
                                                '<div class="d-flex ai-center">Minimize the Meta block</div>' +
                                                '<p class="s-description">If this option is enabled, the Meta block with popular questions can be minimized and maximized with the state saved in the local storage.</p>' +
                                            '</label>' +
                                            '<div class="flex--item s-toggle-switch">' +
                                                '<input id="so-ex-toggle-meta-block" type="checkbox" ' + (self.toggleMetaBlock() ? 'checked="checked"' : '') + '>' +
                                                '<div class="s-toggle-switch--indicator"></div>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="d-flex ai-center p16 button-panel">' +
                                            '<button class="flex--item s-btn s-btn__filled" role="button" value="cancel">Cancel</button>' +
                                            '<button class="flex--item s-btn s-btn__filled" role="button" value="save">Save</button>' +
                                            '<button class="flex--item s-btn s-btn__primary" role="button" value="save-reload">Save and reload</button>' +
                                        '</div>' +

                                    '</div>' +

                                '</div>');

        GM_addStyle(GM_getResourceText("IZI_MODAL"));
        GM_addStyle('#iziModal {  }' +
                    '#iziModal .izi-content { background-color: rgb(57, 57, 57); border-color: rgb(64, 66, 69); color: rgb(207, 210, 214); }' +
                    '#iziModal .izi-content > div { border-bottom: 1px solid rgba(245, 245, 245, 0.2); }' +
                    '#iziModal label { color: rgb(242, 242, 243); }' +
                    '#iziModal .s-description { color: rgb(207, 210, 214); }' +
                    '#iziModal .button-panel { justify-content: flex-end; background-color: rgb(45, 45, 45); }' +
                    '#iziModal .button-panel button { margin-left: 10px; }' +
                    'body > div.iziModal-overlay { backdrop-filter: blur(2px); }');

        return this;
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
        addScriptSettings = function() {
            $('<li><ol class="nav-links"><a href="#" class="nav-links--link">UserScript settings</a></li></ol></li>')
                .on('click', 'a', function(e) {
                  $("#iziModal").iziModal({
                      title: '<span style="color: rgb(207, 210, 214);">Extended StackOverflow Settings</span>',
                      subtitle: 'All settings are saved in the local storage and will take effect when the page reloads',
                      headerColor: 'rgba(45, 45, 45, 1)',
                      background: 'rgba(78, 78, 71, 1)',
                      radius: 3,
                      icon: null,
                      iconText: null,
                      iconColor: '',
                      width: 600,
                      borderBottom: false,
                      zindex: 9999,
                      focusInput: true,
                      bodyOverflow: false,
                      fullscreen: true,
                      openFullscreen: false,
                      appendToOverlay: 'body', // or false
                      overlay: true,
                      overlayClose: true,
                      overlayColor: 'rgba(0, 0, 0, 0.3)'
                  }).iziModal('open');
                })
                .insertAfter($('#left-sidebar nav > ol > li').last());

         $('#iziModal')
            .on('click', 'button', function(e) {
                 if(e.target.value.startsWith('save')) {
                     localStorage[self.keys.nativeLang] = $('#so-ext-native-language option:selected').val();
                     localStorage[self.keys.useSearchRedirectBtn] = $('#so-ex-search-btn-toggle').is(':checked');
                     localStorage[self.keys.addLinkToMeta] = $('#so-ex-add-meta-link').is(':checked');
                     localStorage[self.keys.toggleMetaBlock] = $('#so-ex-toggle-meta-block').is(':checked');
                 }
                 if(e.target.value.endsWith('reload')) {
                     document.location.reload();
                 }
                 $('#iziModal').iziModal('close');
            })
            .on('change', 'input', function(e) {
               if(e.target.id == 'so-ex-search-btn-toggle') {
                   $('#so-ext-native-language-block')[e.target.checked ? 'removeClass' : 'addClass']('o50 pe-none');
               }
            });
        },
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
            if(!self.toggleMetaBlock()) {
                return;
            }
            let showHideMetas = function ($elem) {
                let isVisible = localStorage[self.keys.showMetasKey] === 'true';
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
        addLinkToMeta = function () {
            if(!self.addLinkToMeta()) {
                return;
            }
            const isMeta = window.location.host.includes('meta.');
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
            if(!self.isUseSearchRedirectBtn()) {
                return;
            }
            let localPrefix = self.getNativeLang() + '.';
            let isLocalSO = location.host.substr(0, 3) === localPrefix;
            let btnText = isLocalSO ? 'en' : self.getNativeLang();
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
        addScriptSettings();
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

ruSO.init();

window.addEventListener('load', function () {
    ruSO
    .initLocalStorage()
    .addButtons()
    .addAuthorQuestionsLinks()
    .addCopyToClipboard();
}, false);
