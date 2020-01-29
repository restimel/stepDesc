import Page from '@/models/Page.js';

describe('Page.js', () => {
    it('should create new Page', () => {
        const page = new Page();
        const page2 = new Page();

        expect(page).toBeInstanceOf(Page);
        expect(page.title).toBe('');
        expect(page.id).toBe(1);
        expect(page.pageNum).toEqual([]);
        expect(page.pageNumFrozen).toEqual(false);
        expect(page.navigateTo).toEqual([]);
        expect(page.pageSize).toEqual(1);
        expect(page.text).toEqual('');
        expect(page.imageDesc).toEqual('');
        expect(page.footerDesc).toEqual('');
        expect(page.headerDesc).toEqual('');
        expect(page.comment).toEqual('');

        expect(page.tempPageNum).toEqual([]);
        expect(page.tempParents).toEqual([]);
        expect(page.tempCost).toEqual(0);

        expect(page2.id).toBe(2);
    });

    it('should set default value', () => {
        const page = new Page({
            title: 'toto',
            id: 42,
            pageNum: [1, 2],
            pageNumFrozen: true,
            navigateTo: [2, 5],
            pageSize: 2,
            text: 'hello you',
            imageDesc: 'an image',
            footerDesc: 'a description',
            headerDesc: 'another description',
            comment: 'a comment',
        });

        expect(page).toBeInstanceOf(Page);
        expect(page.title).toBe('toto');
        expect(page.id).toBe(42);
        expect(page.pageNum).toEqual([1, 2]);
        expect(page.pageNumFrozen).toEqual(true);
        expect(page.navigateTo).toEqual([2, 5]);
        expect(page.pageSize).toEqual(2);
        expect(page.text).toEqual('hello you');
        expect(page.imageDesc).toEqual('an image');
        expect(page.footerDesc).toEqual('a description');
        expect(page.headerDesc).toEqual('another description');
        expect(page.comment).toEqual('a comment');
    });

    describe('updatePageNum', () => {
        it('should update temp information', () => {
            const page = new Page();
            page.tempPageNum = [1, 2];
            page.tempParents = new Page();
            page.tempCost = 42;

            page.updatePageNum();

            expect(page.pageNum).toEqual([1, 2]);
            expect(page.tempPageNum).toEqual([]);
            expect(page.tempParents).toEqual([]);
            expect(page.tempCost).toEqual(0);
        });

        it('should not update frozen page', () => {
            const page = new Page({
                id: 10,
                pageNum: [11, 12],
                pageNumFrozen: true,
            });
            page.tempPageNum = [1, 2];
            page.tempParents = new Page();
            page.tempCost = 42;

            page.updatePageNum();

            expect(page.pageNum).toEqual([11, 12]);
            expect(page.tempPageNum).toEqual([]);
            expect(page.tempParents).toEqual([]);
            expect(page.tempCost).toEqual(0);
        });
    });
});
