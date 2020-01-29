let uid = 0;

function Page(options = {}) {
    this.title = options.title || '';
    this.id = options.id || ++uid;
    this.pageNum = options.pageNum || [];
    this.pageNumFrozen = typeof options.pageNumFrozen === 'boolean' ? options.pageNumFrozen : false;
    this.navigateTo = options.navigateTo || [];
    this.pageSize = options.pageSize || 1;

    this.text = options.text || '';
    this.imageDesc = options.imageDesc || '';
    this.footerDesc = options.footerDesc || '';
    this.headerDesc = options.headerDesc || '';
    this.comment = options.comment|| '';

    this.tempPageNum = [];
    this.tempParents = [];
    this.tempCost = 0;
}

Page.prototype.updatePageNum = function() {
    if (!this.pageNumFrozen) {
        this.pageNum = this.tempPageNum;
    }
    this.tempPageNum = [];
    this.tempParents = [];
    this.tempCost = 0;
};

export default Page;
