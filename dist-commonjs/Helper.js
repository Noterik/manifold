"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MultiSelectState_1 = require("./MultiSelectState");
var MetadataGroup_1 = require("./MetadataGroup");
var TreeSortType_1 = require("./TreeSortType");
var vocabulary_1 = require("@iiif/vocabulary");
var Errors_1 = require("./Errors");
var manifesto_js_1 = require("manifesto.js");
var Helper = /** @class */ (function () {
    function Helper(options) {
        this.options = options;
        this.iiifResource = this.options.iiifResource;
        this.manifestUri = this.options.manifestUri;
        this.manifest = this.options.manifest;
        this.collectionIndex = this.options.collectionIndex || 0;
        this.manifestIndex = this.options.manifestIndex || 0;
        this.sequenceIndex = this.options.sequenceIndex || 0;
        this.canvasIndex = this.options.canvasIndex || 0;
    }
    // getters //
    Helper.prototype.getAutoCompleteService = function () {
        var service = this.getSearchService();
        var autoCompleteService = null;
        if (service) {
            autoCompleteService = service.getService(vocabulary_1.ServiceProfile.SEARCH_0_AUTO_COMPLETE);
            if (!autoCompleteService) {
                autoCompleteService = service.getService(vocabulary_1.ServiceProfile.SEARCH_1_AUTO_COMPLETE);
            }
        }
        return autoCompleteService;
    };
    Helper.prototype.getAttribution = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var attribution = this.manifest.getAttribution();
        if (attribution) {
            return manifesto_js_1.LanguageMap.getValue(attribution, this.options.locale);
        }
        return null;
    };
    Helper.prototype.getCanvases = function () {
        return this.getCurrentSequence().getCanvases();
    };
    Helper.prototype.getCanvasById = function (id) {
        return this.getCurrentSequence().getCanvasById(id);
    };
    Helper.prototype.getCanvasesById = function (ids) {
        var canvases = [];
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var canvas = this.getCanvasById(id);
            if (canvas) {
                canvases.push(canvas);
            }
        }
        return canvases;
    };
    Helper.prototype.getCanvasByIndex = function (index) {
        return this.getCurrentSequence().getCanvasByIndex(index);
    };
    Helper.prototype.getCanvasIndexById = function (id) {
        return this.getCurrentSequence().getCanvasIndexById(id);
    };
    Helper.prototype.getCanvasIndexByLabel = function (label) {
        var foliated = this.getManifestType() === manifesto_js_1.ManifestType.MANUSCRIPT;
        return this.getCurrentSequence().getCanvasIndexByLabel(label, foliated);
    };
    Helper.prototype.getCanvasRange = function (canvas, path) {
        var ranges = this.getCanvasRanges(canvas);
        if (path) {
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                if (range.path === path) {
                    return range;
                }
            }
            return null;
        }
        else {
            return ranges[0]; // else return the first range
        }
    };
    Helper.prototype.getCanvasRanges = function (canvas) {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        if (canvas.ranges) {
            return canvas.ranges; // cache
        }
        else {
            // todo: write test
            canvas.ranges = (this.manifest
                .getAllRanges()
                .filter(function (range) {
                return range
                    .getCanvasIds()
                    .some(function (cid) { return manifesto_js_1.Utils.normaliseUrl(cid) === manifesto_js_1.Utils.normaliseUrl(canvas.id); });
            }));
        }
        return canvas.ranges;
    };
    Helper.prototype.getCollectionIndex = function (iiifResource) {
        // todo: this only works for collections nested one level deep
        if (iiifResource.parentCollection &&
            !iiifResource.parentCollection.parentCollection) {
            // manifest must be in the root
            return undefined;
        }
        else if (iiifResource.parentCollection) {
            return iiifResource.parentCollection.index;
        }
        return undefined;
    };
    Helper.prototype.getCurrentCanvas = function () {
        return this.getCurrentSequence().getCanvasByIndex(this.canvasIndex);
    };
    Helper.prototype.getCurrentSequence = function () {
        return this.getSequenceByIndex(this.sequenceIndex);
    };
    Helper.prototype.getDescription = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var description = this.manifest.getDescription();
        if (description) {
            return manifesto_js_1.LanguageMap.getValue(description, this.options.locale);
        }
        return null;
    };
    Helper.prototype.getLabel = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var label = this.manifest.getLabel();
        if (label) {
            return manifesto_js_1.LanguageMap.getValue(label, this.options.locale);
        }
        return null;
    };
    Helper.prototype.getLastCanvasLabel = function (alphanumeric) {
        return this.getCurrentSequence().getLastCanvasLabel(alphanumeric);
    };
    Helper.prototype.getFirstPageIndex = function () {
        return 0; // why is this needed?
    };
    Helper.prototype.getLastPageIndex = function () {
        return this.getTotalCanvases() - 1;
    };
    Helper.prototype.getLicense = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getLicense();
    };
    Helper.prototype.getLogo = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getLogo();
    };
    Helper.prototype.getManifestType = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var manifestType = this.manifest.getManifestType();
        // default to monograph
        if (manifestType === manifesto_js_1.ManifestType.EMPTY) {
            manifestType = manifesto_js_1.ManifestType.MONOGRAPH;
        }
        return manifestType;
    };
    Helper.prototype.getMetadata = function (options) {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var metadataGroups = [];
        var manifestMetadata = this.manifest.getMetadata();
        var manifestGroup = new MetadataGroup_1.MetadataGroup(this.manifest);
        var locale = this.options.locale; // this will always default to en-GB
        if (manifestMetadata && manifestMetadata.length) {
            manifestGroup.addMetadata(manifestMetadata, true);
        }
        if (this.manifest.getDescription().length) {
            var metadataItem = new manifesto_js_1.LabelValuePair(locale);
            metadataItem.label = [new manifesto_js_1.Language("description", locale)];
            metadataItem.value = this.manifest.getDescription();
            metadataItem.isRootLevel = true;
            manifestGroup.addItem(metadataItem);
        }
        if (this.manifest.getAttribution().length) {
            var metadataItem = new manifesto_js_1.LabelValuePair(locale);
            metadataItem.label = [new manifesto_js_1.Language("attribution", locale)];
            metadataItem.value = this.manifest.getAttribution();
            metadataItem.isRootLevel = true;
            manifestGroup.addItem(metadataItem);
        }
        var license = this.manifest.getLicense();
        if (license) {
            var item = {
                label: "license",
                value: options && options.licenseFormatter
                    ? options.licenseFormatter.format(license)
                    : license
            };
            var metadataItem = new manifesto_js_1.LabelValuePair(locale);
            metadataItem.parse(item);
            metadataItem.isRootLevel = true;
            manifestGroup.addItem(metadataItem);
        }
        if (this.manifest.getLogo()) {
            var item = {
                label: "logo",
                value: '<img src="' + this.manifest.getLogo() + '"/>'
            };
            var metadataItem = new manifesto_js_1.LabelValuePair(locale);
            metadataItem.parse(item);
            metadataItem.isRootLevel = true;
            manifestGroup.addItem(metadataItem);
        }
        metadataGroups.push(manifestGroup);
        if (options) {
            return this._parseMetadataOptions(options, metadataGroups);
        }
        else {
            return metadataGroups;
        }
    };
    Helper.prototype.getRequiredStatement = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var requiredStatement = this.manifest.getRequiredStatement();
        if (requiredStatement) {
            return {
                label: requiredStatement.getLabel(),
                value: requiredStatement.getValue()
            };
        }
        return null;
    };
    Helper.prototype._parseMetadataOptions = function (options, metadataGroups) {
        // get sequence metadata
        var sequence = this.getCurrentSequence();
        var sequenceMetadata = sequence.getMetadata();
        if (sequenceMetadata && sequenceMetadata.length) {
            var sequenceGroup = new MetadataGroup_1.MetadataGroup(sequence);
            sequenceGroup.addMetadata(sequenceMetadata);
            metadataGroups.push(sequenceGroup);
        }
        // get range metadata
        if (options.range) {
            var rangeGroups = this._getRangeMetadata([], options.range);
            rangeGroups = rangeGroups.reverse();
            metadataGroups = metadataGroups.concat(rangeGroups);
        }
        // get canvas metadata
        if (options.canvases && options.canvases.length) {
            for (var i = 0; i < options.canvases.length; i++) {
                var canvas = options.canvases[i];
                var canvasMetadata = canvas.getMetadata();
                if (canvasMetadata && canvasMetadata.length) {
                    var canvasGroup = new MetadataGroup_1.MetadataGroup(canvas);
                    canvasGroup.addMetadata(canvas.getMetadata());
                    metadataGroups.push(canvasGroup);
                }
                // add image metadata
                var images = canvas.getImages();
                for (var j = 0; j < images.length; j++) {
                    var image = images[j];
                    var imageMetadata = image.getMetadata();
                    if (imageMetadata && imageMetadata.length) {
                        var imageGroup = new MetadataGroup_1.MetadataGroup(image);
                        imageGroup.addMetadata(imageMetadata);
                        metadataGroups.push(imageGroup);
                    }
                }
            }
        }
        return metadataGroups;
    };
    Helper.prototype._getRangeMetadata = function (metadataGroups, range) {
        var rangeMetadata = range.getMetadata();
        if (rangeMetadata && rangeMetadata.length) {
            var rangeGroup = new MetadataGroup_1.MetadataGroup(range);
            rangeGroup.addMetadata(rangeMetadata);
            metadataGroups.push(rangeGroup);
        }
        else if (range.parentRange) {
            return this._getRangeMetadata(metadataGroups, range.parentRange);
        }
        return metadataGroups;
    };
    Helper.prototype.getMultiSelectState = function () {
        if (!this._multiSelectState) {
            this._multiSelectState = new MultiSelectState_1.MultiSelectState();
            this._multiSelectState.ranges = this.getRanges().slice(0);
            this._multiSelectState.canvases = (this.getCurrentSequence()
                .getCanvases()
                .slice(0));
        }
        return this._multiSelectState;
    };
    Helper.prototype.getCurrentRange = function () {
        if (this.rangeId) {
            return this.getRangeById(this.rangeId);
        }
        return null;
    };
    Helper.prototype.getPosterCanvas = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getPosterCanvas();
    };
    Helper.prototype.getPosterImage = function () {
        var posterCanvas = this.getPosterCanvas();
        if (posterCanvas) {
            var content = posterCanvas.getContent();
            if (content && content.length) {
                var anno = content[0];
                var body = anno.getBody();
                return body[0].id;
            }
        }
        return null;
    };
    Helper.prototype.getPreviousRange = function (range) {
        var currentRange = null;
        if (range) {
            currentRange = range;
        }
        else {
            currentRange = this.getCurrentRange();
        }
        if (currentRange) {
            var flatTree = this.getFlattenedTree();
            if (flatTree) {
                for (var i = 0; i < flatTree.length; i++) {
                    var node = flatTree[i];
                    // find current range in flattened tree
                    if (node && node.data.id === currentRange.id) {
                        // find the first node before it that has canvases
                        while (i > 0) {
                            i--;
                            var prevNode = flatTree[i];
                            return prevNode.data;
                        }
                        break;
                    }
                }
            }
        }
        return null;
    };
    Helper.prototype.getNextRange = function (range) {
        // if a range is passed, use that. otherwise get the current range.
        var currentRange = null;
        if (range) {
            currentRange = range;
        }
        else {
            currentRange = this.getCurrentRange();
        }
        if (currentRange) {
            var flatTree = this.getFlattenedTree();
            if (flatTree) {
                for (var i = 0; i < flatTree.length; i++) {
                    var node = flatTree[i];
                    // find current range in flattened tree
                    if (node && node.data.id === currentRange.id) {
                        // find the first node after it that has canvases
                        while (i < flatTree.length - 1) {
                            i++;
                            var nextNode = flatTree[i];
                            if (nextNode.data.canvases && nextNode.data.canvases.length) {
                                return nextNode.data;
                            }
                        }
                        break;
                    }
                }
            }
        }
        return null;
    };
    Helper.prototype.getFlattenedTree = function (treeNode) {
        var t = null;
        if (!treeNode) {
            t = this.getTree();
        }
        else {
            t = treeNode;
        }
        if (t) {
            return this._flattenTree(t, "nodes");
        }
        return null;
    };
    // use object.assign to return a set of new nodes
    // right now the UV needs the nodes to retain properties for databinding like expanded
    // as we're not redrawing the tree every time as per react.
    // maybe make this optional.
    // not sure why deleting the nodes key from each node is necessary
    Helper.prototype._flattenTree = function (root, key) {
        var _this = this;
        var flatten = [root]; //[Object.assign({}, root)];
        //delete flatten[0][key];
        if (root[key] && root[key].length > 0) {
            return flatten.concat(root[key]
                .map(function (child) { return _this._flattenTree(child, key); })
                .reduce(function (a, b) { return a.concat(b); }, []));
        }
        return flatten;
    };
    Helper.prototype.getRanges = function () {
        return this.manifest.getAllRanges();
    };
    Helper.prototype.getRangeByPath = function (path) {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getRangeByPath(path);
    };
    Helper.prototype.getRangeById = function (id) {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getRangeById(id);
    };
    Helper.prototype.getRangeCanvases = function (range) {
        var ids = range.getCanvasIds();
        return this.getCanvasesById(ids);
    };
    Helper.prototype.getRelated = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getRelated();
    };
    Helper.prototype.getSearchService = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var service = this.manifest.getService(vocabulary_1.ServiceProfile.SEARCH_0);
        if (!service) {
            service = this.manifest.getService(vocabulary_1.ServiceProfile.SEARCH_1);
        }
        return service;
    };
    Helper.prototype.getSeeAlso = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getSeeAlso();
    };
    Helper.prototype.getSequenceByIndex = function (index) {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getSequenceByIndex(index);
    };
    Helper.prototype.getShareServiceUrl = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var url = null;
        var shareService = this.manifest.getService(vocabulary_1.ServiceProfile.SHARE_EXTENSIONS);
        if (shareService) {
            if (shareService.length) {
                shareService = shareService[0];
            }
            url = shareService.__jsonld.shareUrl;
        }
        return url;
    };
    Helper.prototype._getSortedTreeNodesByDate = function (sortedTree, tree) {
        // const all: TreeNode[] = <TreeNode[]>tree.nodes.en().traverseUnique(node => node.nodes)
        //     .where((n) => n.data.type === TreeNodeType.COLLECTION ||
        //                 n.data.type === TreeNodeType.MANIFEST).toArray();
        var flattenedTree = this.getFlattenedTree(tree);
        // const manifests: TreeNode[] = <TreeNode[]>tree.nodes.en().traverseUnique(n => n.nodes)
        //     .where((n) => n.data.type === TreeNodeType.MANIFEST).toArray();
        if (flattenedTree) {
            var manifests = flattenedTree.filter(function (n) { return n.data.type === manifesto_js_1.TreeNodeType.MANIFEST; });
            this.createDecadeNodes(sortedTree, flattenedTree);
            this.sortDecadeNodes(sortedTree);
            this.createYearNodes(sortedTree, flattenedTree);
            this.sortYearNodes(sortedTree);
            this.createMonthNodes(sortedTree, manifests);
            this.sortMonthNodes(sortedTree);
            this.createDateNodes(sortedTree, manifests);
            this.pruneDecadeNodes(sortedTree);
        }
    };
    Helper.prototype.getStartCanvasIndex = function () {
        return this.getCurrentSequence().getStartCanvasIndex();
    };
    Helper.prototype.getThumbs = function (width, height) {
        return this.getCurrentSequence().getThumbs(width, height);
    };
    Helper.prototype.getTopRanges = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getTopRanges();
    };
    Helper.prototype.getTotalCanvases = function () {
        return this.getCurrentSequence().getTotalCanvases();
    };
    Helper.prototype.getTrackingLabel = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.getTrackingLabel();
    };
    Helper.prototype._getTopRanges = function () {
        return this.iiifResource.getTopRanges();
    };
    Helper.prototype.getTree = function (topRangeIndex, sortType) {
        // if it's a collection, use IIIFResource.getDefaultTree()
        // otherwise, get the top range by index and use Range.getTree()
        if (topRangeIndex === void 0) { topRangeIndex = 0; }
        if (sortType === void 0) { sortType = TreeSortType_1.TreeSortType.NONE; }
        if (!this.iiifResource) {
            return null;
        }
        var tree;
        if (this.iiifResource.isCollection()) {
            tree = this.iiifResource.getDefaultTree();
        }
        else {
            var topRanges = this._getTopRanges();
            var root = new manifesto_js_1.TreeNode();
            root.label = "root";
            root.data = this.iiifResource;
            if (topRanges.length) {
                var range = topRanges[topRangeIndex];
                tree = range.getTree(root);
            }
            else {
                return root;
            }
        }
        var sortedTree = new manifesto_js_1.TreeNode();
        switch (sortType.toString()) {
            case TreeSortType_1.TreeSortType.DATE.toString():
                // returns a list of treenodes for each decade.
                // expanding a decade generates a list of years
                // expanding a year gives a list of months containing issues
                // expanding a month gives a list of issues.
                if (this.treeHasNavDates(tree)) {
                    this._getSortedTreeNodesByDate(sortedTree, tree);
                    break;
                }
            default:
                sortedTree = tree;
        }
        return sortedTree;
    };
    Helper.prototype.treeHasNavDates = function (tree) {
        //const node: TreeNode = tree.nodes.en().traverseUnique(node => node.nodes).where((n) => !isNaN(<any>n.navDate)).first();
        // todo: write test
        var flattenedTree = this.getFlattenedTree(tree);
        return flattenedTree
            ? flattenedTree.some(function (n) { return !isNaN(n.navDate); })
            : false;
    };
    Helper.prototype.getViewingDirection = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var viewingDirection = this.getCurrentSequence().getViewingDirection();
        if (!viewingDirection) {
            viewingDirection = this.manifest.getViewingDirection();
        }
        return viewingDirection;
    };
    Helper.prototype.getViewingHint = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var viewingHint = this.getCurrentSequence().getViewingHint();
        if (!viewingHint) {
            viewingHint = this.manifest.getViewingHint();
        }
        return viewingHint;
    };
    // inquiries //
    Helper.prototype.hasParentCollection = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return !!this.manifest.parentCollection;
    };
    Helper.prototype.hasRelatedPage = function () {
        var related = this.getRelated();
        if (!related)
            return false;
        if (related.length) {
            related = related[0];
        }
        return related["format"] === "text/html";
    };
    Helper.prototype.hasResources = function () {
        var canvas = this.getCurrentCanvas();
        return canvas.getResources().length > 0;
    };
    Helper.prototype.isBottomToTop = function () {
        var viewingDirection = this.getViewingDirection();
        if (viewingDirection) {
            return viewingDirection === vocabulary_1.ViewingDirection.BOTTOM_TO_TOP;
        }
        return false;
    };
    Helper.prototype.isCanvasIndexOutOfRange = function (index) {
        return this.getCurrentSequence().isCanvasIndexOutOfRange(index);
    };
    Helper.prototype.isContinuous = function () {
        var viewingHint = this.getViewingHint();
        if (viewingHint) {
            return viewingHint === vocabulary_1.ViewingHint.CONTINUOUS;
        }
        return false;
    };
    Helper.prototype.isFirstCanvas = function (index) {
        if (typeof index !== "undefined") {
            return this.getCurrentSequence().isFirstCanvas(index);
        }
        return this.getCurrentSequence().isFirstCanvas(this.canvasIndex);
    };
    Helper.prototype.isHorizontallyAligned = function () {
        return this.isLeftToRight() || this.isRightToLeft();
    };
    Helper.prototype.isLastCanvas = function (index) {
        if (typeof index !== "undefined") {
            return this.getCurrentSequence().isLastCanvas(index);
        }
        return this.getCurrentSequence().isLastCanvas(this.canvasIndex);
    };
    Helper.prototype.isLeftToRight = function () {
        var viewingDirection = this.getViewingDirection();
        if (viewingDirection) {
            return viewingDirection === vocabulary_1.ViewingDirection.LEFT_TO_RIGHT;
        }
        return false;
    };
    Helper.prototype.isMultiCanvas = function () {
        return this.getCurrentSequence().isMultiCanvas();
    };
    Helper.prototype.isMultiSequence = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return this.manifest.isMultiSequence();
    };
    Helper.prototype.isPaged = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        // check the sequence for a viewingHint (deprecated)
        var viewingHint = this.getViewingHint();
        if (viewingHint) {
            return viewingHint === vocabulary_1.ViewingHint.PAGED;
        }
        // check the manifest for a viewingHint (deprecated) or paged behavior
        return this.manifest.isPagingEnabled();
    };
    Helper.prototype.isPagingAvailable = function () {
        // paged mode is useless unless you have at least 3 pages...
        return this.isPagingEnabled() && this.getTotalCanvases() > 2;
    };
    Helper.prototype.isPagingEnabled = function () {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        return (this.manifest.isPagingEnabled() ||
            this.getCurrentSequence().isPagingEnabled());
    };
    Helper.prototype.isRightToLeft = function () {
        var viewingDirection = this.getViewingDirection();
        if (viewingDirection) {
            return viewingDirection === vocabulary_1.ViewingDirection.RIGHT_TO_LEFT;
        }
        return false;
    };
    Helper.prototype.isTopToBottom = function () {
        var viewingDirection = this.getViewingDirection();
        if (viewingDirection) {
            return viewingDirection === vocabulary_1.ViewingDirection.TOP_TO_BOTTOM;
        }
        return false;
    };
    Helper.prototype.isTotalCanvasesEven = function () {
        return this.getCurrentSequence().isTotalCanvasesEven();
    };
    Helper.prototype.isUIEnabled = function (name) {
        if (!this.manifest) {
            throw new Error(Errors_1.Errors.manifestNotLoaded);
        }
        var uiExtensions = this.manifest.getService(vocabulary_1.ServiceProfile.UI_EXTENSIONS);
        if (uiExtensions) {
            var disableUI = uiExtensions.getProperty("disableUI");
            if (disableUI) {
                if (disableUI.indexOf(name) !== -1 ||
                    disableUI.indexOf(name.toLowerCase()) !== -1) {
                    return false;
                }
            }
        }
        return true;
    };
    Helper.prototype.isVerticallyAligned = function () {
        return this.isTopToBottom() || this.isBottomToTop();
    };
    // dates //
    Helper.prototype.createDateNodes = function (rootNode, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var year = this.getNodeYear(node);
            var month = this.getNodeMonth(node);
            var dateNode = new manifesto_js_1.TreeNode();
            dateNode.id = node.id;
            dateNode.label = this.getNodeDisplayDate(node);
            dateNode.data = node.data;
            dateNode.data.type = manifesto_js_1.TreeNodeType.MANIFEST;
            dateNode.data.year = year;
            dateNode.data.month = month;
            var decadeNode = this.getDecadeNode(rootNode, year);
            if (decadeNode) {
                var yearNode = this.getYearNode(decadeNode, year);
                if (yearNode) {
                    var monthNode = this.getMonthNode(yearNode, month);
                    if (monthNode) {
                        monthNode.addNode(dateNode);
                    }
                }
            }
        }
    };
    Helper.prototype.createDecadeNodes = function (rootNode, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.navDate) {
                continue;
            }
            var year = this.getNodeYear(node);
            var endYear = Number(year.toString().substr(0, 3) + "9");
            if (!this.getDecadeNode(rootNode, year)) {
                var decadeNode = new manifesto_js_1.TreeNode();
                decadeNode.label = year + " - " + endYear;
                decadeNode.navDate = node.navDate;
                decadeNode.data.startYear = year;
                decadeNode.data.endYear = endYear;
                rootNode.addNode(decadeNode);
            }
        }
    };
    Helper.prototype.createMonthNodes = function (rootNode, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.navDate) {
                continue;
            }
            var year = this.getNodeYear(node);
            var month = this.getNodeMonth(node);
            var decadeNode = this.getDecadeNode(rootNode, year);
            var yearNode = null;
            if (decadeNode) {
                yearNode = this.getYearNode(decadeNode, year);
            }
            if (decadeNode && yearNode && !this.getMonthNode(yearNode, month)) {
                var monthNode = new manifesto_js_1.TreeNode();
                monthNode.label = this.getNodeDisplayMonth(node);
                monthNode.navDate = node.navDate;
                monthNode.data.year = year;
                monthNode.data.month = month;
                yearNode.addNode(monthNode);
            }
        }
    };
    Helper.prototype.createYearNodes = function (rootNode, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.navDate) {
                continue;
            }
            var year = this.getNodeYear(node);
            var decadeNode = this.getDecadeNode(rootNode, year);
            if (decadeNode && !this.getYearNode(decadeNode, year)) {
                var yearNode = new manifesto_js_1.TreeNode();
                yearNode.label = year.toString();
                yearNode.navDate = node.navDate;
                yearNode.data.year = year;
                decadeNode.addNode(yearNode);
            }
        }
    };
    Helper.prototype.getDecadeNode = function (rootNode, year) {
        for (var i = 0; i < rootNode.nodes.length; i++) {
            var n = rootNode.nodes[i];
            if (year >= n.data.startYear && year <= n.data.endYear)
                return n;
        }
        return null;
    };
    Helper.prototype.getMonthNode = function (yearNode, month) {
        for (var i = 0; i < yearNode.nodes.length; i++) {
            var n = yearNode.nodes[i];
            if (month === this.getNodeMonth(n))
                return n;
        }
        return null;
    };
    Helper.prototype.getNodeDisplayDate = function (node) {
        return node.navDate.toDateString();
    };
    Helper.prototype.getNodeDisplayMonth = function (node) {
        var months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        return months[node.navDate.getMonth()];
    };
    Helper.prototype.getNodeMonth = function (node) {
        return node.navDate.getMonth();
    };
    Helper.prototype.getNodeYear = function (node) {
        return node.navDate.getFullYear();
    };
    Helper.prototype.getYearNode = function (decadeNode, year) {
        for (var i = 0; i < decadeNode.nodes.length; i++) {
            var n = decadeNode.nodes[i];
            if (year === this.getNodeYear(n))
                return n;
        }
        return null;
    };
    // delete any empty decades
    Helper.prototype.pruneDecadeNodes = function (rootNode) {
        var pruned = [];
        for (var i = 0; i < rootNode.nodes.length; i++) {
            var n = rootNode.nodes[i];
            if (!n.nodes.length) {
                pruned.push(n);
            }
        }
        for (var j = 0; j < pruned.length; j++) {
            var p = pruned[j];
            var index = rootNode.nodes.indexOf(p);
            if (index > -1) {
                rootNode.nodes.splice(index, 1);
            }
        }
    };
    Helper.prototype.sortDecadeNodes = function (rootNode) {
        rootNode.nodes = rootNode.nodes.sort(function (a, b) {
            return a.data.startYear - b.data.startYear;
        });
    };
    Helper.prototype.sortMonthNodes = function (rootNode) {
        var _this = this;
        for (var i = 0; i < rootNode.nodes.length; i++) {
            var decadeNode = rootNode.nodes[i];
            for (var j = 0; j < decadeNode.nodes.length; j++) {
                var monthNode = decadeNode.nodes[j];
                monthNode.nodes = monthNode.nodes.sort(function (a, b) {
                    return _this.getNodeMonth(a) - _this.getNodeMonth(b);
                });
            }
        }
    };
    Helper.prototype.sortYearNodes = function (rootNode) {
        var _this = this;
        for (var i = 0; i < rootNode.nodes.length; i++) {
            var decadeNode = rootNode.nodes[i];
            decadeNode.nodes = decadeNode.nodes.sort(function (a, b) {
                return _this.getNodeYear(a) - _this.getNodeYear(b);
            });
        }
    };
    return Helper;
}());
exports.Helper = Helper;
//# sourceMappingURL=Helper.js.map