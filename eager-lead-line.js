(function(){
  if (!window.addEventListener || !document.documentElement.setAttribute || !document.querySelector || !document.documentElement.classList || !document.documentElement.classList.add || !window.localStorage) {
    return
  }

  var options, isPreview, optionsString, colorStyle, htmlStyle, el, lastElHeight, show, hide, setHTMLStyle;

  options = INSTALL_OPTIONS;

  isPreview = window.Eager && window.Eager.installs && window.Eager.installs.preview && window.Eager.installs.preview.appId === 'bdVPVrU8-ZKH';

  optionsString = JSON.stringify(options);
  if (!isPreview && localStorage[optionsString]) {
    return;
  }

  document.documentElement.setAttribute('eager-lead-line-goal', options.goal);

  colorStyle = document.createElement('style');
  colorStyle.innerHTML = '' +
    '.eager-lead-line {' +
      'background: ' + options.color + ' !important' +
    '}' +
    '.eager-lead-line .eager-lead-line-button {' +
      'color: ' + options.color + ' !important' +
    '}' +
  '';

  el = document.createElement('eager-lead-line');
  el.addEventListener('touchstart', function(){}, false); // iOS :hover CSS hack
  el.className = 'eager-lead-line';
  el.innerHTML = '' +
    '<div class="eager-lead-line-close-button"></div>' +
    '<div class="eager-lead-line-content">' +
      '<div class="eager-lead-line-text"></div>' +
      (options.goal === 'announcement' ? '' :
      '<' + (options.goal === 'signup' ? 'form' : 'div') + (options.goal === 'signup' && options.signupEmail ? ' action="//formspree.io/' + options.signupEmail + '"' : '') + ' class="eager-lead-line-form">' +
        (options.goal !== 'signup' ? '' :
        '<input name="email" class="eager-lead-line-input" type="email" placeholder="Email address" spellcheck="false" required>') +
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
  el.querySelector('.eager-lead-line-text').appendChild(document.createTextNode(options[options.goal + 'Text']));
  if (options.goal !== 'announcement') {
    el.querySelector('.eager-lead-line-button').appendChild(document.createTextNode(options[options.goal + 'ButtonText'] || '&nbsp;'));
  }
  if (options.goal === 'cta') {
    el.querySelector('.eager-lead-line-link').setAttribute('href', options.ctaLinkAddress);
  }
  if (options.goal === 'signup') {
    el.querySelector('form').addEventListener('submit', function(event){
      event.preventDefault();

      var form, button, url, xhr, callback, params;

      form = el.querySelector('form');
      button = el.querySelector('button[type="submit"]');
      url = form.action;
      xhr = new XMLHttpRequest();

      if (isPreview) {
        form.parentNode.removeChild(form);
        el.querySelector('.eager-lead-line-text').innerHTML = options.signupSuccessText + ' (Form submissions are simulated during the Eager preview.)';
        document.documentElement.setAttribute('eager-lead-line-goal', 'announcement');
        setHTMLStyle();
        return;
      }

      callback = function(xhr) {
        var jsonResponse, message;

        button.removeAttribute('disabled');

        if (xhr && xhr.target && xhr.target.status === 200) {
          form.parentNode.removeChild(form);
          document.documentElement.setAttribute('eager-lead-line-goal', 'announcement');
          setHTMLStyle();
          message = options.signupSuccessText;
          try {
            if (xhr.target.response) {
              jsonResponse = JSON.parse(xhr.target.response);
              if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
                message = 'Formspree has sent an email to ' + options.signupEmail + ' for verification.';
              }
            }
          } catch (err) {}
          setTimeout(hide, 3000);
        } else {
          message = 'Whoops, something didn’t work. Please try again:';
        }

        el.querySelector('.eager-lead-line-text').innerHTML = message;
        setHTMLStyle();
      };

      params = 'email=' + encodeURIComponent(el.querySelector('input[type="email"]').value);

      if (!url) {
        return;
      }

      button.setAttribute('disabled', 'disabled');
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = callback.bind(xhr);
      xhr.send(params);
    });
  }

  show = function() {
    document.documentElement.setAttribute('eager-lead-line-show', 'true');
  };
  show();

  hide = function() {
    localStorage[optionsString] = true;
    document.documentElement.setAttribute('eager-lead-line-show', 'false');
    document.body.removeChild(htmlStyle);
  };
  el.querySelector('.eager-lead-line-close-button').addEventListener('click', hide);
  if (options.goal == 'cta') {
    el.querySelector('.eager-lead-line-link').addEventListener('click', hide);
  }

  htmlStyle = document.createElement('style');
  lastElHeight = 0;
  setHTMLStyle = function() {
    if (!document.body) {
      return;
    }

    var elHeight = el.clientHeight;
    if (lastElHeight !== elHeight) {
      htmlStyle.innerHTML = '' +
        'html {' +
          '-webkit-transform: translate3d(0, ' + elHeight + 'px, 0) !important;' +
          'transform: translate3d(0, ' + elHeight + 'px, 0) !important' +
        '}' +
      '';
    }
    lastElHeight = elHeight;
  };
  window.addEventListener('resize', setHTMLStyle);

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(colorStyle);
    document.body.appendChild(el);
    document.body.appendChild(htmlStyle);
    setHTMLStyle();
    setTimeout(function(){
      setHTMLStyle();
    }, 0);
  });
})();
