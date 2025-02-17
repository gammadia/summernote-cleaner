/* https://github.com/DiemenDesign/summernote-cleaner */
/* Version: 1.0.1 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object'&&module.exports) {
    module.exports = factory(require('jquery'));
  } else {
    factory(window.jQuery);
  }
}
(function ($) {
  $.extend(true, $.summernote.lang, {
    'en-US': {
      cleaner: {
        tooltip: 'Cleaner',
        not: 'Text has been Cleaned!!!',
        limitText: 'Text',
        limitHTML: 'HTML'
      }
    },
    'de-DE': {
      cleaner: {
        tooltip: 'Cleaner',
        not: 'Inhalt wurde bereinigt!',
        limitText: 'Text',
        limitHTML: 'HTML'
      }
    },
  });
  $.extend( $.summernote.options, {
    cleaner: {
      action: 'both', // both|button|paste 'button' only cleans via toolbar button, 'paste' only clean when pasting content, both does both options.
      newline: '<br>', // Summernote's default is to use '<p><br></p>'
      icon: '<i class="note-icon"><svg xmlns="http://www.w3.org/2000/svg" id="libre-paintbrush" viewBox="0 0 14 14" width="14" height="14"><path d="m 11.821425,1 q 0.46875,0 0.82031,0.311384 0.35157,0.311384 0.35157,0.780134 0,0.421875 -0.30134,1.01116 -2.22322,4.212054 -3.11384,5.035715 -0.64956,0.609375 -1.45982,0.609375 -0.84375,0 -1.44978,-0.61942 -0.60603,-0.61942 -0.60603,-1.469866 0,-0.857143 0.61608,-1.419643 l 4.27232,-3.877232 Q 11.345985,1 11.821425,1 z m -6.08705,6.924107 q 0.26116,0.508928 0.71317,0.870536 0.45201,0.361607 1.00781,0.508928 l 0.007,0.475447 q 0.0268,1.426339 -0.86719,2.32366 Q 5.700895,13 4.261155,13 q -0.82366,0 -1.45982,-0.311384 -0.63616,-0.311384 -1.0212,-0.853795 -0.38505,-0.54241 -0.57924,-1.225446 -0.1942,-0.683036 -0.1942,-1.473214 0.0469,0.03348 0.27455,0.200893 0.22768,0.16741 0.41518,0.29799 0.1875,0.130581 0.39509,0.24442 0.20759,0.113839 0.30804,0.113839 0.27455,0 0.3683,-0.247767 0.16741,-0.441965 0.38505,-0.753349 0.21763,-0.311383 0.4654,-0.508928 0.24776,-0.197545 0.58928,-0.31808 0.34152,-0.120536 0.68974,-0.170759 0.34821,-0.05022 0.83705,-0.07031 z"/></svg></i>',
      keepHtml: true,
      badTags: ['applet', 'col', 'colgroup', 'embed', 'noframes', 'noscript', 'script', 'style', 'title'], //Remove full tags with contents
      badAttributes: ['bgcolor', 'border', 'height', 'cellpadding', 'cellspacing', 'lang', 'start', 'style', 'valign', 'width'], //Remove attributes from remaining tags
      limitChars: 0, // 0|# 0 disables option
      limitDisplay: 'both', // none|text|html|both
      limitStop: false, // true/false
      imagePlaceholder: 'https://via.placeholder.com/200'
    }
  });
  $.extend( $.summernote.plugins, {
    'cleaner': function (context) {
      var self = this,
            ui = $.summernote.ui,
         $note = context.layoutInfo.note,
       $editor = context.layoutInfo.editor,
       options = context.options,
          lang = options.langInfo;
      if (options.cleaner.action == 'both' || options.cleaner.action == 'button') {
        context.memo('button.cleaner', function () {
          var button = ui.button({
            contents: options.cleaner.icon,
            container: options.container,
            tooltip: lang.cleaner.tooltip,
            placement: options.placement,
            click: function () {
              if ($note.summernote('createRange').toString())
                $note.summernote('pasteHTML', $note.summernote('createRange').toString());
              else
                $note.summernote('code', cleanPaste($note.summernote('code'), options.cleaner.badTags, options.cleaner.badAttributes));
              if ($editor.find('.note-status-output').length > 0)
                $editor.find('.note-status-output').html(lang.cleaner.not);
            }
          });
          return button.render();
        });
      }
      this.events = {
        'summernote.init': function () {
          if (options.cleaner.limitChars != 0 || options.cleaner.limitDisplay != 'none'){
            var textLength = $editor.find(".note-editable").text().replace(/(<([^>]+)>)/ig, "").replace(/( )/," ");
            var codeLength = $editor.find('.note-editable').html();
            var lengthStatus = '';
            if (textLength.length > options.cleaner.limitChars&&options.cleaner.limitChars > 0)
              lengthStatus += 'note-text-danger">';
            else
              lengthStatus += '">';
            if (options.cleaner.limitDisplay == 'text' || options.cleaner.limitDisplay == 'both')
              lengthStatus += lang.cleaner.limitText + ': ' + textLength.length;
            if (options.cleaner.limitDisplay == 'both')
              lengthStatus += ' / ';
            if (options.cleaner.limitDisplay == 'html' || options.cleaner.limitDisplay == 'both')
              lengthStatus += lang.cleaner.limitHTML + ': ' + codeLength.length;
            $editor.find('.note-status-output').html('<small class="note-pull-right ' + lengthStatus + '&nbsp;</small>');
          }
        },
        'summernote.keydown': function (we, event) {
          if (options.cleaner.limitChars != 0 || options.cleaner.limitDisplay != 'none') {
            var textLength = $editor.find(".note-editable").text().replace(/(<([^>]+)>)/ig, "").replace(/( )/, " ");
            var codeLength = $editor.find('.note-editable').html();
            var lengthStatus = '';
            if (options.cleaner.limitStop == true && textLength.length >= options.cleaner.limitChars) {
              var key = event.keyCode;
              allowed_keys = [8, 37, 38, 39, 40, 46];
              if ($.inArray(key,allowed_keys) != -1){
                $editor.find('.cleanerLimit').removeClass('note-text-danger');
                return true;
              } else {
                $editor.find('.cleanerLimit').addClass('note-text-danger');
                event.preventDefault();
                event.stopPropagation();
              }
            } else {
              if (textLength.length > options.cleaner.limitChars && options.cleaner.limitChars > 0)
                lengthStatus += 'note-text-danger">';
              else
                lengthStatus += '">';
              if (options.cleaner.limitDisplay == 'text' || options.cleaner.limitDisplay == 'both')
                lengthStatus += lang.cleaner.limitText + ': '+textLength.length;
              if (options.cleaner.limitDisplay == 'both')
                lengthStatus += ' / ';
              if (options.cleaner.limitDisplay == 'html' || options.cleaner.limitDisplay == 'both')
                lengthStatus += lang.cleaner.limitHTML + ': ' + codeLength.length;
              $editor.find('.note-status-output').html('<small class="cleanerLimit note-pull-right ' + lengthStatus + '&nbsp;</small>');
            }
          }
        },
        'summernote.paste': function(we, event) {
          if (options.cleaner.action=='both' || options.cleaner.action == 'paste') {
            event.preventDefault();
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
                msie = msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
            var ffox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (msie)
              var text = window.clipboardData.getData("Text");
            else
              var text = event.originalEvent.clipboardData.getData(options.cleaner.keepHtml ? 'text/html' : 'text/plain');
            if(text) {
              text = cleanPaste(text, options.cleaner.badTags, options.cleaner.badAttributes)
            }
            if (text) {
              if (msie || ffox) {
                setTimeout(function () {
                  $note.summernote('pasteHTML', text);
                }, 1);
              } else
                $note.summernote('pasteHTML', text);
              if (options.cleaner.verbose && $editor.find('.note-status-output').length > 0)
                $editor.find('.note-status-output').html(lang.cleaner.not);
            }
          }
        }
      }
      var cleanPaste = function(input, badTags, badAttributes) {
        var stringStripper = /(\n|\r| class=(")?Mso[a-zA-Z]+(")? ^p)/g;
        var output = input.replace(stringStripper, ' ');
        var commentSripper = new RegExp('<!--(.*?)-->', 'g');
        var output = output.replace(commentSripper, '');
        var tagStripper = new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>', 'gi');
        output = output.replace(/ src="(.*?)"/gi, ' src="' + options.cleaner.imagePlaceholder + '"');
        output = output.replace(/ name="(.*?)"/gi, ' data-title="$1" alt="$1"');
        output = output.replace(tagStripper, '');
        output = output.replace(new RegExp('<!DOCTYPE[^>[]*(\[[^]]*\])?>', 'gi'), '');
        for (var i = 0; i < options.cleaner.badTags.length; i++) {
          tagStripper = new RegExp('<' + options.cleaner.badTags[i] + '.*?' + options.cleaner.badTags[i] + '(.*?)>', 'gi');
          output = output.replace(tagStripper, '');
        }
        for (var i = 0; i < options.cleaner.badAttributes.length; i++) {
          var attributeStripper = new RegExp(options.cleaner.badAttributes[i] + '="(.*?)"', 'gi');
          output = output.replace(attributeStripper, '');
        }
        output = output.replace(/ align="(.*?)"/gi, ' class="text-$1"');
        output = output.replace(/ class="western"/gi, '');
        output = output.replace(/ class=""/gi, '');
        output = output.replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>');
        output = output.replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>');
        output = encodeURI(output);
        output = output.replace(/\%[0|1][0-9]/g, '');
        output = decodeURI(output);
        output = output.replace(/\s{2,}/g, ' ').trim();
        return output;
      }
    }
  });
}));
