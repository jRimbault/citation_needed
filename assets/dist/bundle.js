!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";function r(t,e){const n=document.createElement(t);return void 0===e?n:(e.id&&(n.id=e.id),function(t,e){if(e)for(const[n,r]of Object.entries(e))r&&t.addEventListener(n,r.callback,r.options);return t}(function(t,e){if(e&&e.length>0)for(const o of e)t.append((n=o)instanceof Node?n:r(n[0],n[1]));var n;return t}(function(t,e){if(e)for(const[n,r]of Object.entries(e))t.setAttribute(n,r);return t}(function(t,e){e&&("string"==typeof e?t.textContent=e:e.html&&(t.innerHTML=e.html));return t}(function(t,e){e&&("string"==typeof e&&""!==e&&t.classList.add(e),e instanceof Array&&t.classList.add(...e.filter(Boolean)));return t}(n,e.classList),e.textContent),e.attributes),e.children),e.listeners))}function o(t,e,n){return()=>{const r=t.get(e);i("number"==typeof r);const o=r+1;t.set(e,o),n(o),new Audio("sounds/ding-sound-effect_2.mp3").play()}}function i(t,e){if(!t)throw new Error(e)}n.r(e),window.onload=function(){const t=document.getElementById("add-player"),e=document.getElementById("player-name"),n=document.getElementById("player-list");var u,c,l;i(t),i(e),i(n),t.addEventListener("click",(u=new Map,c=n,l=e,()=>{const t=l.value;""===t||u.has(t)||(c.append(function(t,e){e.set(t,0);const n=r("span",{textContent:"0"});return r("li",{textContent:`${t} : `,children:[n,["button",{textContent:"+1",listeners:{click:{callback:o(e,t,t=>n.textContent=t.toString())}}}]]})}(t,u)),l.value="")}))}}]);
//# sourceMappingURL=bundle.js.map