(()=>{"use strict";function t(e,n){const o=document.createElement(e);return void 0===n?o:(n.id&&(o.id=n.id),function(t,e){if(e)for(const[n,o]of Object.entries(e))o instanceof Array?t.addEventListener(n,o[0],o[1]):o instanceof Function&&t.addEventListener(n,o);return t}(function(e,n){if(n&&n.length>0)for(const r of n)e.append((o=r)instanceof Node?o:t(o[0],o[1]));var o;return e}(function(t,e){if(e)for(const[n,o]of Object.entries(e))t.setAttribute(n,o);return t}(function(t,e){return e&&("string"==typeof e?t.textContent=e:e.html&&(t.innerHTML=e.html)),t}(function(t,e){return e&&("string"==typeof e&&""!==e&&t.classList.add(e),e instanceof Array&&t.classList.add(...e.filter(Boolean))),t}(o,n.classList),n.textContent),n.attributes),n.children),n.listeners))}function e(e,o){var r;const s=o.set(e,null!==(r=o.get(e))&&void 0!==r?r:{score:0}).get(e);n(void 0!==s);const a=t("span",{textContent:s.score.toString()});return t("li",{textContent:`${e} : `,children:[a,["button",{textContent:"+1",listeners:{click:()=>{s.score+=1,a.textContent=s.score.toString(),new Audio("sounds/ding-sound-effect_2.mp3").play()}}}]]})}function n(t,e){if(!t)throw new Error(e)}window.onload=()=>function({add:t,reset:n,save:o,playerName:r,playerList:s}){const a=function(){const t="scores";return{get:()=>{var e;const n=JSON.parse(null!==(e=localStorage.getItem(t))&&void 0!==e?e:"{}"),o=new Map;for(const[t,e]of Object.entries(n))o.set(t,e);return o},set:e=>{const n={};for(const[t,o]of e.entries())n[t]=o;localStorage.setItem(t,JSON.stringify(n))},clear:e=>{e.clear(),localStorage.setItem(t,"{}")}}}(),i=a.get();s.append(...function(t){return Array.from(t.keys(),(n=>e(n,t)))}(i)),t.addEventListener("click",function(t,n,o){return()=>{const r=o.value;""===r||t.has(r)||(n.append(e(r,t)),o.value="")}}(i,s,r)),n.addEventListener("click",(()=>{Array.from(s.children).forEach((t=>t.remove())),a.clear(i)})),o.addEventListener("click",(()=>a.set(i)))}(function(){function t(t){return document.getElementById(t)}const e=t("add-player"),o=t("reset"),r=t("save"),s=t("player-name"),a=t("player-list");return n(null!==e,"Button to add player not found."),n(null!==o,"Button to erase game data not found."),n(null!==r,"Button to save game data not found."),n(null!==s,"Text input for players's names not found."),n(null!==a,"List element not found."),{add:e,reset:o,save:r,playerName:s,playerList:a}}())})();
//# sourceMappingURL=bundle.js.map