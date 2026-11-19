/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-a454db71'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "357b8b46c7c3c63db100375548ddfa48"
  }, {
    "url": "pwa-512x512.png",
    "revision": "f430f99ba4a528955744b7aca26f2df6"
  }, {
    "url": "pwa-192x192.png",
    "revision": "29dad984f6db88d67f4f3b4318fa8261"
  }, {
    "url": "index.html",
    "revision": "8a0f94746bedbf99e620b392de7ce758"
  }, {
    "url": "icon.svg",
    "revision": "9bc2511c5cd760bc84db8db38fbf941a"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b2e28f583b8618422bf05c81615cfcb2"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/logo_navbar.svg",
    "revision": null
  }, {
    "url": "assets/logo_federico_coletta.svg",
    "revision": null
  }, {
    "url": "assets/index-DYERn8jX.js",
    "revision": null
  }, {
    "url": "assets/index-CmiN9QsH.css",
    "revision": null
  }, {
    "url": "assets/firma_federico_coletta.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b2e28f583b8618422bf05c81615cfcb2"
  }, {
    "url": "icon.svg",
    "revision": "9bc2511c5cd760bc84db8db38fbf941a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "29dad984f6db88d67f4f3b4318fa8261"
  }, {
    "url": "pwa-512x512.png",
    "revision": "f430f99ba4a528955744b7aca26f2df6"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "357b8b46c7c3c63db100375548ddfa48"
  }, {
    "url": "assets/firma_federico_coletta.png",
    "revision": "c1696cfbd7b9d2bfd9d82297b4d16dcd"
  }, {
    "url": "assets/logo_federico_coletta.svg",
    "revision": "85ea944e80e43e2d1b308c99fc69400e"
  }, {
    "url": "assets/logo_navbar.svg",
    "revision": "d941ae2378cb43d0a7742f93c59c8b3f"
  }, {
    "url": "manifest.webmanifest",
    "revision": "29859aa25f00315ea727e81a6b44977b"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "google-fonts-stylesheets",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-webfonts",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/www\.gstatic\.com\/firebasejs\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "firebase-sdk-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
