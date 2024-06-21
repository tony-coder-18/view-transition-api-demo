export async function getPageContent(url) {
    // This is a really scrappy way to do this.
    // Don't do this in production!
    const response = await fetch(url);
    const text = await response.text();
    // Particularly as it uses regexp
    return /<body[^>]*>([\w\W]*)<\/body>/.exec(text)[1];
}

function isBackNavigation(navigateEvent) {
    if (navigateEvent.navigationType === 'push' || navigateEvent.navigationType === 'replace') {
        return false;
    }
    if (
        navigateEvent.destination.index !== -1 &&
        navigateEvent.destination.index < navigation.currentEntry.index
    ) {
        return true;
    }
    return false;
}

// Intercept navigations
// https://developer.chrome.com/docs/web-platform/navigation-api/
// This is a naive usage of the navigation API, to keep things simple.
export async function onLinkNavigate(callback) {
    // Ok, here's an even shittier version just to get things working in Safari
    if (!self.navigation) {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;

            event.preventDefault();

            const toUrl = new URL(link.href);

            callback({
                toPath: toUrl.pathname,
                fromPath: location.pathname,
                isBack: false,
            });

            history.pushState({}, null, toUrl.pathname);

        });
        return;
    }

    navigation.addEventListener('navigate', (event) => {
        const toUrl = new URL(event.destination.url);

        if (location.origin !== toUrl.origin) return;

        const fromPath = location.pathname;
        const isBack = isBackNavigation(event);

        event.intercept({
            async handler() {
                if (event.info === 'ignore') return;

                await callback({
                    toPath: toUrl.pathname,
                    fromPath,
                    isBack,
                });
            },
        });
    });
}

export function getLink(href) {
    const fullLink = new URL(href, location.href).href;

    return [...document.querySelectorAll('a')].find((link) =>
        link.href === fullLink
    );
}

// This helper function returns a View-Transition-like object, even for browsers that don't support view transitions.
// It won't do the transition in unsupported browsers, it'll act as if the transition is skipped.
// It also makes it easier to add class names to the document element.
export function transitionHelper({
    skipTransition = false,
    classNames = '',
    updateDOM,
}) {
    if (skipTransition || !document.startViewTransition) {
        const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

        return {
            ready: Promise.reject(Error('View transitions unsupported')),
            domUpdated: updateCallbackDone,
            updateCallbackDone,
            finished: updateCallbackDone,
        };
    }

    const classNamesArray = classNames.split(/\s+/g).filter(Boolean);

    document.documentElement.classList.add(...classNamesArray);

    const transition = document.startViewTransition(updateDOM);

    transition.finished.finally(() =>
        document.documentElement.classList.remove(...classNamesArray)
    );

    return transition;
}



/**/

export async function getPageContent(url) {
    // This is a really scrappy way to do this.
    // Don't do this in production!
    const response = await fetch(url);
    const text = await response.text();
    // Particularly as it uses regexp
    return /<body[^>]*>([\w\W]*)<\/body>/.exec(text)[1];
}

function isBackNavigation(navigateEvent) {
    if (navigateEvent.navigationType === 'push' || navigateEvent.navigationType === 'replace') {
        return false;
    }
    if (
        navigateEvent.destination.index !== -1 &&
        navigateEvent.destination.index < navigation.currentEntry.index
    ) {
        return true;
    }
    return false;
}

// Intercept navigations
// https://developer.chrome.com/docs/web-platform/navigation-api/
// This is a naive usage of the navigation API, to keep things simple.
export async function onLinkNavigate(callback) {
    // Ok, here's an even shittier version just to get things working in Safari
    if (!self.navigation) {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;

            event.preventDefault();

            const toUrl = new URL(link.href);

            callback({
                toPath: toUrl.pathname,
                fromPath: location.pathname,
                isBack: false,
            });

            history.pushState({}, null, toUrl.pathname);

        });
        return;
    }

    navigation.addEventListener('navigate', (event) => {
        const toUrl = new URL(event.destination.url);

        if (location.origin !== toUrl.origin) return;

        const fromPath = location.pathname;
        const isBack = isBackNavigation(event);

        event.intercept({
            async handler() {
                if (event.info === 'ignore') return;

                await callback({
                    toPath: toUrl.pathname,
                    fromPath,
                    isBack,
                });
            },
        });
    });
}

export function getLink(href) {
    const fullLink = new URL(href, location.href).href;

    return [...document.querySelectorAll('a')].find((link) =>
        link.href === fullLink
    );
}

// This helper function returns a View-Transition-like object, even for browsers that don't support view transitions.
// It won't do the transition in unsupported browsers, it'll act as if the transition is skipped.
// It also makes it easier to add class names to the document element.
export function transitionHelper({
    skipTransition = false,
    classNames = '',
    updateDOM,
}) {
    if (skipTransition || !document.startViewTransition) {
        const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

        return {
            ready: Promise.reject(Error('View transitions unsupported')),
            domUpdated: updateCallbackDone,
            updateCallbackDone,
            finished: updateCallbackDone,
        };
    }

    const classNamesArray = classNames.split(/\s+/g).filter(Boolean);

    document.documentElement.classList.add(...classNamesArray);

    const transition = document.startViewTransition(updateDOM);

    transition.finished.finally(() =>
        document.documentElement.classList.remove(...classNamesArray)
    );

    return transition;
}






import { getPageContent, onLinkNavigate, transitionHelper, getLink } from '../utils.js';

const galleryPath = '/6-expanding-image/';
const catsPath = `${galleryPath}cats/`;

function getNavigationType(fromPath, toPath) {
    if (fromPath.startsWith(catsPath) && toPath === galleryPath) {
        return 'cat-page-to-gallery';
    }

    if (fromPath === galleryPath && toPath.startsWith(catsPath)) {
        return 'gallery-to-cat-page';
    }

    return 'other';
}


onLinkNavigate(async ({ fromPath, toPath }) => {
    const navigationType = getNavigationType(fromPath, toPath);
    const content = await getPageContent(toPath);

    let targetThumbnail;

    if (navigationType === 'gallery-to-cat-page') {
        targetThumbnail = getLink(toPath).querySelector('img');
        targetThumbnail.style.viewTransitionName = 'banner-img';
    }

    const transition = transitionHelper({
        updateDOM() {
            // This is a pretty heavy-handed way to update page content.
            // In production, you'd likely be modifying DOM elements directly,
            // or using a framework.
            // innerHTML is used here just to keep the DOM update super simple.
            document.body.innerHTML = content;

            if (navigationType === 'cat-page-to-gallery') {
                targetThumbnail = getLink(fromPath).querySelector('img');
                targetThumbnail.style.viewTransitionName = 'banner-img';
            }
        }
    });

    transition.finished.finally(() => {
        // Clear the temporary tag
        if (targetThumbnail) targetThumbnail.style.viewTransitionName = '';
    });
});
