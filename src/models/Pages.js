import Page from '@/models/Page.js';

export const pages = new Map();
export const numPages = new Map();
export const availableNumPage = new Set();

export let minNum = 0;
export let maxNum = 0;

/** XXX: for test purpose only */
export function __forTest(min, max) {
    minNum = min;
    maxNum = max;
}

export function addPage() {
    const maxId = Math.max(0, ...pages.keys());
    const id = maxId + 1;
    const page = new Page({id: id});
    pages.set(id, page);

    return page;
}

export function removePage(id) {
    const page = pages.get(id);
    if (page) {
        page.pageNum.forEach(num => {
            numPages.delete(num);
            num >= minNum && num <= maxNum && availableNumPage.add(num);
        });
        return pages.delete(id);
    }
    return false;
}

//TODO use a better algo (A* maybe)
export function assignNumPage(min, max, firstPage, force = false) {
    const listNum = new Set();
    const tempNumPages = new Map();

    function checkPagePosition(page, position) {
        let nbPage = page.pageSize;
        while (nbPage--) {
            if (!listNum.has(position)) {
                return false;
            }
            position++;
        }
        return true;
    }

    function setPagePosition(page, position) {
        if (!checkPagePosition(page, position)) {
            return false;
        }
        let nbPage = page.pageSize;
        while (nbPage--) {
            page.tempPageNum.push(position);
            tempNumPages.set(position, page);
            listNum.delete(position);
            position++;
        }

        return true;
    }

    function removePagePosition(page) {
        page.tempPageNum.forEach(position => {
            tempNumPages.delete(position);
            listNum.add(position);
        });
        page.tempPageNum = [];
    }
    function addChildren(page) {
        const pageId = page.id;
        if (handled.has(pageId)) {
            return;
        }
        page.navigateTo.forEach(id => {
            pages.get(id).tempParents.push(pageId);
            if (!handled.has(id)) {
                todo.push(pages.get(id));
            }
        });
    }
    function positionLikeness(page, position) { // todo cache for perf
        const neighbours = page.navigateTo.concat(page.tempParents)
            .map(id => pages.get(id).tempPageNum)
            .flat(Infinity)
            .filter(val => !!val)
            .map(val => Math.abs(position - val));

        const rslt = Math.min(...neighbours);
        return rslt;
    }

    function freePosition(position, size) {
        const pageList = new Set();
        while (size--) {
            const page = tempNumPages.get(position);
            if (page) {
                if (page.pageNumFrozen) {
                    return false;
                }
                pageList.add(page);
            }
            position++;
        }
        pageList.forEach(page => {
            page.tempCost++;
            removePagePosition(page);
        });
        return true;
    }

    function findPosition(page, security = 100) {
        if (!security) {
            return false;
        }
        const availableNum = Array.from(listNum).sort((a, b) => positionLikeness(page, b) - positionLikeness(page, a));
        if (availableNum.length === 0) {
            return false;
        }
        const isSet = availableNum.some(num => setPagePosition(page, num));
        if (!isSet) {
            // TODO:  sort num from size and cost
            const pageUsed = availableNum;
            const hasNewAvailable = pageUsed.some(position => freePosition(position, page.pageSize));
            if (!hasNewAvailable) {
                return false;
            }
            return findPosition(page, security - 1);
        }
        return true;
    }

    // initialize
    let x, page;
    for (x = min; x <= max; x++) {
        listNum.add(x);
    }

    // check for frozen pages
    for ([x, page] of pages) {
        if (page.pageNumFrozen) {
            if (!page.pageNum.every(num => {
                tempNumPages.set(num, page);
                page.tempPageNum.push(num);
                return listNum.delete(num);
            }) && !force) {
                return 'There some pages which are set to the same position';
            }
        }
    }

    // try to position first page
    if (!firstPage.pageNumFrozen) {
        const availableNum = Array.from(listNum).sort((a, b) => a - b);
        const isSet = availableNum.some(num => setPagePosition(firstPage, num));
        if (!isSet && !force) {
            return 'No space for first page';
        }
    }

    // try to position all pages
    const todo = [];
    const handled = new Set();
    let currentPage = firstPage;

    while (currentPage) {
        addChildren(currentPage);
        if (!currentPage.pageNumFrozen && currentPage !== firstPage) {
            const hasSetPosition = findPosition(currentPage);
            if (!hasSetPosition && !force) {
                return 'No space for page ' + currentPage.title;
            }
        }
        handled.add(currentPage.id);
        currentPage = todo.shift();
    }

    // assign position to pages
    availableNumPage.clear();
    numPages.clear();
    minNum = min;
    maxNum = max;
    listNum.forEach(num => availableNumPage.add(num));
    tempNumPages.forEach((page, num) => numPages.set(num, page));
    pages.forEach(page => page.updatePageNum());

    // clean up (maybe not needed)
    tempNumPages.clear();
    listNum.clear();

    return '';
}

//TODO a method to retrieve pages in pageNum order (this could help test also)

export default Page;
