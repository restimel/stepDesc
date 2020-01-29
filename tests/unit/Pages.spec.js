import {
    pages,
    availableNumPage,
    numPages,
    minNum,
    maxNum,
    addPage,
    removePage,
    __forTest,
} from '@/models/Pages.js';
import Page from '@/models/Page.js';
import { assignNumPage } from '../../src/models/Pages';

describe('Pages.js', () => {
    afterEach(() => {
        pages.clear();
        availableNumPage.clear();
        numPages.clear();
        __forTest(0, 0);
    });

    it('should have a Map pages', () => {
        expect(pages).toBeInstanceOf(Map);
    });

    it('should have a Set availableNumPage', () => {
        expect(availableNumPage).toBeInstanceOf(Set);
    });

    it('should have a Map pages indexed by num', () => {
        expect(numPages).toBeInstanceOf(Map);
    });

    it('should have a min and a max Num', () => {
        expect(typeof minNum).toBe('number');
        expect(minNum).toBe(0);
        expect(typeof maxNum).toBe('number');
        expect(maxNum).toBe(0);
    });

    describe('addPage', () => {
        it('should add a page', () => {
            addPage();

            expect(pages.size).toBe(1);
            expect(pages.has(1)).toBeTruthy();

            const page = pages.get(1);
            expect(page).toBeInstanceOf(Page);
        });

        it('should return the added', () => {
            const result = addPage();
            const page = pages.get(1);

            expect(result).toBeInstanceOf(Page);
            expect(result).toBe(page);
        });

        it('should add from final id', () => {
            addPage();
            addPage();
            removePage(1);
            addPage();

            expect(pages.size).toBe(2);
            expect(pages.has(3)).toBeTruthy();
            expect(pages.has(1)).toBeFalsy();
            expect(pages.has(4)).toBeFalsy();

            addPage();
            removePage(4);
            addPage();

            expect(pages.size).toBe(3);
            expect(pages.has(4)).toBeTruthy();
            expect(pages.has(5)).toBeFalsy();
        });
    });

    describe('removePage', () => {
        it('should remove a page', () => {
            addPage();
            addPage();
            const result = removePage(1);

            expect(result).toBe(true);
            expect(pages.has(1)).toBeFalsy();
            expect(pages.size).toBe(1);
        });

        it('should not remove a not existing page', () => {
            addPage();
            addPage();
            addPage();
            const result = removePage(42);

            expect(result).toBe(false);
            expect(pages.size).toBe(3);
        });

        it('should update availableNum', () => {
            const page1 = addPage();
            const page2 = addPage();

            page1.pageNum = [10, 20, 200];
            page2.pageNumFrozen = true;
            page2.pageNum = [15, 25, 205];
            __forTest(0, 100);

            removePage(page1.id);
            removePage(page2.id);

            expect(availableNumPage.size).toBe(4);
            expect(availableNumPage.has(10)).toBeTruthy();
            expect(availableNumPage.has(20)).toBeTruthy();
            expect(availableNumPage.has(200)).toBeFalsy();
            expect(availableNumPage.has(15)).toBeTruthy();
            expect(availableNumPage.has(25)).toBeTruthy();
            expect(availableNumPage.has(205)).toBeFalsy();
        });

        it('should update numPages', () => {
            const page1 = addPage();
            const page2 = addPage();

            page1.pageNum = [10, 20, 200];
            numPages.set(10, page1);
            numPages.set(20, page1);
            numPages.set(200, page1);
            page2.pageNumFrozen = true;
            page2.pageNum = [15, 25, 205];
            numPages.set(15, page2);
            numPages.set(25, page2);
            numPages.set(205, page2);
            __forTest(0, 100);

            removePage(page1.id);
            removePage(page2.id);

            expect(numPages.size).toBe(0);
            expect(numPages.has(10)).toBeFalsy();
            expect(numPages.has(20)).toBeFalsy();
            expect(numPages.has(200)).toBeFalsy();
            expect(numPages.has(15)).toBeFalsy();
            expect(numPages.has(25)).toBeFalsy();
            expect(numPages.has(205)).toBeFalsy();
        });
    });

    describe('assignNumPage', () => {
        function buildLine(nbPage, size = 1) {
            const lastPage = addPage();
            let firstPage = lastPage;

            lastPage.title = 'auto page ' + nbPage;
            lastPage.pageSize = size;

            while(--nbPage) {
                const page = addPage();
                page.title = 'auto page ' + nbPage;
                page.pageSize = size;
                page.navigateTo = [firstPage.id];
                firstPage = page;
            }

            return {
                firstPage,
                lastPage,
            };
        }

        it('should update global information', () => {
            const first = addPage();
            const rslt = assignNumPage(10, 100, first);

            expect(rslt).toBe('');
            expect(minNum).toBe(10);
            expect(maxNum).toBe(100);
            expect(pages.size).toBe(1);
            expect(numPages.size).toBe(1);
            expect(availableNumPage.size).toBe(90); // there are 91 page num to assign
            expect(numPages.get(10)).toBe(first);
        });

        it('should not update global information', () => {
            const first = addPage();
            first.pageSize = 5;
            const rslt = assignNumPage(10, 12, first);

            expect(rslt).toBe('No space for first page');
            expect(minNum).toBe(0);
            expect(maxNum).toBe(0);
            expect(pages.size).toBe(1);
            expect(availableNumPage.size).toBe(0);
            expect(numPages.size).toBe(0);
        });

        it('should assign pages to num', () => {
            const nbPage = 5;
            const {firstPage: first} = buildLine(nbPage);

            const rslt = assignNumPage(5, 5 + nbPage - 1, first);

            const second = pages.get(first.navigateTo[0]);

            expect(rslt).toBe('');
            expect(first.pageNum).toEqual([5]);
            expect(second.pageNum).not.toEqual([6]);
            expect(availableNumPage.size).toBe(0);
            expect(numPages.size).toBe(nbPage);
        });

        it('should have more space available', () => {
            const nbPage = 5;
            const { firstPage: first } = buildLine(nbPage);

            const rslt = assignNumPage(100, 100 + nbPage + 9, first);

            expect(rslt).toBe('');
            expect(first.pageNum).toEqual([100]);
            expect(availableNumPage.size).toBe(10);
            expect(numPages.size).toBe(nbPage);
        });

        it('should have not enough space available', () => {
            const nbPage = 5;
            const { firstPage: first } = buildLine(nbPage);

            const rslt = assignNumPage(10, 10 + nbPage - 2, first);

            expect(rslt).toBe('No space for page auto page ' + nbPage);
            expect(first.pageNum).toEqual([]);
            expect(minNum).toBe(0);
            expect(maxNum).toBe(0);
            expect(availableNumPage.size).toBe(0);
            expect(numPages.size).toBe(0);
        });

        it('should assign pages with size to num', () => {
            const nbPage = 5;
            const { firstPage: first } = buildLine(nbPage, 3);
            const second = pages.get(first.navigateTo[0]);
            second.pageNum = [2];

            const rslt = assignNumPage(1, 3 * nbPage, first);

            expect(rslt).toBe('');
            expect(first.pageNum).toEqual([1, 2, 3]);
            expect(second.pageNum.includes(2)).toBeFalsy();
            expect(second.pageNum.includes(4)).toBeFalsy();
            expect(availableNumPage.size).toBe(0);
            expect(numPages.size).toBe(nbPage * 3);
            expect(numPages.get(2)).toBe(first);
        });

        it('should not change frozen position', () => {
            const { firstPage: first1, lastPage: last1 } = buildLine(5, 1);
            const { firstPage: first2, lastPage: last2 } = buildLine(3, 1);

            last1.navigateTo = [first2.id];
            first2.pageNum = [7];
            first2.pageNumFrozen = true;
            last1.pageNum = [3];
            last1.pageNumFrozen = true;
            last2.pageNum = [6];
            last2.pageNumFrozen = true;

            const second2 = pages.get(first2.navigateTo[0]);

            const rslt = assignNumPage(1, 8, first1);

            expect(rslt).toBe('');
            expect(first1.pageNum).toEqual([1]);
            expect(first2.pageNum).toEqual([7]);
            expect(last1.pageNum).toEqual([3]);
            expect(last2.pageNum).toEqual([6]);
            expect(second2.pageNum).not.toEqual([]);
            expect(availableNumPage.size).toBe(0);
            expect(numPages.size).toBe(8);
        });

        it('should not validate when frozen position are outside scope', () => {
            const nbPage = 5;
            const { firstPage: first, lastPage: last } = buildLine(nbPage);

            last.pageNum = [2, 100];
            last.pageNumFrozen = true;

            const rslt = assignNumPage(1, nbPage, first);

            expect(rslt).toBe('There some pages which are set to the same position');
        });

        xit('should have a good repartition', () => {
            const { firstPage: first1, lastPage: last1 } = buildLine(5, 1);

            const second1 = pages.get(first1.navigateTo[0]);
            const third1 = pages.get(second1.navigateTo[0]);
            const fourth1 = pages.get(third1.navigateTo[0]);

            const rslt = assignNumPage(1, 5, first1);

            expect(rslt).toBe('');
            expect(numPages.get(1)).toBe(first1);
            expect(numPages.get(2)).toBe(third1);
            expect(numPages.get(3)).toBe(last1);
            expect(numPages.get(4)).toBe(second1);
            expect(numPages.get(5)).toBe(fourth1);
        });

        describe('complex case', () => {
            it('should work with frozen and different size', () => {
                const { firstPage: first1, lastPage: last1 } = buildLine(5, 3);
                const { firstPage: first2, lastPage: last2 } = buildLine(3, 1);

                last1.navigateTo = [first2.id];
                first1.pageNum = [1, 2, 3];
                first1.pageNumFrozen = true;
                first2.pageNum = [5];
                first2.pageNumFrozen = true;

                const second2 = pages.get(first2.navigateTo[0]);

                const rslt = assignNumPage(1, 18, first1);

                expect(rslt).toBe('');
                expect(first1.pageNum).toEqual([1, 2, 3]);
                expect(first2.pageNum).toEqual([5]);
                expect(availableNumPage.size).toBe(0);
                expect([second2, last2].includes(numPages.get(4))).toBeTruthy();
            });

            it('should work with different branch', () => {
                const { firstPage: first1, lastPage: last1 } = buildLine(5, 2);
                const { firstPage: first2/*, lastPage: last2 */} = buildLine(3, 1);
                const { firstPage: first3/*, lastPage: last3 */} = buildLine(4, 1);
                const { firstPage: first4/*, lastPage: last4 */} = buildLine(5, 2);

                last1.navigateTo = [first2.id, first3.id, first4.id];
                first1.pageNum = [1, 2];
                first1.pageNumFrozen = true;

                // const second2 = pages.get(first2.navigateTo[0]);

                const rslt = assignNumPage(1, 30, first1);

                expect(rslt).toBe('');
                expect(first1.pageNum).toEqual([1, 2]);
                expect(availableNumPage.size).toBe(3);
                expect(numPages.size).toBe(27);
            });

            xit('should have a good repartition with different branch', () => {

            });
        });
    });
});
