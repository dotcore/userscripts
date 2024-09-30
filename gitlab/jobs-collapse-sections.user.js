// ==UserScript==
// @name         Gitlab - CI - Jobs - Collapse Sections
// @namespace    https://github.com/dotcore/userscripts
// @version      2024-10-01
// @description  Collapse the first sections of a job that usually do not contain interesting information and reduce clutter.
// @author       David Bauer <db@dotcore.net>
// @match        https://gitlab.com/*/-/jobs/*
// @include      /^https:\/\/gitlab.*\.com\/.*/-/jobs/\d+$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gitlab.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function debounce (func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        }
    }

    function findJobSucceededSpan (container) {
        return Array.from(container.querySelectorAll('span.term-fg-l-green.term-bold'))
            .find(span => span.textContent.trim() === 'Job succeeded');
    }

    function clickParentOfSvg (container) {
        const jobSucceeded = findJobSucceededSpan(container);
        container.querySelectorAll('svg[data-testid="chevron-lg-down-icon"]').forEach(svg => {
            const parent = svg.parentElement;
            if (parent) {
                if (jobSucceeded || !Array.from(parent.children).some(child => child.textContent.includes('Executing "step_script" stage of the job script'))) {
                    parent.click();
                }
            }
        });
    };

    const debouncedClickParentOfSvg = debounce(clickParentOfSvg, 300);

    function observeContainer (container) {
        new MutationObserver((mutations, obs) => {
            debouncedClickParentOfSvg(container);
            obs.disconnect();
        }).observe(container, { childList: true, subtree: true });
    }

    function observeBody () {
        new MutationObserver((mutations, obs) => {
            const container = document.querySelector('div.build-log-container.gl-relative');
            if (container) {
                observeContainer(container);
                obs.disconnect();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('load', observeBody, false);
})();