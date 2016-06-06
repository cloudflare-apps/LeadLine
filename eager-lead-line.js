import {submit} from 'email-utils/utils.js';

(function(){
  if (!window.addEventListener || !document.documentElement.setAttribute || !document.querySelector || !document.documentElement.classList || !window.localStorage) {
    return
  }

  var options = INSTALL_OPTIONS;
  var isPreview = INSTALL_ID == 'preview';

  var optionsString = JSON.stringify(options);
  if (!isPreview && localStorage.leadLineShownWithOptions === optionsString) {
    return;
  }

  var setOptions = function(opts) {
    options = opts;

    update();
  };

  var update = function() {
    document.documentElement.setAttribute('eager-lead-line-goal', options.goal);

    updateColors();
    updateCopy();

    setPageStyles();
  };

  var colorStyle = document.createElement('style');
  document.head.appendChild(colorStyle);

  var updateColors = function() {
    colorStyle.innerHTML = '' +
      '.eager-lead-line {' +
        'background: ' + options.color + ' !important' +
      '}' +
      '.eager-lead-line .eager-lead-line-button {' +
        'color: ' + options.color + ' !important' +
      '}' +
    '';
  };

  var el = document.createElement('eager-lead-line');
  el.addEventListener('touchstart', function(){}, false); // iOS :hover CSS hack
  el.className = 'eager-lead-line';

  var updateCopy = function() {
    el.innerHTML = '' +
      '<div class="eager-lead-line-close-button"></div>' +
      '<div class="eager-lead-line-content">' +
        '<div class="eager-lead-line-text"></div>' +
        (options.goal === 'announcement' ? '' :
        '<' + (options.goal === 'signup' ? 'form' : 'div') + ' class="eager-lead-line-form">' +
          (options.goal !== 'signup' ? '' :
          '<input name="email" class="eager-lead-line-input" type="email" placeholder="'+ options.signupInputPlaceholder + '" spellcheck="false" required>') +
          (options.goal === 'cta' ?
          '<a target="_blank" class="eager-lead-line-link">' : '') +
            '<button ' + (options.goal === 'signup' ? 'type="submit" ' : '') + 'class="eager-lead-line-button"></button>' +
          (options.goal === 'cta' ?
          '</a>' : '') +
        '</' + (options.goal === 'signup' ? 'form' : 'div') + '>') +
      '</div>' +
      '<div class="eager-lead-line-branding">' +
        '<a class="eager-lead-line-branding-link" href="https://eager.io?utm_source=eager_leads_powered_by_link" target="_blank">Powered by Eager</a>' +
      '</div>' +
    '';

    var textEl = el.querySelector('.eager-lead-line-text')
    textEl.innerHTML = options[options.goal + 'Text'];

    var buttonEl = el.querySelector('.eager-lead-line-button')
    if (options.goal !== 'announcement') {
      buttonEl.innerHTML = options[options.goal + 'ButtonText'] || '&nbsp;';
    } else if (buttonEl) {
      buttonEl.innerHTML = '';
    }

    var linkEl;
    if (options.goal === 'cta') {
      linkEl = el.querySelector('.eager-lead-line-link')
      linkEl.setAttribute('href', options.ctaLinkAddress);
    }

    el.querySelector('.eager-lead-line-close-button').addEventListener('click', hide);
    if (options.goal == 'cta') {
      linkEl.addEventListener('click', hide);
    }
  }

  el.addEventListener('submit', function(event) {
    event.preventDefault();

    var form = el.querySelector('form');
    var button = el.querySelector('button[type="submit"]');

    if (isPreview) {
      el.querySelector('.eager-lead-line-text').innerHTML = options.signupSuccessText + ' (Form submissions are simulated during the Eager preview.)';
      document.documentElement.setAttribute('eager-lead-line-goal', 'announcement');
      setPageStyles();
      return;
    }

    var callback = function(ok) {
      var message;

      button.removeAttribute('disabled');

      if (ok){
        document.documentElement.setAttribute('eager-lead-line-goal', 'announcement');
        setPageStyles();

        if (typeof ok == 'string'){
          message = ok;
        } else {
          message = options.signupSuccessText;
        }

        form.parentNode.removeChild(form);
        setTimeout(hide, 3000);
      } else {
        message = 'Whoops, something didn’t work. Please try again:';
      }

      el.querySelector('.eager-lead-line-text').innerHTML = message;
      setPageStyles();
    };

    var email = el.querySelector('input[type="email"]').value;

    options.destination = options.signupDestination;
    options.email = options.signupEmail;
    submit(options, email, callback);

    button.setAttribute('disabled', 'disabled');
  });

  var show = function() {
    document.documentElement.setAttribute('eager-lead-line-show', 'true');

    if (!htmlStyle.parentNode){
      document.head.appendChild(htmlStyle);
    }
  };
  show();

  var hide = function() {
    document.documentElement.setAttribute('eager-lead-line-show', 'false');
    document.head.removeChild(htmlStyle);
    try {
      localStorage.leadLineShownWithOptions = optionsString;
    } catch (e) {}
    setPageStyles();
  };

  var setPageStyles = function() {
    setHTMlStyle();
    setFixedElementStyles();
  };

  var htmlStyle = document.createElement('style');
  document.head.appendChild(htmlStyle);

  var setHTMlStyle  = function() {
    if (!document.body) return;

    var style = '';
    if (document.documentElement.getAttribute('eager-lead-line-show') === 'true') {
      style = '' +
        'html {' +
          'margin-top: ' + el.clientHeight + 'px' +
        '}' +
      '';
    }
    htmlStyle.innerHTML = style;
  };

  var setFixedElementStyles = function() {
    var removeTopStyle = function(node) {
      if (!node.getAttribute('style')) return;
      node.setAttribute('style', node.getAttribute('style').replace(/top[^;]+;?/g, ''));
    };
    var elHeight = el.clientHeight;
    var allNodes = document.querySelectorAll('*:not(.eager-lead-line)');
    Array.prototype.forEach.call(allNodes, function(node) {
      var isFixed = getComputedStyle(node).position === 'fixed';
      var onBottom = getComputedStyle(node).bottom === '0px' || node.getBoundingClientRect().bottom === window.innerHeight;
      if (isFixed && !onBottom) {
        var top = node.getBoundingClientRect().top;
        var styleTop = parseInt(getComputedStyle(node).top, 10);
        if (top === styleTop && top <= elHeight) {
          node.setAttribute('data-eager-lead-line-adjusted-fixed-element-original-top', top);
        }
      }
    });

    var adjustedNodes = document.querySelectorAll('[data-eager-lead-line-adjusted-fixed-element-original-top]');
    Array.prototype.forEach.call(adjustedNodes, function(node) {
      removeTopStyle(node);
      if (document.documentElement.getAttribute('eager-lead-line-show') === 'true') {
        node.style.top = (parseInt(getComputedStyle(node).top, 10) || 0) + elHeight + 'px';
      }
    });
  };

  window.addEventListener('resize', setPageStyles);

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(el);

    update();

    setTimeout(setPageStyles, 0);
  });

  window.EagerLeadLine = {
    setOptions: setOptions,
    show: show,
    hide: hide
  };
})();
