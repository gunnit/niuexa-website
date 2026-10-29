/* Holds HubSpot and Apollo.io scripts until the visitor grants marketing consent.
   The cookie policy lists both as marketing tools, but the GTM container fires them on
   every page load. This runs inline before GTM (build/inline-consent-guard.mjs copies it
   into every page) and releases the held scripts on cookie-banner.js's niuexa:consent event. */
(function (w) {
    var held = [];
    var granted = false;
    var hosts = /(^|\.)(hs-scripts\.com|hs-analytics\.net|hs-banner\.com|hscollectedforms\.net|hsforms\.(com|net)|hubspot\.com|apollo\.io|aplo-evnt\.com)$/i;
    var proto = w.Node && w.Node.prototype;
    if (!proto) return;
    var append = proto.appendChild;
    var insert = proto.insertBefore;
    try {
        var saved = JSON.parse(w.localStorage.getItem('niuexa_cookie_consent'));
        granted = !!(saved && saved.marketing === true);
    } catch (e) { /* no saved choice */ }
    function hold(node) {
        if (granted || !node || node.nodeName !== 'SCRIPT' || !node.src) return false;
        try { return hosts.test(new URL(node.src, w.location.href).hostname); } catch (e) { return false; }
    }
    proto.appendChild = function (node) {
        if (hold(node)) { held.push([this, node, null]); return node; }
        return append.call(this, node);
    };
    proto.insertBefore = function (node, ref) {
        if (hold(node)) { held.push([this, node, ref]); return node; }
        return insert.call(this, node, ref);
    };
    w.addEventListener('niuexa:consent', function (event) {
        if (!event.detail || event.detail.marketing !== true) return;
        granted = true;
        held.splice(0).forEach(function (item) {
            if (item[2] && item[2].parentNode === item[0]) insert.call(item[0], item[1], item[2]);
            else append.call(item[0], item[1]);
        });
    });
})(window);
